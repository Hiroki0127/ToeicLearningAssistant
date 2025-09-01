'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { CheckCircle, XCircle, Clock, Trophy, Target, BarChart3, TrendingUp, Award, BookOpen, Search, LineChart, Activity } from 'lucide-react';
import { getQuizzes, submitQuizResult, getQuizStats, getQuizHistory, type Quiz, type QuizResult, type QuizAttempt } from '@/lib/quiz';

interface Question {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Quiz[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Quiz[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showProgressCharts, setShowProgressCharts] = useState(false);
  const [progressData, setProgressData] = useState<any>(null);
  const [progressLoading, setProgressLoading] = useState(false);

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
    // Load quizzes from API
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        const quizzesData = await getQuizzes();
        setQuizzes(quizzesData);
        setFilteredQuizzes(filterQuizzes(quizzesData, selectedDifficulty, selectedCategory));
      } catch (error) {
        console.error('Failed to load quizzes:', error);
        // Fallback to sample data if API fails
        setQuizzes([]);
        setFilteredQuizzes([]);
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
      const quizResult: QuizResult = {
        quizId: selectedQuiz.id,
        score: Math.round((score / (selectedQuiz.questions.reduce((sum, q) => sum + q.points, 0))) * 100),
        totalQuestions: selectedQuiz.questions.length,
        correctAnswers: Math.round(score / 5), // Assuming 5 points per question
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
                      <span className="font-medium">{option}</span>
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
                    {selectedQuiz.questions.filter(q => q.correctAnswer === selectedAnswer).length}
                  </div>
                  <div className="text-sm text-green-700">Correct</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedQuiz.questions.length - selectedQuiz.questions.filter(q => q.correctAnswer === selectedAnswer).length}
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
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">TOEIC Quizzes</h1>
              <p className="text-gray-600">Test your knowledge with our interactive TOEIC-style quizzes</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (!showAnalytics) {
                    loadQuizAnalytics();
                  }
                  setShowAnalytics(!showAnalytics);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                {showAnalytics ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Hide Analytics
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Show Analytics
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/quiz/history')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View History
              </Button>
              
              <Button
                onClick={() => {
                  if (!showRecommendations) {
                    generateRecommendations();
                  }
                  setShowRecommendations(!showRecommendations);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                {showRecommendations ? (
                  <>
                    <Target className="w-4 h-4" />
                    Hide Recommendations
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => {
                  if (!showProgressCharts) {
                    loadProgressData();
                  }
                  setShowProgressCharts(!showProgressCharts);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                {showProgressCharts ? (
                  <>
                    <LineChart className="w-4 h-4" />
                    Hide Charts
                  </>
                ) : (
                  <>
                    <LineChart className="w-4 h-4" />
                    Show Progress
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
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
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium capitalize">{quiz.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Difficulty:</span>
                              <span className="font-medium capitalize">{quiz.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Questions:</span>
                              <span className="font-medium">{quiz.questions.length}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchTerm && searchResults.length === 0 ? (
            <div className="col-span-full text-center py-12">
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
          ) : (searchTerm ? searchResults : filteredQuizzes).map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium capitalize">{quiz.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className="font-medium capitalize">{quiz.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time Limit:</span>
                    <span className="font-medium">{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Questions:</span>
                    <span className="font-medium">{quiz.questions.length}</span>
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
      </div>
    </Layout>
  );
}
