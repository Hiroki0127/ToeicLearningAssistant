'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useFlashcards } from '@/hooks/useFlashcards';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target, 
  Calendar,
  ArrowRight,
  Brain,
  Trophy,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const { fetchUserFlashcards, flashcards, pagination } = useFlashcards();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserFlashcards();
    }
  }, [isAuthenticated, fetchUserFlashcards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Mock progress data (in real app, this would come from API)
  const progressData = {
    totalCards: 150,
    studiedToday: 12,
    currentStreak: 7,
    accuracy: 85,
    level: 'intermediate',
    experience: 1250,
    nextLevel: 2000,
  };

  const recentActivity = [
    { id: 1, type: 'flashcard', word: 'procurement', result: 'correct', time: '2 min ago' },
    { id: 2, type: 'flashcard', word: 'efficient', result: 'correct', time: '5 min ago' },
    { id: 3, type: 'quiz', title: 'Business Vocabulary', score: '8/10', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Level {progressData.level}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(progressData.experience / progressData.nextLevel) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/flashcards">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Study Flashcards</h3>
                    <p className="text-gray-600">Continue your vocabulary practice</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/quiz">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Take Quiz</h3>
                    <p className="text-gray-600">Test your knowledge</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">View Progress</h3>
                    <p className="text-gray-600">Track your learning journey</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{progressData.totalCards}</div>
                    <div className="text-sm text-gray-600">Total Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{progressData.studiedToday}</div>
                    <div className="text-sm text-gray-600">Studied Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{progressData.currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{progressData.accuracy}%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Experience Progress</span>
                    <span className="text-sm text-gray-500">{progressData.experience} / {progressData.nextLevel} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(progressData.experience / progressData.nextLevel) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type === 'flashcard' ? `Studied "${activity.word}"` : activity.title}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {activity.result === 'correct' ? (
                          <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                        ) : activity.score ? (
                          <span className="text-blue-600 text-sm font-medium">{activity.score}</span>
                        ) : (
                          <span className="text-red-600 text-sm font-medium">✗ Incorrect</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Goal */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Daily Goal</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{progressData.studiedToday}/20</div>
                  <div className="text-sm text-gray-600">cards studied today</div>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(progressData.studiedToday / 20) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streak */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Study Streak</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{progressData.currentStreak} days</div>
                  <div className="text-sm text-gray-600">Keep it up!</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Study Time</span>
                    <span className="text-sm font-medium">2h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cards Mastered</span>
                    <span className="text-sm font-medium">87</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quizzes Taken</span>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
