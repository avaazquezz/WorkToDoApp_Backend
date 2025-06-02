
-- Usuarios
INSERT INTO users (name, email, password, is_premium) VALUES 
  ('Diego Jols', 'diegojo@todoapp.com', 'hashedpassword123', TRUE),
  ('Laura Torres', 'laura@example.com', 'hashedpassword456', FALSE),
  ('Carlos Pérez', 'carlos@example.com', 'hashedpassword789', TRUE),
  ('Ana Gómez', 'ana@example.com', 'hashedpassword101', FALSE);

-- Proyectos
INSERT INTO projects (name, color, description, created_by, created_at) VALUES 
  ('Proyecto Hogar', '#FF5733', 'Proyecto para tareas del hogar', 1, 1716800000000),
  ('Trabajo Freelance', '#33C1FF', 'Proyecto de trabajo independiente', 1, 1716801000000),
  ('Proyecto Diseño', '#7D3C98', 'Proyecto de diseño gráfico', 2, 1716802000000),
  ('Proyecto Marketing', '#FF5733', 'Campaña de marketing digital', 3, 1716803000000),
  ('Proyecto IT', '#33C1FF', 'Implementación de infraestructura TI', 4, 1716804000000);

-- Secciones
INSERT INTO sections (title, description, color, createdAt, project_id, user_id) VALUES
  ('Cocina', 'Limpieza profunda y reorganización', '#FFA07A', 1716801100000, 1, 1),
  ('Baño', 'Revisar productos vencidos', '#87CEEB', 1716801200000, 1, 1),
  ('Landing Page', 'Diseñar nueva home', '#FAD02E', 1716801300000, 2, 1),
  ('Wireframes', 'Sketch inicial de cliente', '#00C9FF', 1716801400000, 3, 2),
  ('SEO', 'Optimización para motores de búsqueda', '#FFA07A', 1716803100000, 4, 3),
  ('Redes Sociales', 'Gestión de contenido en redes', '#87CEEB', 1716803200000, 4, 3),
  ('Servidores', 'Configuración de servidores', '#FAD02E', 1716803300000, 5, 4),
  ('Seguridad', 'Auditoría de seguridad', '#00C9FF', 1716803400000, 5, 4);

-- Notas
INSERT INTO notes (title, section_id, user_id, created_at, updated_at) VALUES
  ('Checklist de cocina', 1, 1, 1716801110000, 1716801110000),
  ('Preparar baño para invitados', 2, 1, 1716801210000, 1716801210000),
  ('Landing: revisión general', 3, 1, 1716801310000, 1716801310000),
  ('Ideas de wireframe', 4, 2, 1716801410000, 1716801410000);

-- ToDos para las notas (máximo 8 por nota)
INSERT INTO note_todos (note_id, content, is_completed, position) VALUES
  -- Nota 1 (Checklist de cocina)
  (1, 'Limpiar encimeras', FALSE, 0),
  (1, 'Organizar despensa', FALSE, 1),
  (1, 'Tirar comida vencida', TRUE, 2),

  -- Nota 2 (Preparar baño)
  (2, 'Colocar toallas limpias', FALSE, 0),
  (2, 'Reponer papel higiénico', TRUE, 1),

  -- Nota 3 (Landing page)
  (3, 'Corregir textos', TRUE, 0),
  (3, 'Revisar imágenes responsive', FALSE, 1),

  -- Nota 4 (Wireframes)
  (4, 'Enviar primer draft al cliente', FALSE, 0),
  (4, 'Recibir feedback', FALSE, 1);