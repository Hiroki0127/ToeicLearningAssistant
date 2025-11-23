'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { studySessionService } from '@/lib/study-sessions';
import { BookOpen, Plus, Edit3, RotateCcw, Target, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

type FlashcardSetType = 'all' | 'needs-review' | null;

export default function FlashcardsPage() {
  const { isAuthenticated } = useAuth();
  const [selectedSet, setSelectedSet] = useState<FlashcardSetType>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { flashcards, loading, error, fetchFlashcards, fetchUserFlashcards, fetchFlashcardsNeedingReview, reviewFlashcard } = useFlashcards();
  const [allFlashcardsCount, setAllFlashcardsCount] = useState(0);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Fetch counts for selection screen
  const fetchCounts = async () => {
    try {
      // Fetch all flashcards count
      const allResponse = await fetchUserFlashcards(1, 1);
      setAllFlashcardsCount(allResponse.pagination.total);

      // Fetch needs review count
      if (isAuthenticated) {
        try {
          const reviewResponse = await fetchFlashcardsNeedingReview(1, 1);
          setNeedsReviewCount(reviewResponse.pagination.total);
        } catch (err) {
          // If no reviews exist yet, count is 0
          setNeedsReviewCount(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch flashcard counts:', err);
    }
  };

  useEffect(() => {
    if (!selectedSet) {
      fetchCounts();
    }
  }, [selectedSet, fetchUserFlashcards, fetchFlashcardsNeedingReview, isAuthenticated]);

  const handleCorrect = async () => {
    setCorrectAnswers(prev => prev + 1);
    
    // Track review
    if (flashcards[currentIndex] && isAuthenticated) {
      try {
        await reviewFlashcard(flashcards[currentIndex].id, true, 0);
        console.log('Review saved: correct for', flashcards[currentIndex].word);
      } catch (err) {
        console.error('Failed to save review:', err);
      }
    }

    // Auto-advance to next card or end session if it's the last card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
    } else {
      // Last card - end the session
      handleSessionEnd();
    }
  };

  const handleIncorrect = async () => {
    setIncorrectAnswers(prev => prev + 1);
    
    // Track review
    if (flashcards[currentIndex] && isAuthenticated) {
      try {
        await reviewFlashcard(flashcards[currentIndex].id, false, 0);
        console.log('Review saved: incorrect for', flashcards[currentIndex].word);
      } catch (err) {
        console.error('Failed to save review:', err);
      }
    }

    // Auto-advance to next card or end session if it's the last card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
    } else {
      // Last card - end the session
      handleSessionEnd();
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const handleSessionEnd = async () => {
    try {
      const endTime = new Date();
      const startTime = sessionStartTime || endTime;
      
      const sessionData = {
        sessionType: 'flashcards' as const,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        cardsStudied: flashcards.length,
        correctAnswers,
        incorrectAnswers,
      };
      
      await studySessionService.createStudySession(sessionData);
      setSessionCompleted(true);
      setSessionStartTime(null);
      // Refresh review count after session ends (reviews have been saved)
      if (isAuthenticated) {
        try {
          const reviewResponse = await fetchFlashcardsNeedingReview(1, 1);
          setNeedsReviewCount(reviewResponse.pagination.total);
        } catch (err) {
          console.error('Failed to refresh review count:', err);
        }
      }
    } catch (error) {
      console.error('Failed to save study session:', error);
      setSessionCompleted(true);
      setSessionStartTime(null);
    }
  };

  const handleRestartSession = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSessionCompleted(false);
    setSessionStartTime(new Date());
  };

  const handleSelectSet = async (setType: FlashcardSetType) => {
    setSelectedSet(setType);
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSessionCompleted(false);
    setSessionStartTime(new Date());

    try {
      if (setType === 'all') {
        await fetchUserFlashcards(1, 1000);
      } else if (setType === 'needs-review') {
        // Refresh count before loading
        if (isAuthenticated) {
          try {
            const reviewResponse = await fetchFlashcardsNeedingReview(1, 1);
            setNeedsReviewCount(reviewResponse.pagination.total);
          } catch (err) {
            console.error('Failed to refresh review count:', err);
          }
        }
        await fetchFlashcardsNeedingReview(1, 1000);
      }
    } catch (err) {
      console.error('Failed to fetch flashcards:', err);
    }
  };

  const handleBackToSelection = async () => {
    setSelectedSet(null);
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSessionCompleted(false);
    setSessionStartTime(null);
    // Refresh counts when going back to selection
    await fetchCounts();
  };

  // Reset current index when flashcards change
  useEffect(() => {
    if (selectedSet && flashcards.length > 0) {
      setCurrentIndex(0);
      setSessionStartTime(new Date());
    }
  }, [flashcards, selectedSet]);

  if (loading && !selectedSet) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading flashcards...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Selection Screen
  if (!selectedSet) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
                <p className="text-gray-600">
                  Choose a flashcard set to study
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/flashcards/manage">
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Manage Cards
                  </Button>
                </Link>
                <Link href="/flashcards/create">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Card
                  </Button>
                </Link>
              </div>
            </div>

            {/* Flashcard Set Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* All Flashcards */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectSet('all')}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">All Flashcards</h3>
                      <p className="text-sm text-gray-600">Study all available vocabulary</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Cards</span>
                      <span className="text-lg font-bold text-gray-900">{allFlashcardsCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Study all vocabulary words</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Needs Review */}
              <Card 
                className={`hover:shadow-lg transition-shadow ${needsReviewCount === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => {
                  if (needsReviewCount > 0) {
                    handleSelectSet('needs-review');
                  } else {
                    // Refresh count if clicked when 0
                    fetchCounts();
                  }
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">Needs Review</h3>
                      <p className="text-sm text-gray-600">Focus on cards you got wrong</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cards to Review</span>
                      <span className="text-lg font-bold text-gray-900">{needsReviewCount}</span>
                    </div>
                    {needsReviewCount === 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 italic">
                          No cards need review yet. Study some flashcards first!
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchCounts();
                          }}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Refresh Count
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Improve your weak areas</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Study Session Screen
  if (error && flashcards.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">Error loading flashcards: {error}</div>
              <Button onClick={handleBackToSelection} variant="outline">
                Back to Selection
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (flashcards.length === 0 && selectedSet) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedSet === 'needs-review' ? 'No Cards Need Review' : 'No Flashcards Available'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedSet === 'needs-review' 
                    ? 'Great job! You haven\'t gotten any cards wrong yet. Keep studying!'
                    : 'Start by adding some vocabulary flashcards to study.'}
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleBackToSelection} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Back to Selection
                  </Button>
                  {selectedSet !== 'needs-review' && (
                    <Link href="/flashcards/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Flashcard
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedSet === 'needs-review' ? 'Review Flashcards' : 'Study Flashcards'}
              </h1>
              <p className="text-gray-600">
                {selectedSet === 'needs-review' 
                  ? 'Focus on cards you need to practice'
                  : 'Study vocabulary to improve your TOEIC score'}
              </p>
            </div>
            <Button onClick={handleBackToSelection} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Change Set
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Progress: {currentIndex + 1} of {flashcards.length}
              </span>
              <span className="text-sm text-gray-600">
                {flashcards.length > 0 ? Math.round(((currentIndex + 1) / flashcards.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-blue-600">
                  {correctAnswers + incorrectAnswers > 0
                    ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-purple-600">
                  {flashcards.length - (currentIndex + 1)}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Session Completion Screen */}
          {sessionCompleted ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Study Session Complete!</h2>
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {correctAnswers + incorrectAnswers > 0
                        ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleRestartSession} variant="outline">
                    Study Again
                  </Button>
                  <Button onClick={handleBackToSelection} variant="outline">
                    Change Set
                  </Button>
                  <Link href="/dashboard">
                    <Button>
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Flashcard */}
              {flashcards[currentIndex] && (
                <Flashcard
                  flashcard={flashcards[currentIndex]}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === flashcards.length - 1}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
