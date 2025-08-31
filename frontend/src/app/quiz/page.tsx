'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Target,
  BarChart3,
  RotateCcw
} from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-in-the-blank' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  accuracy: number;
}

export default function QuizPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Mock quiz data (in real app, this would come from API)
  const [questions] = useState<Question[]>([
    {
      id: '1',
      type: 'multiple-choice',
      question: 'What does "procurement" mean in business context?',
      options: [
        'The process of selling goods',
        'The process of obtaining goods or services',
        'The process of manufacturing products',
        'The process of marketing products'
      ],
      correctAnswer: 'The process of obtaining goods or services',
      explanation: 'Procurement refers to the process of obtaining goods or services, typically for business use.',
      points: 5
    },
    {
      id: '2',
      type: 'multiple-choice',
      question: 'Which word means "achieving maximum productivity with minimum wasted effort"?',
      options: [
        'Effective',
        'Efficient',
        'Productive',
        'Successful'
      ],
      correctAnswer: 'Efficient',
      explanation: 'Efficient means achieving maximum productivity with minimum wasted effort.',
      points: 5
    },
    {
      id: '3',
      type: 'fill-in-the-blank',
      question: 'An _____ is a document listing goods or services provided and their prices.',
      correctAnswer: 'invoice',
      explanation: 'An invoice is a document that lists goods or services provided and their prices.',
      points: 5
    },
    {
      id: '4',
      type: 'true-false',
      question: 'A "deadline" is a flexible target date that can be extended without consequences.',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'A deadline is a fixed date or time by which something must be completed, not a flexible target.',
      points: 5
    },
    {
      id: '5',
      type: 'multiple-choice',
      question: 'What is the primary purpose of "negotiation" in business?',
      options: [
        'To avoid conflict at all costs',
        'To try to reach an agreement by formal discussion',
        'To impose one\'s terms on others',
        'To delay decision making'
      ],
      correctAnswer: 'To try to reach an agreement by formal discussion',
      explanation: 'Negotiation is the process of trying to reach an agreement through formal discussion.',
      points: 5
    }
  ]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isQuizStarted && !isQuizFinished && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [isQuizStarted, isQuizFinished, timeLeft]);

  const startQuiz = () => {
    setIsQuizStarted(true);
    setTimeLeft(300);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer('');
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    calculateResults();
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / totalQuestions) * 100;
    const timeSpent = 300 - timeLeft;
    const accuracy = (correctAnswers / totalQuestions) * 100;

    setQuizResult({
      totalQuestions,
      correctAnswers,
      score,
      timeSpent,
      accuracy
    });
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex + 1]?.id] || '');
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[questions[currentQuestionIndex - 1]?.id] || '');
    }
  };

  const resetQuiz = () => {
    setIsQuizStarted(false);
    setIsQuizFinished(false);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setAnswers({});
    setTimeLeft(300);
    setQuizResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isQuizStarted && !isQuizFinished) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">TOEIC Vocabulary Quiz</h1>
              <p className="text-xl text-gray-600">Test your knowledge with our adaptive quiz system</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900">Quiz Information</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Time Limit</p>
                    <p className="text-2xl font-bold text-gray-900">5 min</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Points</p>
                    <p className="text-2xl font-bold text-gray-900">{totalQuestions * 5}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Question Types:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Multiple Choice Questions
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Fill in the Blank
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      True/False Questions
                    </li>
                  </ul>
                </div>

                <Button 
                  onClick={startQuiz} 
                  size="lg" 
                  className="w-full"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (isQuizFinished && !showResults) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <h2 className="text-2xl font-semibold text-gray-900">Quiz Completed!</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600">
                  Great job completing the quiz! Click below to see your results and review your answers.
                </p>
                <Button 
                  onClick={() => setShowResults(true)} 
                  size="lg" 
                  className="w-full"
                >
                  View Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  if (showResults && quizResult) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Results</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Results Summary */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Your Performance</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className={`text-6xl font-bold mb-2 ${getScoreColor(quizResult.score)}`}>
                      {Math.round(quizResult.score)}%
                    </div>
                    <p className="text-gray-600">Overall Score</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Correct</p>
                      <p className="text-xl font-bold text-gray-900">{quizResult.correctAnswers}</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Incorrect</p>
                      <p className="text-xl font-bold text-gray-900">
                        {quizResult.totalQuestions - quizResult.correctAnswers}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Spent:</span>
                      <span className="font-medium">{formatTime(quizResult.timeSpent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-medium">{Math.round(quizResult.accuracy)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Question Review */}
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer && 
                      userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
                    
                    return (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            Question {index + 1}
                          </span>
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-900 mb-2">{question.question}</p>
                        <div className="text-xs text-gray-600">
                          <p><strong>Your answer:</strong> {userAnswer || 'Not answered'}</p>
                          <p><strong>Correct answer:</strong> {question.correctAnswer}</p>
                          {question.explanation && (
                            <p className="mt-1 text-blue-600">{question.explanation}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <Button 
                onClick={resetQuiz} 
                variant="outline"
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/flashcards'} 
                className="flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Study Flashcards
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-red-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedAnswer === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{option}</span>
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'fill-in-the-blank' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={selectedAnswer}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {currentQuestion.type === 'true-false' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                          selectedAnswer === option
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{option}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-4">
              <Button
                onClick={finishQuiz}
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Finish Quiz
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="flex items-center"
              >
                {currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
