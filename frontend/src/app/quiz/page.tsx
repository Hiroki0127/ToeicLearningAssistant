'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Search, 
  LineChart, 
  Bell, 
  Calendar, 
  Zap, 
  Share2 
} from 'lucide-react';
import { getQuizzes, createQuiz, submitQuizResult, getQuizStats, getQuizHistory, type Quiz, type QuizResult, type QuizAttempt } from '@/lib/quiz';

// Using flexible types for complex nested state objects
type QuizStats = Record<string, unknown>;
type ProgressData = Record<string, unknown>;
type BadgeItem = Record<string, unknown>;
type GamificationData = Record<string, unknown>;
type ShareQuiz = Record<string, unknown>;
type CalendarData = Record<string, unknown>;
type StreakData = Record<string, unknown>;
type InsightsData = Record<string, unknown>;
type ReminderStats = Record<string, unknown>;

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Quiz[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Quiz[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showProgressCharts, setShowProgressCharts] = useState(false);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showStudyReminders, setShowStudyReminders] = useState(false);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    frequency: 'daily',
    preferredTime: '18:00',
    daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    minStudyTime: 15,
    goalQuizzesPerWeek: 3
  });
  const [reminderStats, setReminderStats] = useState<ReminderStats | null>(null);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [showLearningStreaks, setShowLearningStreaks] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [streaksLoading, setStreaksLoading] = useState(false);
  const [showStudyCalendar, setShowStudyCalendar] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showCustomQuizCreator, setShowCustomQuizCreator] = useState(false);
  const [showSampleQuizzes, setShowSampleQuizzes] = useState(false);
  const [customQuizData, setCustomQuizData] = useState({
    title: '',
    description: '',
    type: 'vocabulary',
    difficulty: 'medium',
    timeLimit: 15,
    questions: [] as Array<{
      id: string;
      type: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      points: number;
    }>
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    points: 1
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [customQuizLoading, setCustomQuizLoading] = useState(false);
  const [showQuizSharing, setShowQuizSharing] = useState(false);
  const [sharedQuizzes, setSharedQuizzes] = useState<ShareQuiz[]>([]);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [selectedQuizForSharing, setSelectedQuizForSharing] = useState<Quiz | null>(null);
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    allowComments: true,
    allowRating: true,
    allowDuplication: false,
    expirationDate: null as string | null
  });
  const [showGamification, setShowGamification] = useState(false);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [unlockedRewards, setUnlockedRewards] = useState<Array<Record<string, unknown>>>([]);
  const [showBadgeCollection, setShowBadgeCollection] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badgeCategories] = useState<string[]>(['all', 'performance', 'streak', 'milestone', 'special']);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState('all');

  // Filter quizzes based on selected difficulty and category
  const filterQuizzes = (quizzes: Quiz[], difficulty: string, category: string) => {
    let filtered = quizzes;
    
    // Filter by difficulty
    if (difficulty !== 'all') {
      filtered = filtered.filter(quiz => quiz.difficulty === difficulty);
    }
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(quiz => quiz.type === category);
    }
    
    return filtered;
  };

  useEffect(() => {
    // Load quizzes from API and combine with custom quizzes from localStorage
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        
        // Load quizzes from API
        const apiQuizzes = await getQuizzes();
        
        // Load custom quizzes from localStorage
        const customQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
        
        // Combine both sources - API quizzes first, then custom quizzes
        const allQuizzes = [...apiQuizzes, ...customQuizzes];
        
        setQuizzes(allQuizzes);
        setFilteredQuizzes(filterQuizzes(allQuizzes, selectedDifficulty, selectedCategory));
      } catch (error) {
        console.error('Failed to load quizzes:', error);
        // Fallback: try to load only custom quizzes from localStorage
        try {
          const customQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
          setQuizzes(customQuizzes);
          setFilteredQuizzes(filterQuizzes(customQuizzes, selectedDifficulty, selectedCategory));
        } catch (localError) {
          console.error('Failed to load custom quizzes:', localError);
          setQuizzes([]);
          setFilteredQuizzes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Update filtered quizzes when difficulty or category changes
  useEffect(() => {
    setFilteredQuizzes(filterQuizzes(quizzes, selectedDifficulty, selectedCategory));
  }, [selectedDifficulty, selectedCategory, quizzes]);

  // Reload calendar data when month changes
  useEffect(() => {
    if (showStudyCalendar) {
      loadCalendarData();
    }
  }, [selectedMonth]);

  // Load insights when toggled
  useEffect(() => {
    if (showPerformanceInsights) {
      generatePerformanceInsights();
    }
  }, [showPerformanceInsights]);

  // Load shared quizzes when sharing is toggled
  useEffect(() => {
    if (showQuizSharing) {
      loadSharedQuizzes();
    }
  }, [showQuizSharing]);

  // Load gamification data when toggled
  useEffect(() => {
    if (showGamification) {
      loadGamificationData();
    }
  }, [showGamification]);

  // Load progress data when toggled
  useEffect(() => {
    if (showProgressCharts) {
      loadProgressData();
    }
  }, [showProgressCharts]);

  // Load study reminder data when toggled
  useEffect(() => {
    if (showStudyReminders) {
      loadReminderData();
    }
  }, [showStudyReminders]);

  // Load streak data when toggled
  useEffect(() => {
    if (showLearningStreaks) {
      loadStreakData();
    }
  }, [showLearningStreaks]);

  // Load calendar data when toggled
  useEffect(() => {
    if (showStudyCalendar) {
      loadCalendarData();
    }
  }, [showStudyCalendar]);

  // Close advanced features dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAdvancedFeatures && !target.closest('.relative')) {
        setShowAdvancedFeatures(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdvancedFeatures]);

  // Load quiz analytics
  const loadQuizAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const stats = await getQuizStats();
      setQuizStats(stats);
    } catch (error) {
      console.error('Failed to load quiz analytics:', error);
      // Set default stats if API fails
      setQuizStats({
        totalQuizzes: 0,
        averageScore: 0,
        totalExperience: 0,
        quizzesByDifficulty: { easy: 0, medium: 0, hard: 0 },
        quizzesByCategory: { vocabulary: 0, grammar: 0, reading: 0, listening: 0 },
        recentPerformance: []
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Search quizzes by title, description, or content
  const searchQuizzes = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const term = searchTerm.toLowerCase();
    
    const results = quizzes.filter(quiz => {
      // Search in title
      if (quiz.title.toLowerCase().includes(term)) return true;
      
      // Search in description
      if (quiz.description.toLowerCase().includes(term)) return true;
      
      // Search in quiz type
      if (quiz.type.toLowerCase().includes(term)) return true;
      
      // Search in difficulty
      if (quiz.difficulty.toLowerCase().includes(term)) return true;
      
      // Search in questions content
      const hasMatchingQuestion = quiz.questions.some(question => 
        question.question.toLowerCase().includes(term) ||
        question.options.some(option => option.toLowerCase().includes(term))
      );
      
      return hasMatchingQuestion;
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      searchQuizzes(value);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  // Get search suggestions based on available quiz content
  const getSearchSuggestions = () => {
    const suggestions = new Set<string>();
    
    quizzes.forEach(quiz => {
      // Add quiz types
      suggestions.add(quiz.type);
      // Add difficulty levels
      suggestions.add(quiz.difficulty);
      // Add common words from titles
      quiz.title.split(' ').forEach(word => {
        if (word.length > 3) suggestions.add(word.toLowerCase());
      });
    });
    
    return Array.from(suggestions).slice(0, 8);
  };

  // Generate quiz recommendations based on user performance and preferences
  const generateRecommendations = async () => {
    try {
      setRecommendationsLoading(true);
      
      // Get user's quiz history and stats
      const stats = await getQuizStats();
      
      // Generate recommendations based on performance patterns
      let recommendedQuizzes = [...quizzes];
      
      // If user has taken quizzes before, use performance data
      if (stats.totalQuizzes > 0) {
        // Sort by recommendation score
        recommendedQuizzes.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          
          // Prefer quizzes in categories where user needs improvement
          if (stats.quizzesByCategory && stats.quizzesByCategory[a.type as keyof typeof stats.quizzesByCategory] < 2) scoreA += 3;
          if (stats.quizzesByCategory && stats.quizzesByCategory[b.type as keyof typeof stats.quizzesByCategory] < 2) scoreB += 3;
          
          // Prefer appropriate difficulty level based on average score
          if (stats.averageScore < 60) {
            // User struggling - recommend easier quizzes
            if (a.difficulty === 'easy') scoreA += 2;
            if (b.difficulty === 'easy') scoreB += 2;
          } else if (stats.averageScore > 80) {
            // User doing well - recommend harder quizzes
            if (a.difficulty === 'hard') scoreA += 2;
            if (b.difficulty === 'hard') scoreB += 2;
          } else {
            // User in middle - recommend medium quizzes
            if (a.difficulty === 'medium') scoreA += 2;
            if (b.difficulty === 'medium') scoreB += 2;
          }
          
          // Prefer quizzes with more questions for better learning
          scoreA += Math.min(a.questions.length / 10, 1);
          scoreB += Math.min(b.questions.length / 10, 1);
          
          return scoreB - scoreA;
        });
      } else {
        // New user - recommend a mix of easy quizzes from different categories
        recommendedQuizzes = quizzes.filter(quiz => quiz.difficulty === 'easy');
        recommendedQuizzes.sort((a, b) => {
          // Prioritize different categories
          const categoryPriority = { vocabulary: 3, grammar: 2, reading: 2, listening: 1 };
          return (categoryPriority[b.type as keyof typeof categoryPriority] || 0) - 
                 (categoryPriority[a.type as keyof typeof categoryPriority] || 0);
        });
      }
      
      // Take top 6 recommendations
      setRecommendations(recommendedQuizzes.slice(0, 6));
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      // Fallback to random selection
      const shuffled = [...quizzes].sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 6));
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Get recommendation explanation for a quiz
  const getRecommendationExplanation = (quiz: Quiz) => {
    if (!quizStats) return "This quiz is recommended based on your learning preferences.";
    
    const explanations = [];
    
    // Category-based explanation
    if (quizStats.quizzesByCategory && quizStats.quizzesByCategory[quiz.type as keyof typeof quizStats.quizzesByCategory] < 2) {
      explanations.push(`You haven't taken many ${quiz.type} quizzes yet.`);
    }
    
    // Difficulty-based explanation
    if (quizStats.averageScore < 60 && quiz.difficulty === 'easy') {
      explanations.push("This easier quiz will help build your confidence.");
    } else if (quizStats.averageScore > 80 && quiz.difficulty === 'hard') {
      explanations.push("You're ready for a challenge with this harder quiz.");
    } else if (quizStats.averageScore >= 60 && quizStats.averageScore <= 80 && quiz.difficulty === 'medium') {
      explanations.push("This medium difficulty quiz matches your current skill level.");
    }
    
    // Question count explanation
    if (quiz.questions.length > 10) {
      explanations.push("This comprehensive quiz will give you thorough practice.");
    }
    
    return explanations.length > 0 ? explanations.join(" ") : "This quiz aligns well with your learning goals.";
  };

  // Load and process progress data for charts
  const loadProgressData = async () => {
    try {
      setProgressLoading(true);
      
      // Get quiz history for progress analysis
      const history = await getQuizHistory();
      
      if (history.length === 0) {
        setProgressData(null);
        return;
      }
      
      // Process data for charts
      const processedData = {
        // Score progression over time
        scoreTrend: history
          .sort((a: QuizAttempt, b: QuizAttempt) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
          .map((attempt: QuizAttempt, index: number) => ({
            attempt: index + 1,
            score: attempt.score,
            date: new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            quizTitle: attempt.quiz?.title || `Quiz ${index + 1}`
          })),
        
        // Performance by category
        categoryPerformance: Object.entries(
          history.reduce((acc: Record<string, { total: number; scores: number[]; count: number }>, attempt: QuizAttempt) => {
            const category = attempt.quiz?.type || 'unknown';
            if (!acc[category]) {
              acc[category] = { total: 0, scores: [], count: 0 };
            }
            acc[category].scores.push(attempt.score);
            acc[category].total += attempt.score;
            acc[category].count += 1;
            return acc;
          }, {} as Record<string, { total: number; scores: number[]; count: number }>)
        ).map(([category, data]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          averageScore: Math.round((data as { total: number; scores: number[]; count: number }).total / (data as { total: number; scores: number[]; count: number }).count),
          count: (data as { total: number; scores: number[]; count: number }).count,
          bestScore: Math.max(...(data as { total: number; scores: number[]; count: number }).scores),
          worstScore: Math.min(...(data as { total: number; scores: number[]; count: number }).scores)
        })),
        
        // Study frequency (quizzes per week)
        studyFrequency: (() => {
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          
          const thisWeek = history.filter((h: QuizAttempt) => new Date(h.completedAt) > oneWeekAgo).length;
          const lastWeek = history.filter((h: QuizAttempt) => {
            const date = new Date(h.completedAt);
            return date > twoWeeksAgo && date <= oneWeekAgo;
          }).length;
          
          return [
            { week: 'Last Week', count: lastWeek },
            { week: 'This Week', count: thisWeek }
          ];
        })(),
        
        // Difficulty progression
        difficultyProgression: history
          .sort((a: QuizAttempt, b: QuizAttempt) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
          .map((attempt: QuizAttempt, index: number) => {
            const difficulty = attempt.quiz?.difficulty || 'unknown';
            const difficultyScore = { easy: 1, medium: 2, hard: 3 }[difficulty] || 1;
            return {
              attempt: index + 1,
              difficulty: difficultyScore,
              difficultyLabel: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
              score: attempt.score
            };
          }),
        
        // Overall statistics
        overallStats: {
          totalAttempts: history.length,
          averageScore: Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length),
          bestScore: Math.max(...history.map(h => h.score)),
          improvement: (() => {
            if (history.length < 2) return 0;
            const firstHalf = history.slice(0, Math.ceil(history.length / 2));
            const secondHalf = history.slice(Math.ceil(history.length / 2));
            const firstAvg = firstHalf.reduce((sum, h) => sum + h.score, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, h) => sum + h.score, 0) / secondHalf.length;
            return Math.round(secondAvg - firstHalf.length);
          })()
        }
      };
      
      setProgressData(processedData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setProgressData(null);
    } finally {
      setProgressLoading(false);
    }
  };

  // Load study reminder statistics and settings
  const loadReminderData = async () => {
    try {
      setRemindersLoading(true);
      
      // Get quiz history for reminder analysis
      const history = await getQuizHistory();
      
      if (history.length === 0) {
        setReminderStats({
          currentStreak: 0,
          longestStreak: 0,
          thisWeekQuizzes: 0,
          lastStudyDate: null,
          nextRecommendedStudy: null,
          weeklyGoalProgress: 0,
          averageStudyGap: 0
        });
        return;
      }
      
      // Calculate reminder statistics
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Sort history by completion date
      const sortedHistory = history.sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      
      const lastStudyDate = new Date(sortedHistory[0].completedAt);
      const thisWeekQuizzes = history.filter(h => 
        new Date(h.completedAt) > oneWeekAgo
      ).length;
      
      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastDate = null;
      
      for (let i = 0; i < sortedHistory.length; i++) {
        const currentDate = new Date(sortedHistory[i].completedAt);
        const currentDay = currentDate.toDateString();
        
        if (lastDate === null) {
          tempStreak = 1;
          lastDate = currentDay;
        } else {
          const lastDay = new Date(lastDate);
          const dayDiff = Math.floor((lastDay.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
          lastDate = currentDay;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Calculate current streak from today
      if (lastStudyDate.toDateString() === now.toDateString()) {
        currentStreak = tempStreak;
      } else if (lastStudyDate.toDateString() === oneDayAgo.toDateString()) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
      
      // Calculate next recommended study time
      const nextRecommendedStudy = new Date();
      if (currentStreak === 0) {
        // If no current streak, recommend studying today
        nextRecommendedStudy.setHours(parseInt(reminderSettings.preferredTime.split(':')[0]));
        nextRecommendedStudy.setMinutes(parseInt(reminderSettings.preferredTime.split(':')[1]));
      } else {
        // If on a streak, recommend studying tomorrow
        nextRecommendedStudy.setDate(nextRecommendedStudy.getDate() + 1);
        nextRecommendedStudy.setHours(parseInt(reminderSettings.preferredTime.split(':')[0]));
        nextRecommendedStudy.setMinutes(parseInt(reminderSettings.preferredTime.split(':')[1]));
      }
      
      // Calculate weekly goal progress
      const weeklyGoalProgress = Math.min((thisWeekQuizzes / reminderSettings.goalQuizzesPerWeek) * 100, 100);
      
      // Calculate average study gap
      let totalGap = 0;
      let gapCount = 0;
      for (let i = 1; i < sortedHistory.length; i++) {
        const currentDate = new Date(sortedHistory[i].completedAt);
        const previousDate = new Date(sortedHistory[i - 1].completedAt);
        const gap = Math.floor((previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
        totalGap += gap;
        gapCount++;
      }
      const averageStudyGap = gapCount > 0 ? Math.round(totalGap / gapCount) : 0;
      
      setReminderStats({
        currentStreak,
        longestStreak,
        thisWeekQuizzes,
        lastStudyDate: lastStudyDate.toLocaleDateString(),
        nextRecommendedStudy: nextRecommendedStudy.toLocaleString(),
        weeklyGoalProgress,
        averageStudyGap
      });
      
    } catch (error) {
      console.error('Failed to load reminder data:', error);
      setReminderStats(null);
    } finally {
      setRemindersLoading(false);
    }
  };

  // Update reminder settings
  const updateReminderSettings = (newSettings: any) => {
    setReminderSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Toggle reminder for specific day
  const toggleDayReminder = (day: string) => {
    setReminderSettings(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  // Load enhanced learning streak data
  const loadStreakData = async () => {
    try {
      setStreaksLoading(true);
      
      // Get quiz history for streak analysis
      const history = await getQuizHistory();
      
      if (history.length === 0) {
        setStreakData(null);
        return;
      }
      
      // Calculate comprehensive streak data
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Sort history by completion date
      const sortedHistory = history.sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      
      // Calculate streaks
      let currentStreak = 0;
      let longestStreak = 0;
      let totalStreaks = 0;
      let tempStreak = 0;
      let lastDate = null;
      let streakHistory: any[] = [];
      
      for (let i = 0; i < sortedHistory.length; i++) {
        const currentDate = new Date(sortedHistory[i].completedAt);
        const currentDay = currentDate.toDateString();
        
        if (lastDate === null) {
          tempStreak = 1;
          lastDate = currentDay;
        } else {
          const lastDay = new Date(lastDate);
          const dayDiff = Math.floor((lastDay.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
          
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            if (tempStreak > 1) {
              streakHistory.push({
                length: tempStreak,
                startDate: new Date(sortedHistory[i - tempStreak + 1].completedAt).toLocaleDateString(),
                endDate: new Date(sortedHistory[i - 1].completedAt).toLocaleDateString()
              });
              totalStreaks++;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
          lastDate = currentDay;
        }
      }
      
      // Handle the last streak
      if (tempStreak > 1) {
        streakHistory.push({
          length: tempStreak,
          startDate: new Date(sortedHistory[sortedHistory.length - tempStreak].completedAt).toLocaleDateString(),
          endDate: new Date(sortedHistory[sortedHistory.length - 1].completedAt).toLocaleDateString()
        });
        totalStreaks++;
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Calculate current streak from today
      const lastStudyDate = new Date(sortedHistory[0].completedAt);
      if (lastStudyDate.toDateString() === now.toDateString()) {
        currentStreak = tempStreak;
      } else if (lastStudyDate.toDateString() === oneDayAgo.toDateString()) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
      
      // Calculate weekly and monthly streaks
      const weeklyStreak = history.filter(h => 
        new Date(h.completedAt) > oneWeekAgo
      ).length;
      
      const monthlyStreak = history.filter(h => 
        new Date(h.completedAt) > oneMonthAgo
      ).length;
      
      // Calculate streak multiplier and points
      const streakMultiplier = Math.min(1 + (currentStreak * 0.1), 3); // Max 3x multiplier
      const totalPoints = history.reduce((sum, h) => sum + h.score, 0) * streakMultiplier;
      
      // Determine next milestone
      const milestones = [3, 7, 14, 30, 50, 100, 365];
      const nextMilestone = milestones.find(m => m > currentStreak) || null;
      
      // Generate achievements
      const achievements = [];
      if (currentStreak >= 3) achievements.push({ name: 'Getting Started', icon: '⭐', description: '3-day streak' });
      if (currentStreak >= 7) achievements.push({ name: 'Week Warrior', icon: '🔥', description: '7-day streak' });
      if (currentStreak >= 14) achievements.push({ name: 'Fortnight Fighter', icon: '⚡', description: '14-day streak' });
      if (currentStreak >= 30) achievements.push({ name: 'Monthly Master', icon: '👑', description: '30-day streak' });
      if (currentStreak >= 50) achievements.push({ name: 'Half Century Hero', icon: '🏆', description: '50-day streak' });
      if (currentStreak >= 100) achievements.push({ name: 'Century Champion', icon: '💎', description: '100-day streak' });
      if (longestStreak >= 365) achievements.push({ name: 'Year Rounder', icon: '🌟', description: '365-day streak' });
      
      const finalStreakData = {
        currentStreak,
        longestStreak,
        totalStreaks,
        streakHistory: streakHistory.slice(0, 5), // Show last 5 streaks
        achievements,
        nextMilestone,
        streakMultiplier,
        totalPoints: Math.round(totalPoints),
        weeklyStreak,
        monthlyStreak
      };
      
      setStreakData(finalStreakData);
      
    } catch (error) {
      console.error('Failed to load streak data:', error);
      setStreakData(null);
    } finally {
      setStreaksLoading(false);
    }
  };

  // Get streak motivation message
  const getStreakMotivation = (streak: number) => {
    if (streak === 0) return "Start your learning journey today!";
    if (streak === 1) return "Great start! Keep the momentum going!";
    if (streak < 3) return "Building a habit takes time. You're doing great!";
    if (streak < 7) return "You're forming a study habit! Keep it up!";
    if (streak < 14) return "Two weeks strong! You're unstoppable!";
    if (streak < 30) return "Almost a month! You're a study machine!";
    if (streak < 50) return "Halfway to 100! Incredible dedication!";
    if (streak < 100) return "Century club is calling! Amazing work!";
    return "Legendary status achieved! You're an inspiration!";
  };

  // Get streak icon based on length
  const getStreakIcon = (streak: number) => {
    if (streak === 0) return '⭐';
    if (streak < 3) return '⭐';
    if (streak < 7) return '🔥';
    if (streak < 14) return '⚡';
    if (streak < 30) return '👑';
    if (streak < 50) return '🏆';
    if (streak < 100) return '💎';
    return '🌟';
  };

  // Load study calendar data
  const loadCalendarData = async () => {
    try {
      setCalendarLoading(true);
      
      // Get quiz history for calendar analysis
      const history = await getQuizHistory();
      
      if (history.length === 0) {
        setCalendarData({
          studyDays: [],
          monthlyStats: {
            totalDays: 0,
            studyDays: 0,
            totalQuizzes: 0,
            averageScore: 0,
            totalTime: 0
          },
          weeklyGoals: [],
          studyPatterns: []
        });
        return;
      }
      
      // Process calendar data
      const now = new Date();
      const currentMonth = selectedMonth.getMonth();
      const currentYear = selectedMonth.getFullYear();
      
      // Get all days in the selected month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      
      // Create calendar grid
      const calendarDays = [];
      const studyDays = new Set();
      let totalQuizzes = 0;
      let totalScore = 0;
      let totalTime = 0;
      
      // Fill in days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: null, isCurrentMonth: false });
      }
      
      // Fill in the days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toDateString();
        
        // Check if this day has study activity
        const dayHistory = history.filter(h => 
          new Date(h.completedAt).toDateString() === dateString
        );
        
        if (dayHistory.length > 0) {
          studyDays.add(day);
          totalQuizzes += dayHistory.length;
          totalScore += dayHistory.reduce((sum, h) => sum + h.score, 0);
          totalTime += dayHistory.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
        }
        
        calendarDays.push({
          day,
          isCurrentMonth: true,
          hasStudy: dayHistory.length > 0,
          studyCount: dayHistory.length,
          averageScore: dayHistory.length > 0 ? Math.round(totalScore / totalQuizzes) : 0,
          isToday: date.toDateString() === now.toDateString(),
          isPast: date < now
        });
      }
      
      // Calculate monthly statistics
      const monthlyStats = {
        totalDays: daysInMonth,
        studyDays: studyDays.size,
        totalQuizzes,
        averageScore: totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0,
        totalTime: Math.round(totalTime / 60) // Convert to minutes
      };
      
      // Generate weekly goals
      const weeklyGoals = [];
      for (let week = 0; week < Math.ceil(daysInMonth / 7); week++) {
        const weekStart = week * 7 + 1;
        const weekEnd = Math.min((week + 1) * 7, daysInMonth);
        const weekDays = calendarDays.filter((d, i) => 
          i >= firstDayOfMonth + weekStart - 1 && i < firstDayOfMonth + weekEnd
        );
        const weekStudyDays = weekDays.filter(d => d.hasStudy).length;
        const weekQuizzes = weekDays.reduce((sum, d) => sum + (d.studyCount || 0), 0);
        
        weeklyGoals.push({
          week: week + 1,
          days: weekEnd - weekStart + 1,
          studyDays: weekStudyDays,
          quizzes: weekQuizzes,
          goal: reminderSettings.goalQuizzesPerWeek,
          completed: weekQuizzes >= reminderSettings.goalQuizzesPerWeek
        });
      }
      
      // Analyze study patterns
      const studyPatterns = [];
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      for (let i = 0; i < 7; i++) {
        const dayHistory = history.filter(h => 
          new Date(h.completedAt).getDay() === i
        );
        
        studyPatterns.push({
          day: dayNames[i],
          studyCount: dayHistory.length,
          averageScore: dayHistory.length > 0 ? Math.round(dayHistory.reduce((sum, h) => sum + h.score, 0) / dayHistory.length) : 0,
          isPreferred: reminderSettings.daysOfWeek.includes(dayNames[i].toLowerCase())
        });
      }
      
      setCalendarData({
        calendarDays,
        monthlyStats,
        weeklyGoals,
        studyPatterns
      });
      
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setCalendarData(null);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Get calendar day styling
  const getCalendarDayStyle = (day: any) => {
    if (!day || !day.isCurrentMonth) return 'bg-gray-100 text-gray-400';
    if (day.isToday) return 'bg-blue-500 text-white font-bold';
    if (day.hasStudy) {
      if (day.studyCount >= 3) return 'bg-green-500 text-white';
      if (day.studyCount >= 2) return 'bg-green-400 text-white';
      return 'bg-green-300 text-white';
    }
    if (day.isPast) return 'bg-gray-200 text-gray-600';
    return 'bg-white text-gray-900 hover:bg-gray-50';
  };

  // Generate performance insights
  const generatePerformanceInsights = async () => {
    try {
      setInsightsLoading(true);
      
      // Get quiz history and stats
      const history = await getQuizHistory();
      const stats = await getQuizStats();
      
      if (history.length === 0) {
        setInsightsData({
          overallTrend: 'beginner',
          strengths: [],
          weaknesses: [],
          recommendations: [],
          learningStyle: 'balanced',
          improvementAreas: [],
          studyEfficiency: 'low',
          motivationFactors: []
        });
        return;
      }
      
      // Analyze overall performance trend
      const recentScores = history.slice(-10).map(h => h.score);
      const olderScores = history.slice(0, Math.min(10, Math.floor(history.length / 2))).map(h => h.score);
      
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
      
      let overallTrend = 'stable';
      if (recentAvg > olderAvg + 5) overallTrend = 'improving';
      else if (recentAvg < olderAvg - 5) overallTrend = 'declining';
      
      // Analyze strengths and weaknesses by category
      const categoryPerformance: Record<string, { total: number; scores: number[]; avgScore: number }> = {};
      const difficultyPerformance: Record<string, { total: number; scores: number[]; avgScore: number }> = {};
      
      history.forEach(attempt => {
        // Category analysis
        if (!categoryPerformance[attempt.quiz.type]) {
          categoryPerformance[attempt.quiz.type] = { total: 0, scores: [], avgScore: 0 };
        }
        categoryPerformance[attempt.quiz.type].total++;
        categoryPerformance[attempt.quiz.type].scores.push(attempt.score);
        
        // Difficulty analysis
        if (!difficultyPerformance[attempt.quiz.difficulty]) {
          difficultyPerformance[attempt.quiz.difficulty] = { total: 0, scores: [], avgScore: 0 };
        }
        difficultyPerformance[attempt.quiz.difficulty].total++;
        difficultyPerformance[attempt.quiz.difficulty].scores.push(attempt.score);
      });
      
      // Calculate averages
      Object.keys(categoryPerformance).forEach(category => {
        const scores = categoryPerformance[category].scores;
        categoryPerformance[category].avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      });
      
      Object.keys(difficultyPerformance).forEach(difficulty => {
        const scores = difficultyPerformance[difficulty].scores;
        difficultyPerformance[difficulty].avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      });
      
      // Identify strengths (top 2 categories with highest scores)
      const strengths = Object.entries(categoryPerformance)
        .sort(([, a], [, b]) => b.avgScore - a.avgScore)
        .slice(0, 2)
        .map(([category, data]) => ({
          category,
          avgScore: data.avgScore,
          totalAttempts: data.total,
          strength: data.avgScore >= 80 ? 'excellent' : data.avgScore >= 70 ? 'good' : 'solid'
        }));
      
      // Identify weaknesses (categories with lowest scores)
      const weaknesses = Object.entries(categoryPerformance)
        .sort(([, a], [, b]) => a.avgScore - b.avgScore)
        .slice(0, 2)
        .map(([category, data]) => ({
          category,
          avgScore: data.avgScore,
          totalAttempts: data.total,
          weakness: data.avgScore < 60 ? 'critical' : data.avgScore < 70 ? 'needs_improvement' : 'moderate'
        }));
      
      // Analyze study patterns
      const studyFrequency = history.length / Math.max(1, Math.ceil((Date.now() - new Date(history[0].completedAt).getTime()) / (1000 * 60 * 60 * 24)));
      const averageStudyGap = history.length > 1 ? 
        history.slice(1).reduce((total, attempt, index) => {
          const prevDate = new Date(history[index].completedAt);
          const currDate = new Date(attempt.completedAt);
          return total + Math.abs(currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / (history.length - 1) : 0;
      
      // Determine learning style
      let learningStyle = 'balanced';
      if (studyFrequency > 2) learningStyle = 'intensive';
      else if (studyFrequency < 0.5) learningStyle = 'casual';
      
      // Determine study efficiency
      let studyEfficiency = 'medium';
      if (overallTrend === 'improving' && studyFrequency > 1) studyEfficiency = 'high';
      else if (overallTrend === 'declining' || studyFrequency < 0.3) studyEfficiency = 'low';
      
      // Generate personalized recommendations
      const recommendations = [];
      
      if (weaknesses.length > 0) {
        weaknesses.forEach(weakness => {
          if (weakness.weakness === 'critical') {
            recommendations.push({
              type: 'urgent',
              title: `Focus on ${weakness.category}`,
              description: `Your ${weakness.category} performance needs immediate attention. Consider reviewing fundamentals.`,
              priority: 'high',
              action: `Take more ${weakness.category} quizzes and review incorrect answers`
            });
          } else if (weakness.weakness === 'needs_improvement') {
            recommendations.push({
              type: 'improvement',
              title: `Improve ${weakness.category} skills`,
              description: `Your ${weakness.category} performance shows room for improvement.`,
              priority: 'medium',
              action: `Practice with easier ${weakness.category} quizzes first`
            });
          }
        });
      }
      
      if (studyFrequency < 1) {
        recommendations.push({
          type: 'consistency',
          title: 'Increase study frequency',
          description: 'More regular practice will help maintain and improve your skills.',
          priority: 'medium',
          action: 'Aim for at least one quiz every 1-2 days'
        });
      }
      
      if (overallTrend === 'declining') {
        recommendations.push({
          type: 'performance',
          title: 'Review recent performance',
          description: 'Your scores have been declining. Consider reviewing previous material.',
          priority: 'high',
          action: 'Review flashcards and retake easier quizzes'
        });
      }
      
      if (strengths.length > 0) {
        recommendations.push({
          type: 'maintenance',
          title: `Maintain ${strengths[0].category} excellence`,
          description: `Keep up the great work in ${strengths[0].category}!`,
          priority: 'low',
          action: 'Continue practicing to maintain your high performance'
        });
      }
      
      // Identify improvement areas
      const improvementAreas = Object.entries(categoryPerformance)
        .filter(([, data]) => data.avgScore < 75)
        .map(([category, data]) => ({
          category,
          currentScore: data.avgScore,
          targetScore: 80,
          improvementNeeded: 80 - data.avgScore,
          priority: data.avgScore < 60 ? 'high' : 'medium'
        }));
      
      // Identify motivation factors
      const motivationFactors = [];
      if (streakData && streakData.currentStreak > 7) {
        motivationFactors.push('maintaining_streak');
      }
      if (recentScores.some(score => score >= 90)) {
        motivationFactors.push('high_scores');
      }
      if (history.length > 20) {
        motivationFactors.push('consistent_practice');
      }
      if (overallTrend === 'improving') {
        motivationFactors.push('seeing_progress');
      }
      
      setInsightsData({
        overallTrend,
        strengths,
        weaknesses,
        recommendations,
        learningStyle,
        improvementAreas,
        studyEfficiency,
        motivationFactors,
        categoryPerformance,
        difficultyPerformance,
        studyFrequency: Math.round(studyFrequency * 100) / 100,
        averageStudyGap: Math.round(averageStudyGap * 100) / 100,
        totalAttempts: history.length,
        recentPerformance: recentScores,
        olderPerformance: olderScores
      });
      
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setInsightsData(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Get insight priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get insight type icon
  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'improvement': return '📈';
      case 'consistency': return '⏰';
      case 'performance': return '📊';
      case 'maintenance': return '🎯';
      default: return '💡';
    }
  };

  // Get learning style description
  const getLearningStyleDescription = (style: string) => {
    switch (style) {
      case 'intensive': return 'You prefer focused, frequent study sessions';
      case 'casual': return 'You prefer relaxed, occasional study sessions';
      case 'balanced': return 'You maintain a good balance of study frequency';
      default: return 'Your study pattern is still developing';
    }
  };

  // Custom Quiz Creation Functions
  const addQuestion = () => {
    if (currentQuestion.question.trim() && currentQuestion.correctAnswer.trim()) {
      const newQuestion = {
        ...currentQuestion,
        id: Date.now().toString(),
        type: 'multiple-choice'
      };
      
      setCustomQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
      
      // Reset current question
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1
      });
    }
  };

  const editQuestion = (index: number) => {
    const question = customQuizData.questions[index];
    setCurrentQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      points: question.points
    });
    setEditingQuestionIndex(index);
  };

  const updateQuestion = () => {
    if (editingQuestionIndex !== null && currentQuestion.question.trim() && currentQuestion.correctAnswer.trim()) {
      const updatedQuestion = {
        ...currentQuestion,
        id: customQuizData.questions[editingQuestionIndex].id,
        type: 'multiple-choice'
      };
      
      setCustomQuizData(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => 
          i === editingQuestionIndex ? updatedQuestion : q
        )
      }));
      
      // Reset editing state
      setEditingQuestionIndex(null);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1
      });
    }
  };

  const deleteQuestion = (index: number) => {
    setCustomQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === customQuizData.questions.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    setCustomQuizData(prev => {
      const newQuestions = [...prev.questions];
      [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
      return { ...prev, questions: newQuestions };
    });
  };

  const validateQuiz = () => {
    const errors = [];
    
    if (!customQuizData.title.trim()) errors.push('Quiz title is required');
    if (!customQuizData.description.trim()) errors.push('Quiz description is required');
    if (customQuizData.questions.length < 3) errors.push('Quiz must have at least 3 questions');
    if (customQuizData.questions.length > 50) errors.push('Quiz cannot have more than 50 questions');
    
    customQuizData.questions.forEach((q, index) => {
      if (!q.question.trim()) errors.push(`Question ${index + 1} text is required`);
      if (q.options.filter(opt => opt.trim()).length < 2) errors.push(`Question ${index + 1} must have at least 2 options`);
      if (!q.correctAnswer.trim()) errors.push(`Question ${index + 1} must have a correct answer`);
      if (!q.options.includes(q.correctAnswer)) errors.push(`Question ${index + 1} correct answer must be one of the options`);
    });
    
    return errors;
  };

  const saveCustomQuiz = async () => {
    const errors = validateQuiz();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }
    
    try {
      setCustomQuizLoading(true);
      
      // For now, we'll save to localStorage as a demo
      // In a real app, this would be sent to the backend
      const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      const newQuiz = {
        ...customQuizData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: 'current-user', // In real app, get from auth context
        isCustom: true
      };
      
      savedQuizzes.push(newQuiz);
      localStorage.setItem('customQuizzes', JSON.stringify(savedQuizzes));
      
      // Refresh the quiz list to show the newly created quiz
      try {
        const apiQuizzes = await getQuizzes();
        const updatedCustomQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
        const allQuizzes = [...apiQuizzes, ...updatedCustomQuizzes];
        setQuizzes(allQuizzes);
        setFilteredQuizzes(filterQuizzes(allQuizzes, selectedDifficulty, selectedCategory));
      } catch (error) {
        console.error('Failed to refresh quiz list:', error);
      }
      
      // Reset form
      setCustomQuizData({
        title: '',
        description: '',
        type: 'vocabulary',
        difficulty: 'medium',
        timeLimit: 15,
        questions: []
      });
      
      alert('Custom quiz saved successfully! You can now find it in your quiz list.');
      setShowCustomQuizCreator(false);
      
    } catch (error) {
      console.error('Failed to save custom quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setCustomQuizLoading(false);
    }
  };

  const resetCustomQuiz = () => {
    if (confirm('Are you sure you want to reset the quiz? All progress will be lost.')) {
      setCustomQuizData({
        title: '',
        description: '',
        type: 'vocabulary',
        difficulty: 'medium',
        timeLimit: 15,
        questions: []
      });
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: '',
        points: 1
      });
      setEditingQuestionIndex(null);
    }
  };

  const getQuizTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary': return '📚';
      case 'grammar': return '📝';
      case 'reading': return '📖';
      case 'listening': return '🎧';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Quiz Sharing Functions
  const loadSharedQuizzes = async () => {
    try {
      setSharingLoading(true);
      
      // Load custom quizzes from localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      const publicQuizzes = savedQuizzes.filter((quiz: any) => quiz.isPublic);
      
      // In a real app, this would fetch from backend API
      setSharedQuizzes(publicQuizzes);
      
    } catch (error) {
      console.error('Failed to load shared quizzes:', error);
      setSharedQuizzes([]);
    } finally {
      setSharingLoading(false);
    }
  };

  const shareQuiz = async (quiz: any) => {
    try {
      setSharingLoading(true);
      
      // Update quiz sharing settings
      const updatedQuiz = {
        ...quiz,
        isPublic: shareSettings.isPublic,
        shareSettings: { ...shareSettings },
        sharedAt: new Date().toISOString(),
        shareId: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Update in localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      const updatedQuizzes = savedQuizzes.map((q: any) => 
        q.id === quiz.id ? updatedQuiz : q
      );
      localStorage.setItem('customQuizzes', JSON.stringify(updatedQuizzes));
      
      // Generate share link
      const shareLink = `${window.location.origin}/quiz/shared/${updatedQuiz.shareId}`;
      
      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareLink);
        alert('Share link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share link copied to clipboard!');
      }
      
      // Refresh shared quizzes list
      await loadSharedQuizzes();
      
    } catch (error) {
      console.error('Failed to share quiz:', error);
      alert('Failed to share quiz. Please try again.');
    } finally {
      setSharingLoading(false);
    }
  };

  const unshareQuiz = async (quiz: any) => {
    if (!confirm('Are you sure you want to unshare this quiz? It will no longer be visible to other users.')) {
      return;
    }
    
    try {
      setSharingLoading(true);
      
      // Update quiz to private
      const updatedQuiz = {
        ...quiz,
        isPublic: false,
        shareSettings: null,
        sharedAt: null,
        shareId: null
      };
      
      // Update in localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      const updatedQuizzes = savedQuizzes.map((q: any) => 
        q.id === quiz.id ? updatedQuiz : q
      );
      localStorage.setItem('customQuizzes', JSON.stringify(updatedQuizzes));
      
      // Refresh shared quizzes list
      await loadSharedQuizzes();
      
      alert('Quiz unshared successfully!');
      
    } catch (error) {
      console.error('Failed to unshare quiz:', error);
      alert('Failed to unshare quiz. Please try again.');
    } finally {
      setSharingLoading(false);
    }
  };

  const duplicateQuiz = async (quiz: any) => {
    try {
      setSharingLoading(true);
      
      // Create a copy of the quiz
      const duplicatedQuiz = {
        ...quiz,
        id: Date.now().toString(),
        title: `${quiz.title} (Copy)`,
        createdAt: new Date().toISOString(),
        createdBy: 'current-user', // In real app, get from auth context
        isPublic: false,
        shareSettings: null,
        sharedAt: null,
        shareId: null
      };
      
      // Save to localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      savedQuizzes.push(duplicatedQuiz);
      localStorage.setItem('customQuizzes', JSON.stringify(savedQuizzes));
      
      alert('Quiz duplicated successfully! You can find it in your custom quizzes.');
      
    } catch (error) {
      console.error('Failed to duplicate quiz:', error);
      alert('Failed to duplicate quiz. Please try again.');
    } finally {
      setSharingLoading(false);
    }
  };

  const getShareStatusIcon = (quiz: any) => {
    if (!quiz.isPublic) return '🔒';
    if (quiz.shareSettings?.allowDuplication) return '📋';
    return '🔗';
  };

  const getShareStatusText = (quiz: any) => {
    if (!quiz.isPublic) return 'Private';
    if (quiz.shareSettings?.allowDuplication) return 'Public & Duplicatable';
    return 'Public';
  };

  const formatShareDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gamification Functions
  const loadGamificationData = async () => {
    try {
      setGamificationLoading(true);
      
      // Get quiz history and stats for gamification calculations
      const history = await getQuizHistory();
      const stats = await getQuizStats();
      
      if (history.length === 0) {
        setGamificationData({
          level: 1,
          experience: 0,
          experienceToNext: 100,
          totalPoints: 0,
          achievements: [],
          badges: [],
          dailyStreak: 0,
          weeklyGoal: 0,
          monthlyGoal: 0,
          rank: 'Beginner',
          progress: 0
        });
        return;
      }
      
      // Calculate experience and level
      let totalExperience = 0;
      let totalPoints = 0;
      
      history.forEach(attempt => {
        // Base experience for completing quiz
        totalExperience += 10;
        
        // Bonus experience for score
        if (attempt.score >= 90) totalExperience += 20;
        else if (attempt.score >= 80) totalExperience += 15;
        else if (attempt.score >= 70) totalExperience += 10;
        else if (attempt.score >= 60) totalExperience += 5;
        
        // Bonus for difficulty
        if (attempt.quiz?.difficulty === 'hard') totalExperience += 15;
        else if (attempt.quiz?.difficulty === 'medium') totalExperience += 10;
        else totalExperience += 5;
        
        // Points calculation
        totalPoints += Math.floor(attempt.score / 10) * 10;
        if (attempt.score >= 90) totalPoints += 50; // Perfect score bonus
        if (attempt.score >= 80) totalPoints += 25; // High score bonus
      });
      
      // Calculate level (every 100 XP = 1 level)
      const level = Math.floor(totalExperience / 100) + 1;
      const experienceInCurrentLevel = totalExperience % 100;
      const experienceToNext = 100 - experienceInCurrentLevel;
      const progress = (experienceInCurrentLevel / 100) * 100;
      
      // Determine rank based on level
      let rank = 'Beginner';
      if (level >= 50) rank = 'Legend';
      else if (level >= 40) rank = 'Master';
      else if (level >= 30) rank = 'Expert';
      else if (level >= 20) rank = 'Advanced';
      else if (level >= 10) rank = 'Intermediate';
      else if (level >= 5) rank = 'Apprentice';
      
      // Calculate daily streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      let dailyStreak = 0;
      
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        const hasActivity = history.some(h => 
          new Date(h.completedAt).toDateString() === checkDate
        );
        if (hasActivity) {
          dailyStreak++;
        } else {
          break;
        }
      }
      
      // Calculate weekly and monthly goals
      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const weeklyQuizzes = history.filter(h => new Date(h.completedAt) >= weekStart).length;
      const monthlyQuizzes = history.filter(h => new Date(h.completedAt) >= monthStart).length;
      
      // Generate achievements
      const achievements = [];
      
      if (totalExperience >= 1000) achievements.push({ id: 'xp_master', name: 'XP Master', description: 'Earned 1000+ experience points', icon: '⭐', unlocked: true });
      if (level >= 10) achievements.push({ id: 'level_up', name: 'Level Up!', description: 'Reached level 10', icon: '🚀', unlocked: true });
      if (dailyStreak >= 7) achievements.push({ id: 'streak_week', name: 'Week Warrior', description: '7-day study streak', icon: '🔥', unlocked: true });
      if (dailyStreak >= 30) achievements.push({ id: 'streak_month', name: 'Month Master', description: '30-day study streak', icon: '👑', unlocked: true });
      if (history.length >= 50) achievements.push({ id: 'quiz_enthusiast', name: 'Quiz Enthusiast', description: 'Completed 50+ quizzes', icon: '🎯', unlocked: true });
      if (stats.bestScore >= 95) achievements.push({ id: 'perfectionist', name: 'Perfectionist', description: 'Achieved 95%+ score', icon: '🏆', unlocked: true });
      
      // Generate enhanced badges
      const badges = generateAllBadges({
        level,
        experience: totalExperience,
        totalQuizzes: history.length,
        dailyStreak,
        bestScore: stats.bestScore,
        averageScore: stats.averageScore,
        weeklyGoal: weeklyQuizzes,
        totalPoints
      });
      
      setGamificationData({
        level,
        experience: totalExperience,
        experienceInCurrentLevel,
        experienceToNext,
        totalPoints,
        achievements,
        badges,
        dailyStreak,
        weeklyGoal: weeklyQuizzes,
        monthlyGoal: monthlyQuizzes,
        rank,
        progress,
        totalQuizzes: history.length,
        averageScore: stats.averageScore,
        bestScore: stats.bestScore
      });
      
    } catch (error) {
      console.error('Failed to load gamification data:', error);
      setGamificationData(null);
    } finally {
      setGamificationLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 40) return 'text-purple-600 bg-purple-50 border-purple-200';
    if (level >= 30) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (level >= 20) return 'text-green-600 bg-green-50 border-green-200';
    if (level >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Legend': return '👑';
      case 'Master': return '🏆';
      case 'Expert': return '⭐';
      case 'Advanced': return '🚀';
      case 'Intermediate': return '📚';
      case 'Apprentice': return '🎯';
      default: return '🌱';
    }
  };

  const getAchievementProgress = (achievementId: string) => {
    if (!gamificationData) return 0;
    
    switch (achievementId) {
      case 'xp_master':
        return Math.min((gamificationData.experience / 1000) * 100, 100);
      case 'level_up':
        return Math.min((gamificationData.level / 10) * 100, 100);
      case 'streak_week':
        return Math.min((gamificationData.dailyStreak / 7) * 100, 100);
      case 'streak_month':
        return Math.min((gamificationData.dailyStreak / 30) * 100, 100);
      case 'quiz_enthusiast':
        return Math.min((gamificationData.totalQuizzes / 50) * 100, 100);
      case 'perfectionist':
        return Math.min((gamificationData.bestScore / 95) * 100, 100);
      default:
        return 0;
    }
  };

  const unlockReward = (rewardType: string, rewardData: any) => {
    const newReward = {
      id: Date.now().toString(),
      type: rewardType,
      data: rewardData,
      unlockedAt: new Date().toISOString(),
      claimed: false
    };
    
    setUnlockedRewards(prev => [...prev, newReward]);
    
    // Show celebration
    alert(`🎉 Congratulations! You've unlocked: ${rewardData.name || rewardType}!`);
  };

  // Enhanced Badge System Functions
  const generateAllBadges = (userData: any) => {
    const allBadges = [
      // Performance Badges
      {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🌱',
        category: 'performance',
        rarity: 'common',
        unlocked: userData.totalQuizzes >= 1,
        requirement: 'Complete 1 quiz',
        progress: Math.min(userData.totalQuizzes, 1),
        maxProgress: 1,
        color: 'bg-green-500',
        borderColor: 'border-green-200',
        bgColor: 'bg-green-50'
      },
      {
        id: 'quiz_10',
        name: 'Quiz Explorer',
        description: 'Complete 10 quizzes',
        icon: '🔍',
        category: 'performance',
        rarity: 'common',
        unlocked: userData.totalQuizzes >= 10,
        requirement: 'Complete 10 quizzes',
        progress: Math.min(userData.totalQuizzes, 10),
        maxProgress: 10,
        color: 'bg-blue-500',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'quiz_50',
        name: 'Quiz Enthusiast',
        description: 'Complete 50 quizzes',
        icon: '🎯',
        category: 'performance',
        rarity: 'rare',
        unlocked: userData.totalQuizzes >= 50,
        requirement: 'Complete 50 quizzes',
        progress: Math.min(userData.totalQuizzes, 50),
        maxProgress: 50,
        color: 'bg-purple-500',
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'quiz_100',
        name: 'Quiz Master',
        description: 'Complete 100 quizzes',
        icon: '👑',
        category: 'performance',
        rarity: 'epic',
        unlocked: userData.totalQuizzes >= 100,
        requirement: 'Complete 100 quizzes',
        progress: Math.min(userData.totalQuizzes, 100),
        maxProgress: 100,
        color: 'bg-yellow-500',
        borderColor: 'border-yellow-200',
        bgColor: 'bg-yellow-50'
      },
      {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Achieve a perfect score (100%)',
        icon: '💎',
        category: 'performance',
        rarity: 'legendary',
        unlocked: userData.bestScore >= 100,
        requirement: 'Score 100% on any quiz',
        progress: userData.bestScore,
        maxProgress: 100,
        color: 'bg-red-500',
        borderColor: 'border-red-200',
        bgColor: 'bg-red-50'
      },
      {
        id: 'high_scorer',
        name: 'High Achiever',
        description: 'Achieve 90%+ on a quiz',
        icon: '⭐',
        category: 'performance',
        rarity: 'rare',
        unlocked: userData.bestScore >= 90,
        requirement: 'Score 90%+ on any quiz',
        progress: userData.bestScore,
        maxProgress: 100,
        color: 'bg-indigo-500',
        borderColor: 'border-indigo-200',
        bgColor: 'bg-indigo-50'
      },
      
      // Streak Badges
      {
        id: 'streak_3',
        name: 'Getting Started',
        description: 'Maintain a 3-day study streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        unlocked: userData.dailyStreak >= 3,
        requirement: '3-day study streak',
        progress: Math.min(userData.dailyStreak, 3),
        maxProgress: 3,
        color: 'bg-orange-500',
        borderColor: 'border-orange-200',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day study streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'rare',
        unlocked: userData.dailyStreak >= 7,
        requirement: '7-day study streak',
        progress: Math.min(userData.dailyStreak, 7),
        maxProgress: 7,
        color: 'bg-yellow-500',
        borderColor: 'border-yellow-200',
        bgColor: 'bg-yellow-50'
      },
      {
        id: 'streak_14',
        name: 'Dedicated Learner',
        description: 'Maintain a 14-day study streak',
        icon: '🏆',
        category: 'streak',
        rarity: 'epic',
        unlocked: userData.dailyStreak >= 14,
        requirement: '14-day study streak',
        progress: Math.min(userData.dailyStreak, 14),
        maxProgress: 14,
        color: 'bg-purple-500',
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'streak_30',
        name: 'Month Master',
        description: 'Maintain a 30-day study streak',
        icon: '👑',
        category: 'streak',
        rarity: 'legendary',
        unlocked: userData.dailyStreak >= 30,
        requirement: '30-day study streak',
        progress: Math.min(userData.dailyStreak, 30),
        maxProgress: 30,
        color: 'bg-red-500',
        borderColor: 'border-red-200',
        bgColor: 'bg-red-50'
      },
      
      // Milestone Badges
      {
        id: 'level_5',
        name: 'Bronze Learner',
        description: 'Reach level 5',
        icon: '🥉',
        category: 'milestone',
        rarity: 'common',
        unlocked: userData.level >= 5,
        requirement: 'Reach level 5',
        progress: Math.min(userData.level, 5),
        maxProgress: 5,
        color: 'bg-yellow-600',
        borderColor: 'border-yellow-200',
        bgColor: 'bg-yellow-50'
      },
      {
        id: 'level_15',
        name: 'Silver Scholar',
        description: 'Reach level 15',
        icon: '🥈',
        category: 'milestone',
        rarity: 'rare',
        unlocked: userData.level >= 15,
        requirement: 'Reach level 15',
        progress: Math.min(userData.level, 15),
        maxProgress: 15,
        color: 'bg-gray-400',
        borderColor: 'border-gray-200',
        bgColor: 'bg-gray-50'
      },
      {
        id: 'level_25',
        name: 'Gold Graduate',
        description: 'Reach level 25',
        icon: '🥇',
        category: 'milestone',
        rarity: 'epic',
        unlocked: userData.level >= 25,
        requirement: 'Reach level 25',
        progress: Math.min(userData.level, 25),
        maxProgress: 25,
        color: 'bg-yellow-400',
        borderColor: 'border-yellow-200',
        bgColor: 'bg-yellow-50'
      },
      {
        id: 'level_50',
        name: 'Legendary Learner',
        description: 'Reach level 50',
        icon: '🌟',
        category: 'milestone',
        rarity: 'legendary',
        unlocked: userData.level >= 50,
        requirement: 'Reach level 50',
        progress: Math.min(userData.level, 50),
        maxProgress: 50,
        color: 'bg-purple-500',
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'xp_1000',
        name: 'Experience Collector',
        description: 'Earn 1000+ experience points',
        icon: '💫',
        category: 'milestone',
        rarity: 'rare',
        unlocked: userData.experience >= 1000,
        requirement: 'Earn 1000 XP',
        progress: Math.min(userData.experience, 1000),
        maxProgress: 1000,
        color: 'bg-blue-500',
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50'
      },
      {
        id: 'xp_5000',
        name: 'Experience Master',
        description: 'Earn 5000+ experience points',
        icon: '✨',
        category: 'milestone',
        rarity: 'epic',
        unlocked: userData.experience >= 5000,
        requirement: 'Earn 5000 XP',
        progress: Math.min(userData.experience, 5000),
        maxProgress: 5000,
        color: 'bg-indigo-500',
        borderColor: 'border-indigo-200',
        bgColor: 'bg-indigo-50'
      },
      
      // Special Badges
      {
        id: 'first_week',
        name: 'Week One Warrior',
        description: 'Complete your first week of study',
        icon: '📅',
        category: 'special',
        rarity: 'common',
        unlocked: userData.weeklyGoal >= 1,
        requirement: 'Complete 1 week of study',
        progress: Math.min(userData.weeklyGoal, 1),
        maxProgress: 1,
        color: 'bg-green-500',
        borderColor: 'border-green-200',
        bgColor: 'bg-green-50'
      },
      {
        id: 'consistency',
        name: 'Consistent Learner',
        description: 'Maintain consistent study habits',
        icon: '📚',
        category: 'special',
        rarity: 'rare',
        unlocked: userData.averageScore >= 80 && userData.totalQuizzes >= 20,
        requirement: '80%+ average score with 20+ quizzes',
        progress: Math.min(userData.averageScore, 80),
        maxProgress: 100,
        color: 'bg-teal-500',
        borderColor: 'border-teal-200',
        bgColor: 'bg-teal-50'
      },
      {
        id: 'variety',
        name: 'Versatile Learner',
        description: 'Try different types of quizzes',
        icon: '🎲',
        category: 'special',
        rarity: 'epic',
        unlocked: userData.totalQuizzes >= 30,
        requirement: 'Complete 30+ quizzes',
        progress: Math.min(userData.totalQuizzes, 30),
        maxProgress: 30,
        color: 'bg-pink-500',
        borderColor: 'border-pink-200',
        bgColor: 'bg-pink-50'
      },
      {
        id: 'dedication',
        name: 'Dedicated Student',
        description: 'Show exceptional dedication to learning',
        icon: '🎓',
        category: 'special',
        rarity: 'legendary',
        unlocked: userData.level >= 30 && userData.dailyStreak >= 20,
        requirement: 'Level 30+ with 20+ day streak',
        progress: Math.min(userData.level, 30),
        maxProgress: 50,
        color: 'bg-red-500',
        borderColor: 'border-red-200',
        bgColor: 'bg-red-50'
      }
    ];
    
    return allBadges;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-red-600 bg-red-50 border-red-200';
      case 'epic': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'rare': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'common': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '🌟';
      case 'epic': return '💎';
      case 'rare': return '⭐';
      case 'common': return '🌱';
      default: return '📌';
    }
  };

  const filterBadgesByCategory = (badges: any[], category: string) => {
    if (category === 'all') return badges;
    return badges.filter(badge => badge.category === category);
  };

  const getBadgeProgressPercentage = (badge: any) => {
    return Math.min((badge.progress / badge.maxProgress) * 100, 100);
  };

  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizActive, timeLeft]);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    setIsQuizActive(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || !selectedQuiz) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);

    // Check if answer is correct
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + currentQuestion.points);
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedQuiz) return;

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    if (!selectedQuiz) return;
    
    setIsQuizActive(false);
    
    // Submit quiz results to API
    try {
      const totalPossiblePoints = selectedQuiz.questions.reduce((sum, q) => sum + q.points, 0);
      const percentageScore = totalPossiblePoints > 0 ? Math.round((score / totalPossiblePoints) * 100) : 0;
      
      const quizResult: QuizResult = {
        quizId: selectedQuiz.id,
        score: percentageScore,
        totalQuestions: selectedQuiz.questions.length,
        correctAnswers: correctAnswers, // Use the actual count of correct answers
        timeSpent: (selectedQuiz.timeLimit * 60) - timeLeft, // Time spent in seconds
        answers: {}, // This would be populated with actual answers
      };
      
      await submitQuizResult(quizResult);
    } catch (error) {
      console.error('Failed to submit quiz result:', error);
      // Continue with quiz completion even if submission fails
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    if (!selectedQuiz) return null;
    return selectedQuiz.questions[currentQuestionIndex];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedQuiz && isQuizActive) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Quiz Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  <span>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion.question}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === option
                        ? option === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        <span className="text-gray-700 font-semibold mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </span>
                      {selectedAnswer === option && (
                        option === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
                  <p className="text-blue-800">{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {showExplanation && (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                >
                  {currentQuestionIndex < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (selectedQuiz && !isQuizActive) {
    // Quiz completed
    const totalPoints = selectedQuiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
              <p className="text-gray-600">Great job completing the quiz</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}/{totalPoints}</div>
                <div className="text-lg text-gray-600 mb-4">{percentage}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {correctAnswers}
                  </div>
                  <div className="text-sm text-green-700">Correct</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedQuiz.questions.length - correctAnswers}
                  </div>
                  <div className="text-sm text-red-700">Incorrect</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-4">
              <Button
                onClick={() => {
                  setSelectedQuiz(null);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setScore(0);
                }}
                variant="outline"
                className="flex-1"
              >
                Take Another Quiz
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">TOEIC Quizzes</h1>
              <p className="text-gray-600">Test your knowledge with our interactive TOEIC-style quizzes</p>
            </div>
          </div>
          
          {/* Hamburger Navigation */}
          <div className="mt-4 flex justify-end">
            <div className="relative">
              <Button
                onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <div className="flex flex-col gap-1">
                  <div className="w-4 h-0.5 bg-gray-600"></div>
                  <div className="w-4 h-0.5 bg-gray-600"></div>
                  <div className="w-4 h-0.5 bg-gray-600"></div>
                </div>
                <span>More Features</span>
              </Button>
              
              {/* Dropdown Menu */}
              {showAdvancedFeatures && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-2 space-y-1">
                    <Button
                      onClick={() => {
                        if (!showAnalytics) {
                          loadQuizAnalytics();
                        }
                        setShowAnalytics(!showAnalytics);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        router.push('/quiz/history');
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (!showRecommendations) {
                          generateRecommendations();
                        }
                        setShowRecommendations(!showRecommendations);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {showRecommendations ? 'Hide Recommendations' : 'Get Recommendations'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowProgressCharts(!showProgressCharts);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <LineChart className="w-4 h-4 mr-2" />
                      {showProgressCharts ? 'Hide Progress Charts' : 'Show Progress Charts'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (!showStudyReminders) {
                          loadReminderData();
                        }
                        setShowStudyReminders(!showStudyReminders);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {showStudyReminders ? 'Hide Study Reminders' : 'Study Reminders'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (!showLearningStreaks) {
                          loadStreakData();
                        }
                        setShowLearningStreaks(!showLearningStreaks);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {showLearningStreaks ? 'Hide Learning Streaks' : 'Learning Streaks'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (!showStudyCalendar) {
                          loadCalendarData();
                        }
                        setShowStudyCalendar(!showStudyCalendar);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {showStudyCalendar ? 'Hide Study Calendar' : 'Study Calendar'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowPerformanceInsights(!showPerformanceInsights);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {showPerformanceInsights ? 'Hide Performance Insights' : 'Performance Insights'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowCustomQuizCreator(!showCustomQuizCreator);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {showCustomQuizCreator ? 'Hide Quiz Creator' : 'Create Quiz'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowQuizSharing(!showQuizSharing);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      {showQuizSharing ? 'Hide Quiz Sharing' : 'Quiz Sharing'}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setShowGamification(!showGamification);
                        setShowAdvancedFeatures(false);
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {showGamification ? 'Hide Rewards & Levels' : 'Rewards & Levels'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search quizzes by title, description, or content..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <Search className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm text-gray-600">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
              </div>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Search Suggestions */}
          {!searchTerm && quizzes.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {getSearchSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchTerm(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quiz Recommendations */}
        {showRecommendations && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Recommended for You
              </h2>
              
              {recommendationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Analyzing your performance...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-700 mb-4">
                    Based on your learning patterns and performance, here are quizzes we think would be perfect for you:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((quiz) => (
                      <Card key={quiz.id} className="bg-white hover:shadow-lg transition-shadow border-blue-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-blue-600 font-medium">Recommended</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{quiz.description}</p>
                          <div className="mt-2 p-2 bg-blue-50 rounded-md">
                            <p className="text-xs text-blue-800">
                              💡 {getRecommendationExplanation(quiz)}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Type:</span>
                              <span className="font-medium text-gray-900 capitalize">{quiz.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Difficulty:</span>
                              <span className="font-medium text-gray-900 capitalize">{quiz.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-700">Questions:</span>
                              <span className="font-medium text-gray-900">{quiz.questions.length}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button
                            onClick={() => startQuiz(quiz)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Start Recommended Quiz
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600">
                      These recommendations are personalized based on your learning progress and performance patterns.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
                  <p className="text-gray-600">Take some quizzes first to get personalized recommendations!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Charts */}
        {showProgressCharts && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <LineChart className="w-6 h-6 text-green-600" />
                Learning Progress Charts
              </h2>
              
              {progressLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your progress data...</p>
                </div>
              ) : progressData ? (
                <div className="space-y-8">
                  {/* Overall Progress Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{progressData.overallStats.totalAttempts}</div>
                        <div className="text-sm text-gray-600">Total Quizzes</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{progressData.overallStats.averageScore}%</div>
                        <div className="text-sm text-gray-600">Average Score</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${progressData.overallStats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {progressData.overallStats.improvement >= 0 ? '+' : ''}{progressData.overallStats.improvement}%
                        </div>
                        <div className="text-sm text-gray-600">Improvement</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{progressData.overallStats.bestScore}%</div>
                        <div className="text-sm text-gray-600">Best Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Score Trend Chart */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Progression Over Time</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                      {progressData.scoreTrend.map((point: any, index: number) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                            style={{ height: `${(point.score / 100) * 200}px` }}
                            title={`${point.quizTitle}: ${point.score}%`}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2 text-center">
                            {point.date}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">Your quiz scores over time - higher bars mean better performance!</p>
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
                      <div className="space-y-3">
                        {progressData.categoryPerformance.map((category: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700">{category.category}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${category.averageScore}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-12 text-right">
                                {category.averageScore}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Study Frequency */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Frequency</h3>
                      <div className="space-y-4">
                        {progressData.studyFrequency.map((week: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-700">{week.week}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {Array.from({ length: Math.min(week.count, 5) }).map((_, i) => (
                                  <div key={i} className="w-3 h-3 bg-green-500 rounded-full"></div>
                                ))}
                                {week.count > 5 && (
                                  <span className="text-xs text-gray-500 ml-1">+{week.count - 5}</span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-900 w-8 text-right">
                                {week.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <p className="text-xs text-green-800">
                          💡 Consistent study habits lead to better results!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Progression */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Progression</h3>
                    <div className="h-48 flex items-end justify-between gap-4">
                      {progressData.difficultyProgression.map((point: any, index: number) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="text-center mb-2">
                            <div className={`text-sm font-medium ${
                              point.difficulty === 1 ? 'text-green-600' : 
                              point.difficulty === 2 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {point.difficultyLabel}
                            </div>
                          </div>
                          <div 
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              point.difficulty === 1 ? 'bg-green-500' : 
                              point.difficulty === 2 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${(point.score / 100) * 150}px` }}
                            title={`${point.difficultyLabel}: ${point.score}%`}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2 text-center">
                            Quiz {point.attempt}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Track how you're handling different difficulty levels over time
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data available</h3>
                  <p className="text-gray-600">Take some quizzes first to see your progress charts!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study Reminders */}
        {showStudyReminders && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-orange-600" />
                Study Reminders & Goals
              </h2>
              
              {remindersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your study data...</p>
                </div>
              ) : reminderStats ? (
                <div className="space-y-8">
                  {/* Current Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{reminderStats.currentStreak}</div>
                        <div className="text-sm text-gray-600">Current Streak</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{reminderStats.longestStreak}</div>
                        <div className="text-sm text-gray-600">Longest Streak</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{reminderStats.thisWeekQuizzes}</div>
                        <div className="text-sm text-gray-600">This Week</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{reminderStats.averageStudyGap}</div>
                        <div className="text-sm text-gray-600">Avg. Gap (Days)</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Goal Progress */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal Progress</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Target: {reminderSettings.goalQuizzesPerWeek} quizzes per week</span>
                        <span className="text-gray-700">{reminderStats.thisWeekQuizzes}/{reminderSettings.goalQuizzesPerWeek}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${reminderStats.weeklyGoalProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-center">
                        <span className={`text-sm font-medium ${
                          reminderStats.weeklyGoalProgress >= 100 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {reminderStats.weeklyGoalProgress >= 100 ? '🎉 Goal achieved!' : `${Math.round(reminderStats.weeklyGoalProgress)}% complete`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reminder Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Enable Reminders</span>
                          <button
                            onClick={() => updateReminderSettings({ enabled: !reminderSettings.enabled })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              reminderSettings.enabled ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              reminderSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Time</label>
                          <input
                            type="time"
                            value={reminderSettings.preferredTime}
                            onChange={(e) => updateReminderSettings({ preferredTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Study Time (minutes)</label>
                          <input
                            type="number"
                            min="5"
                            max="120"
                            value={reminderSettings.minStudyTime}
                            onChange={(e) => updateReminderSettings({ minStudyTime: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Days</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleDayReminder(day)}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                              reminderSettings.daysOfWeek.includes(day)
                                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                              }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Next Study Recommendation */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      Next Study Recommendation
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Last Study Date:</span>
                        <span className="font-medium text-gray-900">{reminderStats.lastStudyDate || 'Never'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Next Recommended Study:</span>
                        <span className="font-medium text-blue-600">{reminderStats.nextRecommendedStudy}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Current Streak:</span>
                        <span className="font-medium text-orange-600">{reminderStats.currentStreak} day{reminderStats.currentStreak !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-800">
                        💡 {reminderStats.currentStreak > 0 
                          ? `Great job! Keep your ${reminderStats.currentStreak}-day streak going!` 
                          : "Start building your study habit today!"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No study data available</h3>
                  <p className="text-gray-600">Take some quizzes first to set up your study reminders!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Streaks */}
        {showLearningStreaks && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-600" />
                Learning Streaks & Achievements
              </h2>
              
              {streaksLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Analyzing your streaks...</p>
                </div>
              ) : streakData ? (
                <div className="space-y-8">
                  {/* Current Streak Status */}
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-lg border border-yellow-300">
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getStreakIcon(streakData.currentStreak)}</div>
                      <div className="text-4xl font-bold text-yellow-800 mb-2">
                        {streakData.currentStreak} Day{streakData.currentStreak !== 1 ? 's' : ''}
                      </div>
                      <div className="text-lg text-yellow-700 mb-4">
                        {getStreakMotivation(streakData.currentStreak)}
                      </div>
                      {streakData.nextMilestone && (
                        <div className="text-sm text-yellow-600">
                          Next milestone: {streakData.nextMilestone} days
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Streak Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{streakData.longestStreak}</div>
                        <div className="text-sm text-gray-600">Longest Streak</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{streakData.totalStreaks}</div>
                        <div className="text-sm text-gray-600">Total Streaks</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{streakData.weeklyStreak}</div>
                        <div className="text-sm text-gray-600">This Week</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{streakData.monthlyStreak}</div>
                        <div className="text-sm text-gray-600">This Month</div>
                      </div>
                    </div>
                  </div>

                  {/* Streak Multiplier & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Streak Multiplier</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-orange-600 mb-2">
                          {streakData.streakMultiplier.toFixed(1)}x
                        </div>
                        <div className="text-sm text-gray-600 mb-4">
                          {streakData.currentStreak > 0 
                            ? `Your ${streakData.currentStreak}-day streak gives you a ${streakData.streakMultiplier.toFixed(1)}x point multiplier!`
                            : 'Start a streak to earn point multipliers!'
                          }
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(streakData.streakMultiplier / 3) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Max: 3.0x</div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Points</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {streakData.totalPoints.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          {streakData.currentStreak > 0 
                            ? `Including ${streakData.streakMultiplier.toFixed(1)}x streak bonus!`
                            : 'Take quizzes to start earning points!'
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements Unlocked</h3>
                    {streakData.achievements.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {streakData.achievements.map((achievement: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                            <div className="text-center">
                              <div className="text-3xl mb-2">{achievement.icon}</div>
                              <div className="font-semibold text-gray-900 mb-1">{achievement.name}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">🎯</div>
                        <p className="text-gray-600">Start building streaks to unlock achievements!</p>
                      </div>
                    )}
                  </div>

                  {/* Streak History */}
                  {streakData.streakHistory.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Streaks</h3>
                      <div className="space-y-3">
                        {streakData.streakHistory.map((streak: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{getStreakIcon(streak.length)}</div>
                              <div>
                                <div className="font-medium text-gray-900">{streak.length} days</div>
                                <div className="text-sm text-gray-600">
                                  {streak.startDate} - {streak.endDate}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {streak.length >= 30 ? '🏆' : streak.length >= 14 ? '🔥' : '⭐'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Streak Tips */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Streak Tips</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• Study every day, even if just for 15 minutes</p>
                      <p>• Set a consistent study time that fits your schedule</p>
                      <p>• Don't break the chain - every day counts!</p>
                      <p>• Longer streaks give you better point multipliers</p>
                      <p>• Celebrate your achievements and stay motivated!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No streak data available</h3>
                  <p className="text-gray-600">Take some quizzes first to start building your learning streaks!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Study Calendar */}
        {showStudyCalendar && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Study Calendar & Goals
              </h2>
              
              {calendarLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your study calendar...</p>
                </div>
              ) : calendarData ? (
                <div className="space-y-8">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      ← Previous
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Next →
                    </button>
                  </div>

                  {/* Monthly Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">{calendarData.monthlyStats.totalDays}</div>
                        <div className="text-sm text-gray-600">Total Days</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{calendarData.monthlyStats.studyDays}</div>
                        <div className="text-sm text-gray-600">Study Days</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{calendarData.monthlyStats.totalQuizzes}</div>
                        <div className="text-sm text-gray-600">Total Quizzes</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{calendarData.monthlyStats.averageScore}%</div>
                        <div className="text-sm text-gray-600">Avg. Score</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{calendarData.monthlyStats.totalTime}</div>
                        <div className="text-sm text-gray-600">Total Time (min)</div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Calendar</h3>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar days */}
                      {calendarData.calendarDays.map((day: any, index: number) => (
                        <div
                          key={index}
                          className={`p-2 text-center text-sm border rounded-lg min-h-[60px] flex flex-col items-center justify-center ${getCalendarDayStyle(day)}`}
                        >
                          {day && day.isCurrentMonth && (
                            <>
                              <div className="font-medium">{day.day}</div>
                              {day.hasStudy && (
                                <div className="text-xs mt-1">
                                  {day.studyCount} quiz{day.studyCount !== 1 ? 'es' : ''}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Legend */}
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-300 rounded"></div>
                        <span>1 Quiz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded"></div>
                        <span>2 Quizzes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>3+ Quizzes</span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Goals */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goals Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {calendarData.weeklyGoals.map((week: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 mb-2">Week {week.week}</div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Study Days:</span>
                                <span className="font-medium">{week.studyDays}/{week.days}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Quizzes:</span>
                                <span className="font-medium">{week.quizzes}/{week.goal}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    week.completed ? 'bg-green-500' : 'bg-orange-500'
                                  }`}
                                  style={{ width: `${Math.min((week.quizzes / week.goal) * 100, 100)}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {week.completed ? '🎉 Goal achieved!' : `${Math.round((week.quizzes / week.goal) * 100)}% complete`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Patterns */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Patterns by Day</h3>
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {calendarData.studyPatterns.map((pattern: any, index: number) => (
                        <div key={index} className={`p-4 border rounded-lg text-center ${
                          pattern.isPreferred ? 'bg-indigo-50 border-indigo-200' : ''
                        }`}>
                          <div className="text-sm font-medium text-gray-900 mb-2">{pattern.day}</div>
                          <div className="text-2xl font-bold text-indigo-600 mb-1">{pattern.studyCount}</div>
                          <div className="text-xs text-gray-600">quizzes</div>
                          {pattern.averageScore > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Avg: {pattern.averageScore}%
                            </div>
                          )}
                          {pattern.isPreferred && (
                            <div className="text-xs text-indigo-600 font-medium mt-1">Preferred</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar Tips */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Calendar Tips</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>• Green days show your study activity - aim for consistency!</p>
                      <p>• Use the calendar to identify your most productive study times</p>
                      <p>• Set weekly goals and track your progress</p>
                      <p>• Don't let gaps in your calendar discourage you - every day is a new start</p>
                      <p>• Celebrate when you achieve your weekly goals!</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No calendar data available</h3>
                  <p className="text-gray-600">Take some quizzes first to see your study calendar!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Insights */}
        {showPerformanceInsights && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                AI Performance Insights
              </h2>
              
              {insightsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Analyzing your performance patterns...</p>
                </div>
              ) : insightsData ? (
                <div className="space-y-8">
                  {/* Overall Performance Summary */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {insightsData.overallTrend === 'improving' ? '📈' : 
                           insightsData.overallTrend === 'declining' ? '📉' : '➡️'}
                        </div>
                        <div className="text-sm font-medium text-blue-800">Trend</div>
                        <div className="text-lg font-bold text-blue-900 capitalize">{insightsData.overallTrend}</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">🎯</div>
                        <div className="text-sm font-medium text-green-800">Learning Style</div>
                        <div className="text-lg font-bold text-green-900 capitalize">{insightsData.learningStyle}</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">⚡</div>
                        <div className="text-sm font-medium text-purple-800">Efficiency</div>
                        <div className="text-lg font-bold text-purple-900 capitalize">{insightsData.studyEfficiency}</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">📊</div>
                        <div className="text-sm font-medium text-orange-800">Total Attempts</div>
                        <div className="text-lg font-bold text-orange-900">{insightsData.totalAttempts}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Learning Style:</strong> {getLearningStyleDescription(insightsData.learningStyle)}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Study Frequency:</strong> {insightsData.studyFrequency} quizzes per day on average
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Average Gap:</strong> {insightsData.averageStudyGap} days between study sessions
                      </p>
                    </div>
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💪</span>
                        Your Strengths
                      </h3>
                      {insightsData.strengths.length > 0 ? (
                        <div className="space-y-3">
                                                  {insightsData.strengths.map((strength: any, index: number) => (
                          <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-green-800">{strength.category}</span>
                              <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                {strength.strength}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">{strength.avgScore}%</div>
                            <div className="text-sm text-green-700">{strength.totalAttempts} attempts</div>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Keep practicing to discover your strengths!</p>
                      )}
                    </div>

                    {/* Weaknesses */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        Areas for Improvement
                      </h3>
                      {insightsData.weaknesses.length > 0 ? (
                        <div className="space-y-3">
                                                  {insightsData.weaknesses.map((weakness: any, index: number) => (
                          <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-red-800">{weakness.category}</span>
                              <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                {weakness.weakness.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">{weakness.avgScore}%</div>
                            <div className="text-sm text-red-700">{weakness.totalAttempts} attempts</div>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">Great job! No critical weaknesses found.</p>
                      )}
                    </div>
                  </div>

                  {/* Personalized Recommendations */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💡</span>
                      AI Recommendations
                    </h3>
                    {insightsData.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {insightsData.recommendations.map((rec: any, index: number) => (
                          <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}>
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{getInsightTypeIcon(rec.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <p className="text-gray-700 mb-2">{rec.description}</p>
                                <p className="text-sm font-medium text-gray-800">
                                  <strong>Action:</strong> {rec.action}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No specific recommendations at this time.</p>
                    )}
                  </div>

                  {/* Category Performance Breakdown */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(insightsData.categoryPerformance).map(([category, data]: [string, any]) => (
                        <div key={category} className="p-4 border rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-900 mb-2 capitalize">{category}</div>
                          <div className="text-2xl font-bold text-indigo-600 mb-1">{data.avgScore}%</div>
                          <div className="text-xs text-gray-600">{data.total} attempts</div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                data.avgScore >= 80 ? 'bg-green-500' : 
                                data.avgScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${data.avgScore}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Motivation Factors */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎉 What Motivates You</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {insightsData.motivationFactors.length > 0 ? (
                        insightsData.motivationFactors.map((factor: any, index: number) => {
                          const factorInfo = {
                            maintaining_streak: { icon: '🔥', title: 'Learning Streaks', desc: 'You love maintaining your study momentum' },
                            high_scores: { icon: '🏆', title: 'High Scores', desc: 'Achieving excellence motivates you' },
                            consistent_practice: { icon: '⏰', title: 'Consistent Practice', desc: 'Regular study habits drive you' },
                            seeing_progress: { icon: '📈', title: 'Visible Progress', desc: 'Improving over time keeps you going' }
                          };
                          const info = factorInfo[factor as keyof typeof factorInfo];
                          return (
                            <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                              <div className="text-center">
                                <div className="text-3xl mb-2">{info.icon}</div>
                                <div className="font-semibold text-gray-900 mb-1">{info.title}</div>
                                <div className="text-sm text-gray-600">{info.desc}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500">Keep practicing to discover what motivates you!</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Insights Tips */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🧠 How to Use These Insights</h3>
                    <div className="space-y-2 text-sm text-emerald-800">
                      <p>• <strong>Focus on weaknesses:</strong> Prioritize categories with lower scores</p>
                      <p>• <strong>Maintain strengths:</strong> Keep practicing strong areas to maintain performance</p>
                      <p>• <strong>Follow recommendations:</strong> Implement the AI-suggested actions</p>
                      <p>• <strong>Track progress:</strong> Monitor improvements in your weak areas</p>
                      <p>• <strong>Adjust study habits:</strong> Use insights to optimize your learning approach</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
                  <p className="text-gray-600">Take some quizzes first to generate performance insights!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Quiz Creator */}
        {showCustomQuizCreator && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                Create Your Own Quiz
              </h2>
              
              <div className="space-y-8">
                {/* Quiz Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
                      <input
                        type="text"
                        value={customQuizData.title}
                        onChange={(e) => setCustomQuizData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter quiz title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Type</label>
                      <select
                        value={customQuizData.type}
                        onChange={(e) => setCustomQuizData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="vocabulary">📚 Vocabulary</option>
                        <option value="grammar">📝 Grammar</option>
                        <option value="reading">📖 Reading</option>
                        <option value="listening">🎧 Listening</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select
                        value={customQuizData.difficulty}
                        onChange={(e) => setCustomQuizData(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      >
                        <option value="easy">🟢 Easy</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="hard">🔴 Hard</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={customQuizData.timeLimit}
                        onChange={(e) => setCustomQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 15 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={customQuizData.description}
                      onChange={(e) => setCustomQuizData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this quiz covers..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* Question Creator */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Questions</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter your question..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.options];
                                newOptions[index] = e.target.value;
                                setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                              }}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                            />
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={currentQuestion.correctAnswer === option}
                              onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: option }))}
                              className="text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-500">Correct</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                          <textarea
                            value={currentQuestion.explanation}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                            placeholder="Explain why this answer is correct..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={currentQuestion.points}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {editingQuestionIndex !== null ? (
                        <>
                          <Button
                            onClick={updateQuestion}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Update Question
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingQuestionIndex(null);
                              setCurrentQuestion({
                                question: '',
                                options: ['', '', '', ''],
                                correctAnswer: '',
                                explanation: '',
                                points: 1
                              });
                            }}
                            variant="outline"
                          >
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={addQuestion}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Add Question
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                {customQuizData.questions.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Questions ({customQuizData.questions.length})
                    </h3>
                    
                    <div className="space-y-4">
                      {customQuizData.questions.map((question, index) => (
                        <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(customQuizData.difficulty)}`}>
                                {customQuizData.difficulty}
                              </span>
                              <span className="text-xs text-gray-500">• {question.points} pt{question.points !== 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveQuestion(index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveQuestion(index, 'down')}
                                disabled={index === customQuizData.questions.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                onClick={() => editQuestion(index)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteQuestion(index)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-900 font-medium">{question.question}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded text-sm ${
                                  option === question.correctAnswer
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}
                              >
                                {option === question.correctAnswer ? '✅ ' : '○ '}
                                {option}
                              </div>
                            ))}
                          </div>
                          
                          {question.explanation && (
                            <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quiz Actions */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Questions: {customQuizData.questions.length}/50</p>
                      <p>Time Limit: {customQuizData.timeLimit} minutes</p>
                      <p>Type: {getQuizTypeIcon(customQuizData.type)} {customQuizData.type}</p>
                      <p>Difficulty: <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(customQuizData.difficulty)}`}>
                        {customQuizData.difficulty}
                      </span></p>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={resetCustomQuiz}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reset Quiz
                      </Button>
                      
                      <Button
                        onClick={saveCustomQuiz}
                        disabled={customQuizLoading || customQuizData.questions.length < 3}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {customQuizLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          'Save Quiz'
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {customQuizData.questions.length < 3 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ You need at least 3 questions to save your quiz.
                      </p>
                    </div>
                  )}
                </div>

                {/* Creation Tips */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quiz Creation Tips</h3>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p>• <strong>Clear questions:</strong> Make sure your questions are easy to understand</p>
                    <p>• <strong>Balanced options:</strong> Provide 4 distinct answer choices</p>
                    <p>• <strong>Helpful explanations:</strong> Explain why the correct answer is right</p>
                    <p>• <strong>Appropriate difficulty:</strong> Match difficulty to your target audience</p>
                    <p>• <strong>Reasonable time limits:</strong> Give enough time to think through answers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Sharing */}
        {showQuizSharing && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-blue-600" />
                Quiz Sharing & Discovery
              </h2>
              
              <div className="space-y-8">
                {/* Share Your Quiz */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Quiz</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quiz Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Quiz to Share</label>
                      <select
                        value={selectedQuizForSharing?.id || ''}
                        onChange={(e) => {
                          const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
                          const quiz = savedQuizzes.find((q: any) => q.id === e.target.value);
                          setSelectedQuizForSharing(quiz || null);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Choose a quiz...</option>
                        {(() => {
                          const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
                          return savedQuizzes.map((quiz: any) => (
                            <option key={quiz.id} value={quiz.id}>
                              {quiz.title} ({quiz.questions.length} questions)
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                    
                    {/* Share Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={shareSettings.isPublic}
                            onChange={(e) => setShareSettings(prev => ({ ...prev, isPublic: e.target.checked }))}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Make quiz public</span>
                        </label>
                      </div>
                      
                      {shareSettings.isPublic && (
                        <>
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={shareSettings.allowComments}
                                onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Allow comments</span>
                            </label>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={shareSettings.allowRating}
                                onChange={(e) => setShareSettings(prev => ({ ...prev, allowRating: e.target.checked }))}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Allow rating</span>
                            </label>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={shareSettings.allowDuplication}
                                onChange={(e) => setShareSettings(prev => ({ ...prev, allowDuplication: e.target.checked }))}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">Allow duplication</span>
                            </label>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date (Optional)</label>
                            <input
                              type="date"
                              value={shareSettings.expirationDate || ''}
                              onChange={(e) => setShareSettings(prev => ({ ...prev, expirationDate: e.target.value || null }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {selectedQuizForSharing && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Quiz Preview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                        <div>
                          <strong>Title:</strong> {selectedQuizForSharing.title}
                        </div>
                        <div>
                          <strong>Type:</strong> {getQuizTypeIcon(selectedQuizForSharing.type)} {selectedQuizForSharing.type}
                        </div>
                        <div>
                          <strong>Questions:</strong> {selectedQuizForSharing.questions.length}
                        </div>
                        <div>
                          <strong>Difficulty:</strong> <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(selectedQuizForSharing.difficulty)}`}>
                            {selectedQuizForSharing.difficulty}
                          </span>
                        </div>
                        <div>
                          <strong>Time Limit:</strong> {selectedQuizForSharing.timeLimit} min
                        </div>
                        <div>
                          <strong>Created:</strong> {formatShareDate(selectedQuizForSharing.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Button
                      onClick={() => shareQuiz(selectedQuizForSharing)}
                      disabled={!selectedQuizForSharing || sharingLoading || !shareSettings.isPublic}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {sharingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sharing...
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Shared Quizzes Discovery */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Discover Shared Quizzes</h3>
                  
                  {sharingLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading shared quizzes...</p>
                    </div>
                  ) : sharedQuizzes.length > 0 ? (
                    <div className="space-y-4">
                      {sharedQuizzes.map((quiz, index) => (
                        <div key={quiz.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{quiz.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                                  {quiz.difficulty}
                                </span>
                                <span className="text-xs text-gray-500">{getQuizTypeIcon(quiz.type)} {quiz.type}</span>
                                <span className="text-xs text-gray-500">• {quiz.questions.length} questions</span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created by: {quiz.createdBy}</span>
                                <span>Shared: {formatShareDate(quiz.sharedAt)}</span>
                                <span className={`flex items-center gap-1 ${getShareStatusIcon(quiz) === '📋' ? 'text-green-600' : 'text-blue-600'}`}>
                                  {getShareStatusIcon(quiz)} {getShareStatusText(quiz)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              {quiz.shareSettings?.allowDuplication && (
                                <Button
                                  onClick={() => duplicateQuiz(quiz)}
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  📋 Duplicate
                                </Button>
                              )}
                              
                              {quiz.createdBy === 'current-user' && (
                                <Button
                                  onClick={() => unshareQuiz(quiz)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  🔒 Unshare
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {quiz.shareSettings?.expirationDate && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              ⏰ This quiz will expire on {new Date(quiz.shareSettings.expirationDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Share2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No shared quizzes available</h3>
                      <p className="text-gray-600">Be the first to share a quiz, or check back later for new content!</p>
                    </div>
                  )}
                </div>

                {/* Sharing Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Sharing Tips</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• <strong>Quality content:</strong> Share well-crafted quizzes that others will find valuable</p>
                    <p>• <strong>Clear descriptions:</strong> Help users understand what your quiz covers</p>
                    <p>• <strong>Appropriate settings:</strong> Choose sharing options that match your goals</p>
                    <p>• <strong>Regular updates:</strong> Keep your shared quizzes current and relevant</p>
                    <p>• <strong>Community engagement:</strong> Respond to feedback and comments on your quizzes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gamification & Rewards */}
        {showGamification && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Rewards & Level System
              </h2>
              
              {gamificationLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading your achievements...</p>
                </div>
              ) : gamificationData ? (
                <div className="space-y-8">
                  {/* Level & Rank Overview */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Current Level */}
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-600 mb-2">Level {gamificationData.level}</div>
                        <div className={`text-sm px-3 py-1 rounded-full border ${getLevelColor(gamificationData.level)}`}>
                          {gamificationData.rank}
                        </div>
                        <div className="text-2xl mt-2">{getRankIcon(gamificationData.rank)}</div>
                      </div>
                      
                      {/* Experience Progress */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{gamificationData.experience} XP</div>
                        <div className="text-sm text-gray-600 mb-2">Total Experience</div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${gamificationData.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {gamificationData.experienceInCurrentLevel} / 100 XP to next level
                        </div>
                      </div>
                      
                      {/* Points & Streak */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">{gamificationData.totalPoints} pts</div>
                        <div className="text-sm text-gray-600 mb-2">Total Points</div>
                        <div className="text-lg font-semibold text-orange-600">
                          🔥 {gamificationData.dailyStreak} day streak
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Dashboard */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{gamificationData.totalQuizzes}</div>
                        <div className="text-sm text-blue-800">Quizzes Taken</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{gamificationData.averageScore}%</div>
                        <div className="text-sm text-green-800">Average Score</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{gamificationData.bestScore}%</div>
                        <div className="text-sm text-purple-800">Best Score</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{gamificationData.weeklyGoal}</div>
                        <div className="text-sm text-orange-800">This Week</div>
                      </div>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Achievements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gamificationData.achievements.map((achievement: any) => (
                        <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                          <div className="text-center">
                            <div className="text-3xl mb-2">{achievement.icon}</div>
                            <div className="font-semibold text-gray-900 mb-1">{achievement.name}</div>
                            <div className="text-sm text-gray-600 mb-3">{achievement.description}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getAchievementProgress(achievement.id)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {Math.round(getAchievementProgress(achievement.id))}% complete
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Locked Achievements */}
                      {gamificationData.achievements.length < 6 && (
                        Array.from({ length: 6 - gamificationData.achievements.length }).map((_, index) => (
                          <div key={`locked-${index}`} className="p-4 border rounded-lg bg-gray-100 border-gray-300 opacity-50">
                            <div className="text-center">
                              <div className="text-3xl mb-2">🔒</div>
                              <div className="font-semibold text-gray-500 mb-1">Locked</div>
                              <div className="text-sm text-gray-400">Keep learning to unlock!</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">🏅 Badges</h3>
                      <Button
                        onClick={() => setShowBadgeCollection(!showBadgeCollection)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        {showBadgeCollection ? 'Hide Collection' : 'View Full Collection'}
                      </Button>
                    </div>
                    
                    {!showBadgeCollection ? (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {gamificationData.badges.filter((badge: any) => badge.unlocked).slice(0, 5).map((badge: any) => (
                          <div key={badge.id} className="text-center p-4">
                            <div className={`w-16 h-16 ${badge.color} rounded-full flex items-center justify-center mx-auto mb-2 text-2xl`}>
                              {badge.icon}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                            <div className="text-xs text-gray-500">{badge.description}</div>
                          </div>
                        ))}
                        
                        {/* Show locked slots if less than 5 unlocked */}
                        {gamificationData.badges.filter((badge: any) => badge.unlocked).length < 5 && (
                          Array.from({ length: 5 - gamificationData.badges.filter((badge: any) => badge.unlocked).length }).map((_, index) => (
                            <div key={`locked-badge-${index}`} className="text-center p-4 opacity-50">
                              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                                🔒
                              </div>
                              <div className="text-sm font-medium text-gray-500">Locked</div>
                              <div className="text-xs text-gray-400">Keep learning!</div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                          {badgeCategories.map(category => (
                            <button
                              key={category}
                              onClick={() => setSelectedBadgeCategory(category)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedBadgeCategory === category
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                          ))}
                        </div>
                        
                        {/* Badge Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filterBadgesByCategory(gamificationData.badges, selectedBadgeCategory).map((badge: any) => (
                            <div
                              key={badge.id}
                              className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                                badge.unlocked
                                  ? `${badge.bgColor} ${badge.borderColor} hover:shadow-md`
                                  : 'bg-gray-100 border-gray-300 opacity-60'
                              }`}
                              onClick={() => setSelectedBadge(badge)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center text-xl`}>
                                  {badge.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(badge.rarity)}`}>
                                      {getRarityIcon(badge.rarity)} {badge.rarity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">{badge.requirement}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${
                                          badge.unlocked ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                        style={{ width: `${getBadgeProgressPercentage(badge)}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {badge.progress}/{badge.maxProgress} ({Math.round(getBadgeProgressPercentage(badge))}%)
                                    </div>
                                  </div>
                                </div>
                                {badge.unlocked && (
                                  <div className="text-green-600 text-lg">✓</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Badge Statistics */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Badge Collection Stats</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {gamificationData.badges.filter((b: any) => b.unlocked).length}
                              </div>
                              <div className="text-gray-600">Unlocked</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-600">
                                {gamificationData.badges.length}
                              </div>
                              <div className="text-gray-600">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">
                                {Math.round((gamificationData.badges.filter((b: any) => b.unlocked).length / gamificationData.badges.length) * 100)}%
                              </div>
                              <div className="text-gray-600">Completion</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">
                                {gamificationData.badges.filter((b: any) => b.rarity === 'legendary' && b.unlocked).length}
                              </div>
                              <div className="text-gray-600">Legendary</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Goals & Progress */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Goals & Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Weekly Goal */}
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3">Weekly Goal</h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-2">{gamificationData.weeklyGoal}/10</div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((gamificationData.weeklyGoal / 10) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-blue-700 mt-2">
                            {gamificationData.weeklyGoal >= 10 ? '🎉 Weekly goal achieved!' : `${10 - gamificationData.weeklyGoal} more quizzes needed`}
                          </div>
                        </div>
                      </div>
                      
                      {/* Monthly Goal */}
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-3">Monthly Goal</h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">{gamificationData.monthlyGoal}/40</div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((gamificationData.monthlyGoal / 40) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-green-700 mt-2">
                            {gamificationData.monthlyGoal >= 40 ? '🎉 Monthly goal achieved!' : `${40 - gamificationData.monthlyGoal} more quizzes needed`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Celebrations */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🎁 Rewards & Celebrations</h3>
                    <div className="text-center">
                      <Button
                        onClick={() => setShowRewards(!showRewards)}
                        variant="outline"
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 hover:from-yellow-500 hover:to-orange-500"
                      >
                        {showRewards ? 'Hide Rewards' : 'View Unlocked Rewards'}
                      </Button>
                      
                      {showRewards && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                          <h4 className="font-medium text-yellow-900 mb-4">Your Unlocked Rewards</h4>
                          {unlockedRewards.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {unlockedRewards.map((reward) => (
                                <div key={reward.id} className="p-3 bg-white rounded-lg border border-yellow-200">
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">🎁</div>
                                    <div className="font-medium text-gray-900">{reward.type}</div>
                                    <div className="text-sm text-gray-600">{reward.data?.name || 'Special Reward'}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Unlocked: {new Date(reward.unlockedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-yellow-700">Keep learning to unlock amazing rewards!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gamification Tips */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 How to Level Up Faster</h3>
                    <div className="space-y-2 text-sm text-yellow-800">
                      <p>• <strong>Daily practice:</strong> Maintain your streak for bonus XP</p>
                      <p>• <strong>High scores:</strong> Aim for 90%+ to earn bonus experience</p>
                      <p>• <strong>Harder quizzes:</strong> Challenge yourself with difficult content</p>
                      <p>• <strong>Consistent study:</strong> Regular practice builds momentum</p>
                      <p>• <strong>Goal achievement:</strong> Complete weekly and monthly targets</p>
                    </div>
                  </div>

                  {/* Badge Detail Modal */}
                  {selectedBadge && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center">
                          <div className={`w-20 h-20 ${selectedBadge.color} rounded-full flex items-center justify-center mx-auto mb-4 text-3xl`}>
                            {selectedBadge.icon}
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h3>
                          
                          <div className="flex items-center justify-center gap-2 mb-3">
                            <span className={`text-sm px-3 py-1 rounded-full border ${getRarityColor(selectedBadge.rarity)}`}>
                              {getRarityIcon(selectedBadge.rarity)} {selectedBadge.rarity}
                            </span>
                            {selectedBadge.unlocked && (
                              <span className="text-sm px-3 py-1 rounded-full border text-green-600 bg-green-50 border-green-200">
                                ✓ Unlocked
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">Requirement</div>
                              <div className="text-sm text-gray-600">{selectedBadge.requirement}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-1">Progress</div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    selectedBadge.unlocked ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${getBadgeProgressPercentage(selectedBadge)}%` }}
                                ></div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {selectedBadge.progress}/{selectedBadge.maxProgress} ({Math.round(getBadgeProgressPercentage(selectedBadge))}%)
                              </div>
                            </div>
                            
                            {selectedBadge.unlocked && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm text-green-800">
                                  🎉 Congratulations! You've earned this badge!
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-6">
                            <Button
                              onClick={() => setSelectedBadge(null)}
                              className="w-full"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No gamification data available</h3>
                  <p className="text-gray-600">Take some quizzes first to start earning rewards and leveling up!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Difficulty Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setSelectedDifficulty('easy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === 'easy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setSelectedDifficulty('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSelectedDifficulty('hard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDifficulty === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hard
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setSelectedCategory('vocabulary')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'vocabulary'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            >
              Vocabulary
            </button>
            <button
              onClick={() => setSelectedCategory('grammar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'grammar'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grammar
            </button>
            <button
              onClick={() => setSelectedCategory('reading')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'reading'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reading
            </button>
            <button
              onClick={() => setSelectedCategory('listening')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'listening'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Listening
            </button>
          </div>
          
          {/* Reset Filters Button */}
          <div className="mt-3">
            <button
              onClick={() => {
                setSelectedDifficulty('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Quiz Analytics */}
        {showAnalytics && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Quiz Performance Analytics
              </h2>
              
              {analyticsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading analytics...</p>
                </div>
              ) : quizStats ? (
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{quizStats.totalQuizzes || 0}</div>
                          <div className="text-sm text-blue-700">Total Quizzes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-600">{quizStats.averageScore || 0}%</div>
                          <div className="text-sm text-green-700">Average Score</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{quizStats.totalExperience || 0}</div>
                          <div className="text-sm text-purple-700">Total Experience</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="text-2xl font-bold text-orange-600">
                            {quizStats.recentPerformance?.length > 0 ? 
                              Math.max(...quizStats.recentPerformance.map((p: any) => p.score)) : 0}%
                          </div>
                          <div className="text-sm text-orange-700">Best Recent Score</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance by Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance by Difficulty</h3>
                      <div className="space-y-2">
                        {['easy', 'medium', 'hard'].map((difficulty) => (
                          <div key={difficulty} className="flex justify-between items-center">
                            <span className="capitalize text-gray-700">{difficulty}</span>
                            <span className="font-medium text-gray-900">
                              {quizStats.quizzesByDifficulty?.[difficulty] || 0} quizzes
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance by Category */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance by Category</h3>
                      <div className="space-y-2">
                        {['vocabulary', 'grammar', 'reading', 'listening'].map((category) => (
                          <div key={category} className="flex justify-between items-center">
                            <span className="capitalize text-gray-700">{category}</span>
                            <span className="font-medium text-gray-900">
                              {quizStats.quizzesByCategory?.[category] || 0} quizzes
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Performance */}
                  {quizStats.recentPerformance && quizStats.recentPerformance.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Performance</h3>
                      <div className="space-y-2">
                        {quizStats.recentPerformance.slice(0, 5).map((attempt: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700">{attempt.quizTitle || `Quiz ${index + 1}`}</span>
                            <span className={`font-medium ${
                              attempt.score >= 80 ? 'text-green-600' : 
                              attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {attempt.score}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No quiz data available yet. Take some quizzes to see your analytics!
                </div>
              )}
            </div>
          </div>
        )}

        {/* New Quiz UI Layout */}
        {searchTerm ? (
          // Search Results
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Results</h2>
              <p className="text-gray-600">Results for "{searchTerm}"</p>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
                <p className="text-gray-600 mb-4">
                  No quizzes match your search for "{searchTerm}"
                </p>
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                >
                  <Search className="w-4 h-4" />
                  Try a different search term
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                      <p className="text-gray-600">{quiz.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Type:</span>
                          <span className="font-medium text-gray-900 capitalize">{quiz.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Difficulty:</span>
                          <span className="font-medium text-gray-900 capitalize">{quiz.difficulty}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Time Limit:</span>
                          <span className="font-medium text-gray-900">{quiz.timeLimit} minutes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700">Questions:</span>
                          <span className="font-medium text-gray-900">{quiz.questions.length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => startQuiz(quiz)}
                        className="w-full"
                      >
                        Start Quiz
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Main Quiz Layout
          <div className="space-y-8">
            {/* Sample Quizzes Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-8 bg-blue-500 rounded"></div>
                <h2 className="text-2xl font-bold text-gray-900">My TOEIC Quizzes</h2>
              </div>
              
              {/* Sample Quizzes Header - Clickable to expand/collapse */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowSampleQuizzes(!showSampleQuizzes)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {showSampleQuizzes ? '▼' : '▶'} Explore {filteredQuizzes.filter(quiz => !quiz.isCustom).length} Sample Quizzes
                      </h3>
                      <p className="text-gray-600">
                        Practice real TOEIC-style questions!
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Available</div>
                      <div className="text-lg font-bold text-blue-600">
                        {filteredQuizzes.filter(quiz => !quiz.isCustom).length} Quizzes
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expanded Sample Quizzes List */}
              {showSampleQuizzes && (
                <div className="mt-4 space-y-2">
                  {filteredQuizzes.filter(quiz => !quiz.isCustom).map((quiz, index) => (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow bg-white border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {quiz.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  📚 {quiz.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  📊 {quiz.questions.length} Questions
                                </span>
                                <span className="flex items-center gap-1">
                                  ⏱️ {quiz.timeLimit} min
                                </span>
                                <span className="flex items-center gap-1">
                                  🎯 {quiz.difficulty}
                                </span>
                              </div>
                              {quiz.description && (
                                <p className="text-sm text-gray-500 mt-1">{quiz.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              startQuiz(quiz);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Start Quiz
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* My Created Quizzes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-green-500 rounded"></div>
                  <h2 className="text-2xl font-bold text-gray-900">My Created Quizzes</h2>
                </div>
                <Button
                  onClick={() => setShowCustomQuizCreator(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <span className="text-lg">+</span>
                  Create New Quiz
                </Button>
              </div>
              
              {filteredQuizzes.filter(quiz => quiz.isCustom).length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No custom quizzes yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first custom quiz to get started!
                  </p>
                  <Button
                    onClick={() => setShowCustomQuizCreator(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Create Your First Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuizzes.filter(quiz => quiz.isCustom).map((quiz) => (
                    <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {quiz.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  🏷️ Created: {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  📊 {quiz.questions.length} Questions
                                </span>
                                <span className="flex items-center gap-1">
                                  ⏱️ {quiz.timeLimit} min
                                </span>
                                <span className="flex items-center gap-1">
                                  🎯 {quiz.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => startQuiz(quiz)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Start Quiz
                            </Button>
                            <Button
                              onClick={() => {
                                // TODO: Implement edit quiz functionality
                                alert('Edit functionality coming soon!');
                              }}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              ✏️
                            </Button>
                            <Button
                              onClick={() => {
                                // Delete quiz functionality
                                if (confirm('Are you sure you want to delete this quiz?')) {
                                  const savedQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
                                  const updatedQuizzes = savedQuizzes.filter((q: any) => q.id !== quiz.id);
                                  localStorage.setItem('customQuizzes', JSON.stringify(updatedQuizzes));
                                  
                                  // Refresh the quiz list
                                  const apiQuizzes = filteredQuizzes.filter(q => !q.isCustom);
                                  const newCustomQuizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
                                  const allQuizzes = [...apiQuizzes, ...newCustomQuizzes];
                                  setQuizzes(allQuizzes);
                                  setFilteredQuizzes(filterQuizzes(allQuizzes, selectedDifficulty, selectedCategory));
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
