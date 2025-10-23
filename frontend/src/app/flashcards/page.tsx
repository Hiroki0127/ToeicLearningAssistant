'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useAppStore } from '@/lib/store';
import { useFlashcards } from '@/hooks/useFlashcards';
import { BookOpen, Plus, Settings, Edit3 } from 'lucide-react';

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const { addStudySession } = useAppStore();
  const { flashcards, loading, error, fetchFlashcards, fetchUserFlashcards } = useFlashcards();

  const handleCorrect = () => {
    setCorrectAnswers(prev => prev + 1);
  };

  const handleIncorrect = () => {
    setIncorrectAnswers(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSessionEnd = () => {
    const session = {
      id: Date.now().toString(),
      userId: 'demo-user',
      startTime: new Date(),
      endTime: new Date(),
      cardsStudied: flashcards.length,
      correctAnswers,
      incorrectAnswers,
      sessionType: 'flashcards' as const,
    };
    addStudySession(session);
  };

  // Fetch flashcards when component mounts
  useEffect(() => {
    console.log('Fetching flashcards...');
    // Try to fetch user flashcards first, fallback to all flashcards
    fetchUserFlashcards().then((result) => {
      console.log('User flashcards fetched:', result);
    }).catch((error) => {
      console.log('User flashcards failed, trying all flashcards:', error);
      fetchFlashcards().then((result) => {
        console.log('All flashcards fetched:', result);
      }).catch((fallbackError) => {
        console.error('Error fetching flashcards:', fallbackError);
      });
    });
  }, [fetchUserFlashcards, fetchFlashcards]);

  // Reset current index when flashcards change
  useEffect(() => {
    console.log('Flashcards changed:', flashcards.length, flashcards);
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
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
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

        {/* Flashcard */}
        <Flashcard
          flashcard={flashcards[currentIndex]}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          isFirst={currentIndex === 0}
          isLast={currentIndex === flashcards.length - 1}
        />

        {/* Session End Button */}
        {currentIndex === flashcards.length - 1 && (
          <div className="text-center mt-8">
            <Button onClick={handleSessionEnd} size="lg">
              End Study Session
            </Button>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
}
