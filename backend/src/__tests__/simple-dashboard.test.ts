import { calculateUserLevel } from '../controllers/dashboard.controller';

describe('Simple Dashboard Tests', () => {
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
  });
});
