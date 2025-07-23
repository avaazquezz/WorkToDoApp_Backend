# WorkToDoApp Backend

This repository contains the backend APIs and database management for the WorkToDo application. It is built using Node.js, Express, and MySQL, and is containerized using Docker for easy deployment.

## Project Structure

The project is organized as follows:

```
WorkToDoApp_Backend/
├── controllers/         # Contains the logic for handling API requests
│   ├── authController.js
├── db/                  # Database initialization scripts and connection pool
│   ├── 01-tables.sql    # SQL script for creating tables
│   ├── 02-inserts.sql   # SQL script for inserting initial data
│   ├── db.js            # Database connection pool configuration
├── routes/              # API route definitions
│   ├── auth.js
│   ├── projects.js
│   ├── sections.js
│   ├── ToDo.js
├── utils/               # Utility functions
│   ├── hash.js          # Password hashing and comparison utilities
├── Dockerfile           # Docker configuration for the backend service
├── docker-compose.yml   # Docker Compose configuration for the entire stack
├── index.js             # Entry point for the backend application
├── package.json         # Project dependencies and scripts
├── .env                 # Environment variables (not included in the repository)
└── README.md            # Project documentation
```

## Prerequisites

Before running the application, ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## Getting Started

Follow these steps to set up and run the application:

### 1. Clone the Repository

```bash
git clone https://github.com/avaazquezz/WorkToDoApp_Backend.git
cd WorkToDoApp_Backend
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```properties
PORT=3001
DB_HOST=db
DB_USER=root
DB_PASSWORD=1234
DB_NAME=worktodo
JWT_SECRET=your_jwt_secret
```

Replace `your_jwt_secret` with your actual values.

### 3. Build and Run the Application

Use Docker Compose to build and start the application:

```bash
docker-compose up --build
```

This will start the following services:
- **app**: The backend application running on `http://localhost:3001`.
- **db**: MySQL database.
- **adminer**: Database management tool accessible at `http://localhost:8080`.

### 4. Verify the Application

Check the health of the backend by visiting:

```
http://localhost:3001/health
```

### 5. API Endpoints

The backend exposes the following API endpoints:

- **Authentication**
  - `POST /api/auth/register`: Register a new user.
  - `POST /api/auth/login`: Log in an existing user.

- **Projects**
  - `GET /api/projects`: Fetch all projects.
  - `POST /api/projects`: Create a new project.

- **Sections**
  - `GET /api/sections`: Fetch all sections.
  - `POST /api/sections`: Create a new section.

- **ToDo**
  - `GET /api/notes`: Fetch all notes.
  - `POST /api/notes`: Create a new note.

### 6. Database Management

You can manage the database using Adminer at `http://localhost:8080`. Use the following credentials:
- **System**: `MySQL`
- **Server**: `db`
- **Username**: `root`
- **Password**: `1234`
- **Database**: `worktodo`

## Contributing

Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
