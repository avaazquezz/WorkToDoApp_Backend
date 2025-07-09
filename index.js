require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());


// Rutas
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const sectionRoutes = require('./routes/sections');
const notesRoutes = require('./routes/ToDo.js');

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/notes', notesRoutes);

// Ruta de prueba para verificar el estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
