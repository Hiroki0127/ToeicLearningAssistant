'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { studySessionService } from '@/lib/study-sessions';
import { BookOpen, Plus, Edit3 } from 'lucide-react';

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const { flashcards, loading, error, fetchFlashcards, fetchUserFlashcards } = useFlashcards();

  const handleCorrect = () => {
    setCorrectAnswers(prev => prev + 1);
    // Auto-advance to next card or end session if it's the last card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));
    } else {
      // Last card - end the session
      handleSessionEnd();
    }
  };

  const handleIncorrect = () => {
    setIncorrectAnswers(prev => prev + 1);
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

  const [sessionCompleted, setSessionCompleted] = useState(false);

  const handleSessionEnd = async () => {
    try {
      const sessionData = {
        sessionType: 'flashcards' as const,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        cardsStudied: flashcards.length,
        correctAnswers,
        incorrectAnswers,
      };
      
      await studySessionService.createStudySession(sessionData);
      setSessionCompleted(true);
    } catch (error) {
      console.error('Failed to save study session:', error);
      // Still show completion screen even if save fails
      setSessionCompleted(true);
    }
  };

  const handleRestartSession = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setSessionCompleted(false);
  };

  // Fetch flashcards when component mounts
  useEffect(() => {
    // Only fetch from API if store is empty
    if (flashcards.length === 0) {
      // Fetch ALL flashcards for study session (use high limit to get all)
      fetchUserFlashcards(1, 1000).catch((error) => {
        // Fallback to all flashcards if user flashcards fail
        fetchFlashcards({ page: 1, limit: 1000 }).catch((fallbackError) => {
          console.error('Failed to fetch flashcards:', fallbackError);
        });
      });
    }
  }, [fetchUserFlashcards, fetchFlashcards, flashcards.length]);

  // Reset current index when flashcards change
  useEffect(() => {
    setCurrentIndex(0);
  }, [flashcards]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-lg text-gray-600">Loading flashcards...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-lg text-red-600">Error loading flashcards: {error}</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Flashcards Available
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding some vocabulary flashcards to study.
              </p>
              <Link href="/flashcards/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flashcard
                </Button>
              </Link>
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
            <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
            <p className="text-gray-600">
              Study vocabulary to improve your TOEIC score
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
