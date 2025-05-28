const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = require('./db/db');

// Rutas
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const sectionRoutes = require('./routes/sections');

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
