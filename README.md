# WorkToDoApp Backend

This repository contains the backend APIs and database management for the WorkToDo application. It is built using Node.js, Express, and MySQL, and is containerized using Docker for easy deployment.

## Project Structure

The project is organized as follows:

```
WorkToDoApp_Backend/
├── controllers/         # Contains the logic for handling API requests
│   ├── authController.js
├── db/                  # Database initialization scripts and connection pool
│   ├── docker-entrypoint-initdb.d/
│   │   ├── 01-tables.sql    # SQL script for creating tables
│   │   └── 02-inserts.sql   # SQL script for inserting initial data
│   └── db.js            # Database connection pool configuration
├── routes/              # API route definitions
│   ├── auth.js
│   ├── projects.js
│   ├── sections.js
│   └── ToDo.js
├── utils/               # Utility functions
│   ├── hash.js          # Password hashing and comparison utilities
│   └── logger.js        # Logging utilities
├── tests/               # Comprehensive test suite
│   ├── helpers/         # Test utilities and fixtures
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── README.md       # Test documentation
├── coverage/           # Test coverage reports (generated)
├── Dockerfile          # Multi-stage Docker configuration
├── docker-compose.yml  # Production Docker Compose configuration
├── docker-compose.dev.yml  # Development Docker Compose configuration
├── docker-compose.test.yml # Testing Docker Compose configuration
├── jest.config.js      # Jest testing framework configuration
├── wait-for-it.sh      # Database readiness script
├── index.js            # Entry point for the backend application
├── package.json        # Project dependencies and scripts
├── .env                # Environment variables (not included in the repository)
├── .env.test           # Test environment variables
└── README.md           # Project documentation
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

#### Production Mode

Use Docker Compose to build and start the backend and database services:

```bash
docker compose up --build
```

This will start:
- **app**: The backend application running on `http://localhost:3001`
- **db**: Production MySQL database
- **adminer**: Database management tool accessible at `http://localhost:8080`

#### Development Mode (with Hot Reload)

For development with automatic code reloading:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This provides:
- Hot reload on code changes
- Direct access to MySQL on port 3306
- Development-optimized configuration

#### Testing Only

To run the comprehensive test suite in an isolated environment:

```bash
docker compose -f docker-compose.test.yml up --abort-on-container-exit --build
```

This will:
- Create a separate test database (`worktodo_test`)
- Run all unit and integration tests
- Generate test coverage reports
- Automatically exit when tests complete
- Use `--detectOpenHandles` to prevent resource leaks

#### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### 4. Verify the Application

Check the health of the backend by visiting:

```
http://localhost:3001/health
```

### 5. API Endpoints

The backend exposes the following API endpoints:

#### **Authentication**
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Log in an existing user.

#### **Projects**
- `GET /api/projects/user/:userId`: Fetch all projects for a specific user.
- `POST /api/projects`: Create a new project.
- `PUT /api/projects/:id`: Update a project.
- `DELETE /api/projects/:id`: Delete a project.
- `GET /api/projects/:id/creation-info`: Get creation info for a project.
- `GET /api/projects/:id`: Fetch a project by ID.

#### **Sections**
- `GET /api/sections/project/:projectId`: Fetch all sections for a specific project.
- `GET /api/sections/:idSection`: Fetch a section by ID.
- `POST /api/sections`: Create a new section.
- `PUT /api/sections/:idSection`: Update a section.
- `DELETE /api/sections/:idSection`: Delete a section.
- `GET /api/sections/:idSection/creation-info`: Get creation info for a section.
- `PUT /api/sections/:idSection/move`: Move a section to another project.
- `GET /api/sections/project/:projectId/count`: Count sections in a project.

#### **Notes**
- `POST /api/notes/new`: Create a new note.
- `GET /api/notes/section/:sectionId`: Fetch all notes for a specific section.
- `PUT /api/notes/:id`: Update a note's title.
- `DELETE /api/notes/:id`: Delete a note.

#### **ToDos**
- `POST /api/notes/:noteId/todos`: Add a ToDo to a note (max 8).
- `GET /api/notes/:noteId/todos`: Fetch all ToDos for a note.
- `PUT /api/notes/todos/:id`: Update a ToDo (mark as completed or edit content).
- `DELETE /api/notes/todos/:id`: Delete a ToDo.
- `PUT /api/notes/:noteId/todos/reorder`: Reorder ToDos for a note.

