// Unit tests for hash utilities
const { hashPassword, comparePasswords } = require('../../utils/hash');

describe('Hash Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow();
    });

    it('should handle null password', async () => {
      await expect(hashPassword(null)).rejects.toThrow();
    });
  });

  describe('comparePasswords', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePasswords(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePasswords(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);
      const isMatch = await comparePasswords('', hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    it('should handle invalid hash', async () => {
      const password = 'testpassword123';
      await expect(comparePasswords(password, 'invalid_hash')).rejects.toThrow();
    });
  });
});
