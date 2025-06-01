# WorkToDoApp_Backend
aqui se gestiona las apis y bbdd de la app WorkToDo

## Ejecución con Docker

1. Asegúrate de tener Docker y Docker Compose instalados.
2. Construye y ejecuta los contenedores:
   ```bash
   npm run docker:start
   ```
3. Detén los contenedores:
   ```bash
   npm run docker:stop
   ```

Los servicios estarán disponibles en:
- Backend: [http://localhost:3000](http://localhost:3000)
- Base de datos MySQL: puerto 3306
