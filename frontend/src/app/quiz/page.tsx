'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';
import { CheckCircle, XCircle, Clock, Trophy, Target } from 'lucide-react';

interface Question {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  timeLimit: number;
  questions: Question[];
}

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sample quiz data (replace with API call)
  const sampleQuizzes: Quiz[] = [
    {
      id: '1',
      title: 'Business Vocabulary Quiz',
      description: 'Test your knowledge of common business terms',
      type: 'vocabulary',
      difficulty: 'medium',
      timeLimit: 15,
      questions: [
        {
          id: '1',
          type: 'multiple-choice',
          question: 'What does "procurement" mean?',
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
          type: 'multiple-choice',
          question: 'What is an "invoice"?',
          options: [
            'A receipt for payment',
            'A document listing goods or services provided and their prices',
            'A contract between parties',
            'A financial report'
          ],
          correctAnswer: 'A document listing goods or services provided and their prices',
          explanation: 'An invoice is a document that lists goods or services provided and their prices, typically sent to request payment.',
          points: 5
        }
      ]
    }
  ];

  useEffect(() => {
    // Load quizzes (replace with API call)
    setQuizzes(sampleQuizzes);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQuizActive, timeLeft]);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    setIsQuizActive(true);
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer || !selectedQuiz) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);

    // Check if answer is correct
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + currentQuestion.points);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedQuiz) return;

    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setIsQuizActive(false);
    // Here you would typically save the quiz results to the database
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    if (!selectedQuiz) return null;
    return selectedQuiz.questions[currentQuestionIndex];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedQuiz && isQuizActive) {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return null;

    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          {/* Quiz Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <Target className="h-5 w-5" />
                  <span>Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQuestion.question}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedAnswer === option
                        ? option === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {selectedAnswer === option && (
                        option === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Explanation:</h3>
                  <p className="text-blue-800">{currentQuestion.explanation}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {showExplanation && (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full"
                >
                  {currentQuestionIndex < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (selectedQuiz && !isQuizActive) {
    // Quiz completed
    const totalPoints = selectedQuiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);

    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>
              <p className="text-gray-600">Great job completing the quiz</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}/{totalPoints}</div>
                <div className="text-lg text-gray-600 mb-4">{percentage}%</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedQuiz.questions.filter(q => q.correctAnswer === selectedAnswer).length}
                  </div>
                  <div className="text-sm text-green-700">Correct</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedQuiz.questions.length - selectedQuiz.questions.filter(q => q.correctAnswer === selectedAnswer).length}
                  </div>
                  <div className="text-sm text-red-700">Incorrect</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-4">
              <Button
                onClick={() => {
                  setSelectedQuiz(null);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setScore(0);
                }}
                variant="outline"
                className="flex-1"
              >
                Take Another Quiz
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TOEIC Quizzes</h1>
          <p className="text-gray-600">Test your knowledge with our interactive TOEIC-style quizzes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium capitalize">{quiz.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className="font-medium capitalize">{quiz.difficulty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time Limit:</span>
                    <span className="font-medium">{quiz.timeLimit} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Questions:</span>
                    <span className="font-medium">{quiz.questions.length}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => startQuiz(quiz)}
                  className="w-full"
                >
                  Start Quiz
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
