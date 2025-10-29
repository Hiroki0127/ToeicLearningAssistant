import { calculateUserLevel } from '../controllers/dashboard.controller';

describe('Leveling System', () => {
  describe('calculateUserLevel', () => {
    it('should calculate beginner level for new user', () => {
      const stats = {
        totalCards: 0,
        cardsStudiedToday: 0,
        currentStreak: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalQuizAttempts: 0,
        averageQuizScore: 0,
        totalStudyTimeMinutes: 0
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('beginner');
      expect(result.experience).toBe(0);
      expect(result.nextLevel).toBe('intermediate');
      expect(result.nextLevelXP).toBe(5000);
      expect(result.levelProgress).toBe(0);
    });

    it('should calculate intermediate level with sufficient XP', () => {
      const stats = {
        totalCards: 100, // 100 * 10 = 1000 XP
        cardsStudiedToday: 20,
        currentStreak: 5, // 5 * 25 = 125 XP
        totalCorrect: 200, // 200 * 5 = 1000 XP
        totalIncorrect: 50,
        totalQuizAttempts: 10, // 10 * 50 = 500 XP
        averageQuizScore: 80, // 80 * 10 = 800 XP
        totalStudyTimeMinutes: 1000 // 1000 / 10 = 100 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('beginner');
      expect(result.experience).toBe(3525); // 1000 + 125 + 1000 + 500 + 800 + 100
      expect(result.nextLevel).toBe('intermediate');
      expect(result.nextLevelXP).toBe(5000);
    });

    it('should calculate advanced level with high XP', () => {
      const stats = {
        totalCards: 500, // 500 * 10 = 5000 XP
        cardsStudiedToday: 50,
        currentStreak: 20, // 20 * 25 = 500 XP
        totalCorrect: 1000, // 1000 * 5 = 5000 XP
        totalIncorrect: 200,
        totalQuizAttempts: 50, // 50 * 50 = 2500 XP
        averageQuizScore: 85, // 85 * 50 = 4250 XP
        totalStudyTimeMinutes: 5000 // 5000 / 10 = 500 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('advanced');
      expect(result.experience).toBe(17750); // 5000 + 500 + 5000 + 2500 + 4250 + 500
      expect(result.nextLevel).toBe('expert');
      expect(result.nextLevelXP).toBe(30000);
    });

    it('should calculate expert level with very high XP', () => {
      const stats = {
        totalCards: 1000, // 1000 * 10 = 10000 XP
        cardsStudiedToday: 100,
        currentStreak: 50, // 50 * 25 = 1250 XP
        totalCorrect: 2000, // 2000 * 5 = 10000 XP
        totalIncorrect: 300,
        totalQuizAttempts: 100, // 100 * 50 = 5000 XP
        averageQuizScore: 90, // 90 * 100 = 9000 XP
        totalStudyTimeMinutes: 10000 // 10000 / 10 = 1000 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('expert');
      expect(result.experience).toBe(36250); // 10000 + 1250 + 10000 + 5000 + 9000 + 1000
      expect(result.nextLevel).toBe('expert');
      expect(result.nextLevelXP).toBe(30000);
      expect(result.levelProgress).toBe(100);
    });

    it('should calculate correct level progress', () => {
      const stats = {
        totalCards: 50, // 50 * 10 = 500 XP
        cardsStudiedToday: 10,
        currentStreak: 2, // 2 * 25 = 50 XP
        totalCorrect: 100, // 100 * 5 = 500 XP
        totalIncorrect: 20,
        totalQuizAttempts: 5, // 5 * 50 = 250 XP
        averageQuizScore: 70, // 70 * 5 = 350 XP
        totalStudyTimeMinutes: 500 // 500 / 10 = 50 XP
      };

      const result = calculateUserLevel(stats);

      expect(result.level).toBe('beginner');
      expect(result.experience).toBe(1700); // 500 + 50 + 500 + 250 + 350 + 50
      expect(result.nextLevel).toBe('intermediate');
      expect(result.nextLevelXP).toBe(5000);
      // Progress should be (1700 - 0) / (5000 - 0) * 100 = 34%
      expect(result.levelProgress).toBe(34);
    });
  });
});
