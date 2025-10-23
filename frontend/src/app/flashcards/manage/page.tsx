'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Layout from '@/components/layout/Layout';
import { useFlashcards } from '@/hooks/useFlashcards';
import { flashcardService } from '@/lib/flashcards';
import { useAppStore } from '@/lib/store';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ArrowLeft,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import type { Flashcard } from '@/types';

export default function ManageFlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const { deleteFlashcard: deleteFromStore } = useAppStore();
  const { fetchUserFlashcards } = useFlashcards();
  const router = useRouter();

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await flashcardService.getUserFlashcards(1, 100); // Load more cards for management
      setFlashcards(response.flashcards);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await flashcardService.deleteFlashcard(id);
      deleteFromStore(id);
      setFlashcards(prev => prev.filter(card => card.id !== id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard');
    } finally {
      setDeleting(false);
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = !searchTerm || 
      card.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = !difficultyFilter || (card.difficulty || 'easy') === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div className="text-lg text-gray-600 mt-4">Loading flashcards...</div>
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
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">Error: {error}</div>
              <Button onClick={loadFlashcards}>Try Again</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/flashcards">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Study
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Flashcards</h1>
                <p className="text-gray-600">
                  Edit, delete, and organize your vocabulary collection
                </p>
              </div>
            </div>
            <Link href="/flashcards/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Card
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
                <div className="text-sm text-gray-600">Total Cards</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-green-600">
                  {flashcards.filter(card => (card.difficulty || 'easy') === 'easy').length}
                </div>
                <div className="text-sm text-gray-600">Easy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <div className="text-2xl font-bold text-orange-600">
                  {flashcards.filter(card => (card.difficulty || 'easy') === 'medium').length}
                </div>
                <div className="text-sm text-gray-600">Medium</div>
              </CardContent>
            </Card>
          </div>

          {/* Flashcards List */}
          {filteredFlashcards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || difficultyFilter ? 'No matching flashcards' : 'No flashcards yet'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchTerm || difficultyFilter 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start building your vocabulary collection'
                  }
                </p>
                {!searchTerm && !difficultyFilter && (
                  <Link href="/flashcards/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Card
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlashcards.map((flashcard) => (
                <Card key={flashcard.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {flashcard.word}
                        </h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          (flashcard.difficulty || 'easy') === 'easy' 
                            ? 'bg-green-100 text-green-800'
                            : (flashcard.difficulty || 'easy') === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {flashcard.difficulty || 'easy'}
                        </span>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Link href={`/flashcards/${flashcard.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteConfirmId(flashcard.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-3">{flashcard.definition}</p>
                    {flashcard.example && (
                      <p className="text-sm text-gray-500 italic">
                        "{flashcard.example}"
                      </p>
                    )}
                    <div className="mt-3 text-xs text-gray-400">
                      {flashcard.partOfSpeech} • Created {new Date(flashcard.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Delete Flashcard</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this flashcard? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirmId(null)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleDelete(deleteConfirmId)}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
