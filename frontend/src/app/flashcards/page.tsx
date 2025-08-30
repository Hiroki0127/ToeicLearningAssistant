'use client';

import { useState } from 'react';
import { Flashcard } from '@/components/flashcards/Flashcard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useAppStore } from '@/lib/store';
import type { Flashcard as FlashcardType } from '@/types';
import { BookOpen, Plus, Settings } from 'lucide-react';

// Sample flashcards for testing
const sampleFlashcards: FlashcardType[] = [
  {
    id: '1',
    word: 'invoice',
    definition: 'A document listing goods or services provided and their prices',
    example: 'Please send me the invoice for the consulting services.',
    partOfSpeech: 'noun',
    difficulty: 'medium',
    category: 'business',
    tags: ['business', 'finance', 'documentation'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    word: 'procurement',
    definition: 'The process of obtaining goods or services',
    example: 'The procurement department handles all vendor contracts.',
    partOfSpeech: 'noun',
    difficulty: 'hard',
    category: 'business',
    tags: ['business', 'purchasing', 'management'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    word: 'efficient',
    definition: 'Achieving maximum productivity with minimum wasted effort',
    example: 'The new system is much more efficient than the old one.',
    partOfSpeech: 'adjective',
    difficulty: 'easy',
    category: 'general',
    tags: ['productivity', 'performance', 'optimization'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const { addStudySession } = useAppStore();

  const handleCorrect = () => {
    setCorrectAnswers(prev => prev + 1);
  };

  const handleIncorrect = () => {
    setIncorrectAnswers(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < sampleFlashcards.length - 1) {
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
      cardsStudied: sampleFlashcards.length,
      correctAnswers,
      incorrectAnswers,
      sessionType: 'flashcards' as const,
    };
    addStudySession(session);
  };

  if (sampleFlashcards.length === 0) {
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
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Flashcard
              </Button>
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
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              Progress: {currentIndex + 1} of {sampleFlashcards.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentIndex + 1) / sampleFlashcards.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / sampleFlashcards.length) * 100}%`,
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
                {sampleFlashcards.length - (currentIndex + 1)}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </CardContent>
          </Card>
        </div>

        {/* Flashcard */}
        <Flashcard
          flashcard={sampleFlashcards[currentIndex]}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
          isFirst={currentIndex === 0}
          isLast={currentIndex === sampleFlashcards.length - 1}
        />

        {/* Session End Button */}
        {currentIndex === sampleFlashcards.length - 1 && (
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
