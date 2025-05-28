INSERT INTO users (name, email, password, is_premium)
VALUES 
  ('Diego Jols', 'diegojo@todoapp.com', 'hashedpassword123', TRUE),
  ('Laura Torres', 'laura@example.com', 'hashedpassword456', FALSE);


INSERT INTO projects (name, color, description, created_by, created_at)
VALUES 
  ('Proyecto Hogar', '#FF5733', 'Proyecto para tareas del hogar', 1, 1716800000000),
  ('Trabajo Freelance', '#33C1FF', 'Proyecto de trabajo independiente', 1, 1716801000000),
  ('Proyecto Diseño', '#7D3C98', 'Proyecto de diseño gráfico', 2, 1716802000000);


INSERT INTO sections (title, description, color, createdAt, project_id, user_id)
VALUES
  ('Cocina', 'Limpieza profunda y reorganización', '#FFA07A', 1716801100000, 1, 1),
  ('Baño', 'Revisar productos vencidos', '#87CEEB', 1716801200000, 1, 1),
  ('Landing Page', 'Diseñar nueva home', '#FAD02E', 1716801300000, 2, 1),
  ('Wireframes', 'Sketch inicial de cliente', '#00C9FF', 1716801400000, 3, 2);