### 6. Database Management

You can manage the database using Adminer at `http://localhost:8080`. Use the following credentials:

#### Production Database
- **System**: `MySQL`
- **Server**: `db`
- **Username**: `root`
- **Password**: `1234`
- **Database**: `worktodo`

#### Test Database (when running tests)
- **System**: `MySQL`
- **Server**: `test-db`
- **Username**: `root`
- **Password**: `1234`
- **Database**: `worktodo_test`

## Testing

This project includes a comprehensive testing suite with both unit and integration tests, optimized for Docker environments.

### Test Features

- **Docker-First Testing**: Tests designed to run in containerized environments
- **Open Handle Detection**: Configured with `--detectOpenHandles` to prevent memory leaks
- **Database Isolation**: Tests use a separate database (`worktodo_test`) to avoid conflicts
- **Connection Management**: Proper teardown of database connections and resources
- **Test Coverage**: Generates detailed coverage reports
- **CI/CD Ready**: Configured for continuous integration

### Running Tests

#### With Docker (Recommended)

```bash
# Run tests only (isolated testing environment)
docker compose -f docker-compose.test.yml up --abort-on-container-exit --build

# Production with backend and database (tests run separately)
docker compose up --build

# Development mode with hot reload
docker compose -f docker-compose.dev.yml up --build
```

#### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests** (`tests/unit/`): Test individual functions and components in isolation
- **Integration Tests** (`tests/integration/`): Test complete API endpoints with real database connections
- **Test Helpers** (`tests/helpers/`): Utilities for test setup, fixtures, and database management
- **Test Database**: Separate MySQL database (`worktodo_test`) for testing
- **Coverage Reports**: Generated in `./coverage` directory

### Test Configuration Highlights

- **Jest Configuration**: Optimized with `--detectOpenHandles` and `--runInBand` for reliable execution
- **Database Connection Pooling**: Lazy initialization to prevent resource leaks
- **Proper Teardown**: All tests properly close database connections in `afterAll` blocks
- **Environment Separation**: Test and production databases are completely isolated

### Docker Test Services

The `docker-compose.test.yml` includes:

- **test-db**: MySQL database specifically for testing
- **tests**: Jest test runner with open handle detection
- **Isolated Environment**: No interference with production services

## Development Workflow

1. **Clone and Setup**:
   ```bash
   git clone https://github.com/avaazquezz/WorkToDoApp_Backend.git
   cd WorkToDoApp_Backend
   ```

2. **Development**:
   ```bash
   # Start development environment with hot reload
   docker compose -f docker-compose.dev.yml up --build
   ```

3. **Testing**:
   ```bash
   # Run tests in isolated Docker environment (recommended)
   docker compose -f docker-compose.test.yml up --abort-on-container-exit --build
   
   # Or run tests locally
   npm test
   ```

4. **Production Deployment**:
   ```bash
   # Start backend and database services
   docker compose up --build
   ```

### Docker Compose Files Overview

- **`docker-compose.yml`**: Production backend and database services
- **`docker-compose.dev.yml`**: Development environment with hot reload
- **`docker-compose.test.yml`**: Isolated testing environment with test database

## Quick Commands (Makefile)

This project includes a Makefile with convenient commands:

```bash
# Show all available commands
make help

# Initial setup
make setup

# Development
make dev              # Start development with Docker
make dev-local        # Start development locally

# Testing
make test             # Run tests in isolated Docker environment
make test-local       # Run tests locally
make test-coverage    # Generate coverage report

# Production
make prod             # Start production backend and database
make clean            # Clean containers and volumes
make logs             # Show application logs
make health           # Check application health
```

### Docker Compose Command Reference

```bash
# Backend and database services
docker compose up --build

# Development with hot reload
docker compose -f docker-compose.dev.yml up --build

# Isolated testing environment
docker compose -f docker-compose.test.yml up --abort-on-container-exit --build
```

## Contributing

Feel free to open issues or submit pull requests to improve the project.

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
