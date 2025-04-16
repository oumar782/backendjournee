require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const pool = require('./Config/db.js'); // ✔ Connexion PostgreSQL

const app = express();

// ✅ CORS bien configuré
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jssup.vercel.app", // ⚠️ Pas de / à la fin
      "https://backendjournee.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// 📄 Route racine pour fichier HTML (optionnelle si en API pure)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'listerecueil.html'));
});

// 📥 Enregistrement
app.post('/api/inscriptions', async (req, res) => {
  const {
    name, email, phone, country,
    willAttend, willParticipate,
    selected_activities, additionalInfo
  } = req.body;

  if (!name || !email || !willAttend) {
    return res.status(400).json({ success: false, message: "Champs requis manquants." });
  }

  if (!['oui', 'non'].includes(willAttend)) {
    return res.status(400).json({ success: false, message: "'willAttend' doit être 'oui' ou 'non'." });
  }

  const participation = ['oui', 'non'].includes(willParticipate) ? willParticipate : 'non';

  // ✅ Normalisation des activités
  let activities = null;
  if (selected_activities) {
    if (typeof selected_activities === 'string') {
      activities = selected_activities;
    } else if (Array.isArray(selected_activities)) {
      activities = selected_activities.join(', ');
    } else {
      return res.status(400).json({ success: false, message: "'selected_activities' invalide." });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO cultural_day_registrations (
        name, email, phone, country, will_attend, will_participate, 
        selected_activities, additional_info, registration_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [name, email, phone, country, willAttend, participation, activities, additionalInfo]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("❌ Erreur d'insertion :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// 📤 Récupération des inscriptions
app.get('/api/inscriptions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cultural_day_registrations ORDER BY registration_date DESC');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("❌ Erreur récupération données :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération." });
  }
});

// 🚀 Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
