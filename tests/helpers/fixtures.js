// Test data fixtures for consistent testing
const { hashPassword } = require('../../utils/hash');

const createTestUser = async () => {
  const hashedPassword = await hashPassword('testpassword123');
  return {
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword,
    is_premium: false
  };
};

const createTestProject = (userId) => ({
  name: 'Test Project',
  color: '#FF5733',
  description: 'Test project description',
  created_by: userId,
  created_at: Date.now()
});

const createTestSection = (projectId, userId) => ({
  title: 'Test Section',
  description: 'Test section description',
  color: '#33C1FF',
  createdAt: Date.now(),
  project_id: projectId,
  user_id: userId
});

const createTestNote = (sectionId, userId) => ({
  title: 'Test Note',
  section_id: sectionId,
  user_id: userId,
  created_at: Date.now(),
  updated_at: Date.now()
});

const createTestTodo = (noteId) => ({
  note_id: noteId,
  content: 'Test todo content',
  is_completed: false,
  position: 0
});

// Mock user data for registration tests
const validUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'password123'
};

const invalidUserData = [
  { name: '', email: 'test@example.com', password: 'password123' },
  { name: 'Test User', email: '', password: 'password123' },
  { name: 'Test User', email: 'test@example.com', password: '' },
  { name: 'Test User', email: 'invalid-email', password: 'password123' }
];

// Mock project data
const validProjectData = {
  name: 'New Project',
  color: '#7D3C98',
  description: 'A new test project',
  created_by: 1,
  created_at: Date.now()
};


const invalidProjectData = [
  { name: '', color: '#7D3C98', description: 'Test', created_by: 1 },
  { name: 'Test', color: '#7D3C98', description: 'Test', created_by: null }
];

module.exports = {
  createTestUser,
  createTestProject,
  createTestSection,
  createTestNote,
  createTestTodo,
  validUserData,
  invalidUserData,
  validProjectData,
  invalidProjectData
};
