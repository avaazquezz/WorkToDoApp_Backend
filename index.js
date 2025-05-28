require('dotenv').config();
import express, { json } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(json());


// Rutas
import projectRoutes from './routes/projects';
import authRoutes from './routes/auth';
import sectionRoutes from './routes/sections';

app.use('/api/projects', projectRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
