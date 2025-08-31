'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Clock, 
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  HelpCircle
} from 'lucide-react';

export default function ProgressPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  // Mock progress data (in real app, this would come from API)
  const [progressData] = useState({
    totalCards: 150,
    studiedToday: 12,
    currentStreak: 7,
    longestStreak: 15,
    accuracy: 85,
    level: 'intermediate',
    experience: 1250,
    nextLevel: 2000,
    totalStudyTime: 135, // minutes
    averageSessionTime: 25, // minutes
    cardsMastered: 87,
    quizzesTaken: 12,
    averageQuizScore: 85,
    weeklyProgress: [
      { day: 'Mon', cards: 8, accuracy: 75 },
      { day: 'Tue', cards: 12, accuracy: 83 },
      { day: 'Wed', cards: 15, accuracy: 87 },
      { day: 'Thu', cards: 10, accuracy: 80 },
      { day: 'Fri', cards: 18, accuracy: 92 },
      { day: 'Sat', cards: 14, accuracy: 85 },
      { day: 'Sun', cards: 12, accuracy: 88 },
    ],
    recentActivity: [
      { id: 1, type: 'flashcard', word: 'procurement', result: 'correct', time: '2 min ago' },
      { id: 2, type: 'flashcard', word: 'efficient', result: 'correct', time: '5 min ago' },
      { id: 3, type: 'quiz', title: 'Business Vocabulary', score: '8/10', time: '1 hour ago' },
      { id: 4, type: 'flashcard', word: 'negotiate', result: 'incorrect', time: '2 hours ago' },
      { id: 5, type: 'quiz', title: 'Grammar Practice', score: '9/10', time: '3 hours ago' },
    ]
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading progress data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600';
      case 'intermediate': return 'text-blue-600';
      case 'advanced': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
                <p className="text-gray-600 mt-2">
                  Track your TOEIC learning journey and see your improvement over time
                </p>
              </div>
              <Link href="/quiz">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Take Quiz
                </button>
              </Link>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cards</p>
                    <p className="text-2xl font-bold text-gray-900">{progressData.totalCards}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{progressData.currentStreak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accuracy</p>
                    <p className={`text-2xl font-bold ${getAccuracyColor(progressData.accuracy)}`}>
                      {progressData.accuracy}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.floor(progressData.totalStudyTime / 60)}h {progressData.totalStudyTime % 60}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Level Progress */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Level Progress</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Current Level: <span className={getLevelColor(progressData.level)}>
                            {progressData.level.charAt(0).toUpperCase() + progressData.level.slice(1)}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500">
                          {progressData.experience} / {progressData.nextLevel} XP
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(progressData.experience / progressData.nextLevel) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{progressData.cardsMastered}</div>
                        <div className="text-sm text-gray-600">Cards Mastered</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{progressData.quizzesTaken}</div>
                        <div className="text-sm text-gray-600">Quizzes Taken</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Performance */}
              <Card className="mt-6">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Quiz Performance</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progressData.quizzesTaken}</div>
                      <div className="text-sm text-gray-600">Total Quizzes</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{progressData.averageQuizScore}%</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">3</div>
                      <div className="text-sm text-gray-600">Quiz Types</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Business Vocabulary</p>
                          <p className="text-xs text-gray-500">Last taken: 2 days ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">90%</div>
                        <div className="text-xs text-gray-500">Best score</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Grammar Practice</p>
                          <p className="text-xs text-gray-500">Last taken: 1 day ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">85%</div>
                        <div className="text-xs text-gray-500">Best score</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Reading Comprehension</p>
                          <p className="text-xs text-gray-500">Last taken: 3 days ago</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600">80%</div>
                        <div className="text-xs text-gray-500">Best score</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Progress Chart */}
              <Card className="mt-6">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Weekly Progress</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 w-12">{day.day}</span>
                        <div className="flex-1 mx-4">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(day.cards / 20) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 w-8">{day.cards} cards</span>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${getAccuracyColor(day.accuracy)}`}>
                          {day.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">7-Day Streak</p>
                        <p className="text-xs text-gray-500">Keep it up!</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">85% Accuracy</p>
                        <p className="text-xs text-gray-500">Excellent work!</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">2+ Hours Studied</p>
                        <p className="text-xs text-gray-500">Dedicated learner!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {progressData.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.type === 'flashcard' ? `Studied "${activity.word}"` : activity.title}
                            </p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {activity.result === 'correct' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : activity.result === 'incorrect' ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <span className="text-xs text-blue-600 font-medium">{activity.score}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Tips */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Study Tips</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">🎯 Focus on Weak Areas</p>
                      <p>Review cards you struggle with more frequently</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">⏰ Study Daily</p>
                      <p>Even 15 minutes daily is better than 2 hours once a week</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">📊 Track Progress</p>
                      <p>Monitor your accuracy and adjust study strategies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
