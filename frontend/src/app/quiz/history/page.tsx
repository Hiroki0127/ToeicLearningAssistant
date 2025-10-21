'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  RefreshCw,
  Search
} from 'lucide-react';
import { getQuizHistory, type QuizAttempt } from '@/lib/quiz';

export default function QuizHistoryPage() {
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    loadQuizHistory();
  }, []);

  const loadQuizHistory = async () => {
    try {
      setLoading(true);
      const history = await getQuizHistory();
      setQuizHistory(history);
      setFilteredHistory(history);
    } catch (error) {
      console.error('Failed to load quiz history:', error);
      setQuizHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort quiz history
  useEffect(() => {
    let filtered = [...quizHistory];

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(attempt => {
        if (selectedFilter === 'passed') return attempt.score >= 70;
        if (selectedFilter === 'failed') return attempt.score < 70;
        if (selectedFilter === 'recent') {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(attempt.completedAt) > oneWeekAgo;
        }
        return true;
      });
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(attempt => 
        attempt.quiz?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attempt.quiz?.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        case 'score':
          return b.score - a.score;
        case 'time':
          return a.timeSpent - b.timeSpent;
        case 'title':
          return a.quiz?.title?.localeCompare(b.quiz?.title || '') || 0;
        default:
          return 0;
      }
    });

    setFilteredHistory(filtered);
  }, [quizHistory, selectedFilter, searchTerm, sortBy]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateStats = () => {
    if (filteredHistory.length === 0) return null;

    const totalAttempts = filteredHistory.length;
    const averageScore = Math.round(
      filteredHistory.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts
    );
    const bestScore = Math.max(...filteredHistory.map(a => a.score));
    const totalTime = filteredHistory.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
    const averageTime = Math.round(totalTime / totalAttempts);

    return { totalAttempts, averageScore, bestScore, averageTime };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading quiz history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
          <p className="text-gray-600">Track your learning progress and performance over time</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalAttempts}</div>
                  <div className="text-sm text-blue-700">Total Attempts</div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                  <div className="text-sm text-green-700">Average Score</div>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.bestScore}%</div>
                  <div className="text-sm text-purple-700">Best Score</div>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-orange-600">{formatTime(stats.averageTime)}</div>
                  <div className="text-sm text-orange-700">Avg. Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Attempts</option>
                <option value="passed">Passed (≥70%)</option>
                <option value="failed">Failed (&lt;70%)</option>
                <option value="recent">Last 7 Days</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="time">Sort by Time</option>
                <option value="title">Sort by Title</option>
              </select>

              <Button
                onClick={loadQuizHistory}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Quiz History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz attempts found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Take some quizzes to see your history here!'
                }
              </p>
            </div>
          ) : (
            filteredHistory.map((attempt) => (
              <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Quiz Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${getScoreColor(attempt.score)}`}>
                            {attempt.score}%
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {attempt.quiz?.title || 'Unknown Quiz'}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(attempt.completedAt)}
                            </span>
                            <span className="capitalize">{attempt.quiz?.type || 'Unknown'}</span>
                            <span className="capitalize">{attempt.quiz?.difficulty || 'Unknown'}</span>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(attempt.score)}`}>
                              {getScoreLabel(attempt.score)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex flex-col items-end gap-2 text-sm">
                      <div className="text-right">
                        <div className="text-gray-500">Completion Time</div>
                        <div className="font-medium text-gray-900">{formatTime(attempt.timeSpent)}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-gray-500">Questions</div>
                        <div className="font-medium text-gray-900">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </div>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredHistory.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredHistory.length} of {quizHistory.length} quiz attempts
          </div>
        )}
      </div>
    </Layout>
  );
}
