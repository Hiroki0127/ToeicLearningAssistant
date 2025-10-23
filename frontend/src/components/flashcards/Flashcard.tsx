import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, getDifficultyColor, getPartOfSpeechColor } from '@/utils';
import type { Flashcard as FlashcardType } from '@/types';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';

interface FlashcardProps {
  flashcard: FlashcardType;
  onNext: () => void;
  onPrevious: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  flashcard,
  onNext,
  onPrevious,
  onCorrect,
  onIncorrect,
  isFirst = false,
  isLast = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!showAnswer) {
      setShowAnswer(true);
    }
  };

  const handleCorrect = () => {
    onCorrect();
    if (!isLast) {
      onNext();
    }
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handleIncorrect = () => {
    onIncorrect();
    if (!isLast) {
      onNext();
    }
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handleNext = () => {
    onNext();
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const handlePrevious = () => {
    onPrevious();
    setIsFlipped(false);
    setShowAnswer(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="relative overflow-hidden">
        <CardContent className="p-8">
          {/* Difficulty and Part of Speech Badges */}
          <div className="flex justify-between items-start mb-6">
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getDifficultyColor(flashcard.difficulty || 'easy')
              )}
            >
              {flashcard.difficulty || 'easy'}
            </span>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                getPartOfSpeechColor(flashcard.partOfSpeech || 'noun')
              )}
            >
              {flashcard.partOfSpeech || 'noun'}
            </span>
          </div>

          {/* Flashcard Content */}
          <div
            className={cn(
              'relative h-64 transition-transform duration-500 transform-gpu',
              isFlipped ? 'rotate-y-180' : ''
            )}
          >
            {/* Front Side */}
            <div
              className={cn(
                'absolute inset-0 flex flex-col justify-center items-center text-center p-6',
                isFlipped ? 'opacity-0' : 'opacity-100'
              )}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {flashcard.word}
              </h2>
            </div>

            {/* Back Side */}
            <div
              className={cn(
                'absolute inset-0 flex flex-col justify-center items-center text-center p-6 rotate-y-180',
                isFlipped ? 'opacity-100' : 'opacity-0'
              )}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Definition
              </h3>
              <p className="text-gray-700 mb-4 text-lg">
                {flashcard.definition}
              </p>
              {flashcard.example && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Example:
                  </h4>
                  <p className="text-gray-600 italic">
                    &ldquo;{flashcard.example}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation and Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirst}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFlip}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {isFlipped ? 'Show Word' : 'Show Definition'}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={isLast}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Answer Buttons (only show when flipped) */}
          {showAnswer && (
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="danger"
                size="lg"
                onClick={handleIncorrect}
                className="flex-1 max-w-32"
              >
                <X className="h-5 w-5 mr-2" />
                Incorrect
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCorrect}
                className="flex-1 max-w-32"
              >
                <Check className="h-5 w-5 mr-2" />
                Correct
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
