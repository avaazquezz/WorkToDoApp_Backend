require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());


// Middlewares
app.use(express.json());

// Middleware de logging para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  console.log('Request headers origin:', req.headers.origin);
  
  // Log de estado CORS
  const origin = req.headers.origin;
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin);
    console.log(`🌐 CORS: Origin ${origin} ${isAllowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  } else {
    console.log('🌐 CORS: No origin header (allowed for same-origin or tools like curl)');
  }
  
  next();
});


// Rutas
const projectRoutes = require('./routes/projects');
const authRoutes = require('./routes/auth');
const sectionRoutes = require('./routes/sections');
const notesRoutes = require('./routes/ToDo.js');

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/notes', notesRoutes);

// Middleware específico para las rutas de proyecto con secciones
app.use('/api/project/:projectId/sections', (req, res, next) => {
  console.log('🎯 PROJECT SECTIONS ROUTE CALLED:', req.method, req.originalUrl);
  console.log('🎯 Project ID:', req.params.projectId);
  console.log('🎯 Request body:', req.body);
  
  // Redirigir a la ruta correcta
  if (req.method === 'POST') {
    // Redirigir POST a /api/sections/project/:projectId
    req.url = `/project/${req.params.projectId}`;
    sectionRoutes(req, res, next);
  } else if (req.method === 'GET') {
    // Redirigir GET a /api/sections/project/:projectId
    req.url = `/project/${req.params.projectId}`;
    sectionRoutes(req, res, next);
  } else {
    next();
  }
});

// Ruta de prueba para verificar el estado del servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - debe ser el último middleware
app.use((req, res) => {
  console.log('🔍 404 - ENDPOINT NOT FOUND:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.listen(port, () => {
  console.log('🔄 Loading routes...');
  console.log('✅ Projects routes loaded');
  console.log('✅ Auth routes loaded');
  console.log('✅ Sections routes loaded');
  console.log('✅ Notes routes loaded');
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
