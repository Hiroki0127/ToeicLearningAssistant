'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFlashcards } from '@/hooks/useFlashcards';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditFlashcardPage() {
  const router = useRouter();
  const params = useParams();
  const flashcardId = params.id as string;
  
  const { getFlashcardById, updateFlashcard, deleteFlashcard, loading } = useFlashcards();
  
  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    example: '',
    partOfSpeech: 'noun',
    difficulty: 'easy'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load flashcard data when component mounts
  useEffect(() => {
    const loadFlashcard = async () => {
      try {
        const flashcard = await getFlashcardById(flashcardId);
        if (flashcard) {
          setFormData({
            word: flashcard.word,
            definition: flashcard.definition,
            example: flashcard.example,
            partOfSpeech: flashcard.partOfSpeech || 'noun',
            difficulty: flashcard.difficulty || 'easy'
          });
        }
      } catch (error) {
        console.error('Error loading flashcard:', error);
        router.push('/flashcards');
      } finally {
        setIsLoading(false);
      }
    };

    if (flashcardId) {
      loadFlashcard();
    }
  }, [flashcardId, getFlashcardById, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.word.trim()) {
      newErrors.word = 'Word is required';
    }

    if (!formData.definition.trim()) {
      newErrors.definition = 'Definition is required';
    }

    if (!formData.example.trim()) {
      newErrors.example = 'Example sentence is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const flashcardData = formData;

      await updateFlashcard(flashcardId, flashcardData);
      router.push('/flashcards');
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      try {
        await deleteFlashcard(flashcardId);
        router.push('/flashcards');
      } catch (error) {
        console.error('Error deleting flashcard:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flashcard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Flashcard</h1>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Edit Flashcard Details</h2>
            <p className="text-sm text-gray-600">Update your vocabulary word and its details</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Word */}
              <div>
                <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
                  Word *
                </label>
                <input
                  type="text"
                  id="word"
                  name="word"
                  value={formData.word}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.word ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the vocabulary word"
                />
                {errors.word && (
                  <p className="mt-1 text-sm text-red-600">{errors.word}</p>
                )}
              </div>

              {/* Definition */}
              <div>
                <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
                  Definition *
                </label>
                <textarea
                  id="definition"
                  name="definition"
                  value={formData.definition}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.definition ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the definition"
                />
                {errors.definition && (
                  <p className="mt-1 text-sm text-red-600">{errors.definition}</p>
                )}
              </div>

              {/* Example */}
              <div>
                <label htmlFor="example" className="block text-sm font-medium text-gray-700 mb-2">
                  Example Sentence *
                </label>
                <textarea
                  id="example"
                  name="example"
                  value={formData.example}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.example ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter an example sentence using the word"
                />
                {errors.example && (
                  <p className="mt-1 text-sm text-red-600">{errors.example}</p>
                )}
              </div>

              {/* Part of Speech */}
              <div>
                <label htmlFor="partOfSpeech" className="block text-sm font-medium text-gray-700 mb-2">
                  Part of Speech
                </label>
                <select
                  id="partOfSpeech"
                  name="partOfSpeech"
                  value={formData.partOfSpeech}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                  <option value="pronoun">Pronoun</option>
                  <option value="interjection">Interjection</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Update Flashcard
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
