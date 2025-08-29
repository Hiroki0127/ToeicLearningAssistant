import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { BookOpen, Brain, Target, TrendingUp, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                TOEIC Learning Assistant
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/flashcards" className="text-gray-600 hover:text-blue-600">
                Flashcards
              </Link>
              <Link href="/quiz" className="text-gray-600 hover:text-blue-600">
                Quiz
              </Link>
              <Link href="/progress" className="text-gray-600 hover:text-blue-600">
                Progress
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                Login
              </Link>
            </nav>
            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                Menu
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master TOEIC with
            <span className="text-blue-600"> AI-Powered</span> Learning
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhance your TOEIC preparation with intelligent flashcards, personalized quizzes, 
            and adaptive learning that remembers your progress and adjusts to your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/flashcards">
              <Button size="lg" className="w-full sm:w-auto">
                Start Learning
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our TOEIC Assistant?
            </h2>
            <p className="text-xl text-gray-600">
              Advanced features designed to accelerate your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  AI-Powered Flashcards
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Intelligent vocabulary cards with definitions, examples, and 
                  difficulty-based learning paths.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Personalized Quizzes
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Adaptive quizzes that focus on your weak areas and adjust 
                  difficulty based on your performance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Progress Tracking
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Detailed analytics and progress reports to monitor your 
                  improvement and maintain study streaks.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  RAG Technology
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Retrieval-Augmented Generation for dynamic grammar and 
                  vocabulary explanations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Knowledge Graphs
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connected concepts and related vocabulary to build 
                  comprehensive understanding.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Agentic Memory
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  AI that remembers your learning patterns and provides 
                  personalized recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Boost Your TOEIC Score?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have improved their TOEIC performance 
            with our AI-powered learning platform.
          </p>
          <Link href="/register">
            <Button variant="secondary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-lg font-semibold">TOEIC Assistant</span>
              </div>
              <p className="text-gray-400">
                AI-powered TOEIC preparation platform designed to help you 
                achieve your target score.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Flashcards</li>
                <li>Quizzes</li>
                <li>Progress Tracking</li>
                <li>AI Tutor</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Study Tips</li>
                <li>Practice Tests</li>
                <li>Vocabulary Lists</li>
                <li>Grammar Guide</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TOEIC Learning Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
