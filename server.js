require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
// 🔓 Autorise tout le monde (à éviter en prod)
app.use(cors());


// app.use(cors({
//   origin: 'https://journee-culturelle.vercel.app/', 
//   origin: ' http://localhost:5173/ ', 

//   methods: ['GET', 'POST', 'PUT', 'DELETE'], 
//   credentials: true 
// }));
// app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://journee-culturelle.vercel.app/",
      "https://backendjournee.vercel.app/",
      "https://backendjournee-v9qj.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err) => {
  if (err) console.error('❌ PostgreSQL (pg) connection error:', err);
  else console.log('✅ Connecté à PostgreSQL avec succès (pg)');
});

// Route pour servir le fichier HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'listerecueil.html'));
});

// ✅ Route POST - Enregistrement
app.post('/api/inscriptions', async (req, res) => {
  const {
    name,
    email,
    phone,
    country,
    willAttend,
    willParticipate,
    selected_activities, // Assurez-vous que ce nom correspond au champ envoyé par le frontend
    additionalInfo
  } = req.body;

  // Validation des champs obligatoires
  if (!name || !email || !willAttend) {
    return res.status(400).json({
      success: false,
      message: "Les champs 'name', 'email' et 'willAttend' sont obligatoires."
    });
  }

  // Validation de willAttend
  if (willAttend !== 'oui' && willAttend !== 'non') {
    return res.status(400).json({
      success: false,
      message: "La valeur de 'willAttend' doit être 'oui' ou 'non'."
    });
  }

  // Validation de willParticipate si présent
  let participation = 'non';
  if (willParticipate) {
    if (willParticipate !== 'oui' && willParticipate !== 'non') {
      return res.status(400).json({
        success: false,
        message: "La valeur de 'willParticipate' doit être 'oui' ou 'non'."
      });
    }
    participation = willParticipate;
  }

  // Conversion des activités sélectionnées en chaîne séparée par des virgules
  let activities = '';
  if (selected_activities) {
    if (typeof selected_activities === 'string') {
      activities = selected_activities; // Déjà une chaîne
    } else if (Array.isArray(selected_activities)) {
      activities = selected_activities.join(', '); // Convertir tableau en chaîne
    } else {
      return res.status(400).json({
        success: false,
        message: "Le champ 'selected_activities' doit être une chaîne ou un tableau."
      });
    }
  }

  try {
    // Insertion dans la base de données
    const result = await pool.query(
      `INSERT INTO cultural_day_registrations (
        name, email, phone, country, will_attend, will_participate, 
        selected_activities, additional_info, registration_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [name, email, phone, country, willAttend, participation, activities, additionalInfo]
    );

    // Réponse réussie
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur d'insertion :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de l'enregistrement" });
  }
});

// ✅ Route GET - Liste des inscriptions
app.get('/api/inscriptions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cultural_day_registrations ORDER BY registration_date DESC');
    res.status(200).json({ success: true, data: result.rows });
    console.log("API request body:", req.body)

  } catch (error) {
    console.error("❌ Erreur récupération données :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération" });
    console.log("API request body:", req.body)

  }
});

// ✅ Serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});