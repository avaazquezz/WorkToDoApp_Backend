require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());


// Rutas
const projectRoute = require('./routes/project');
const authRoutes = require('./routes/auth');
const sectionRoute = require('./routes/section');

app.use('/api/project', projectRoute);
app.use('/api/auth', authRoutes);
app.use('/api/section', sectionRoute);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
