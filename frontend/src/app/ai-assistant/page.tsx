'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { 
  Bot, 
  Send, 
  MessageCircle, 
  Lightbulb, 
  BookOpen, 
  Target,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantPage() {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your TOEIC learning assistant. I can help you with vocabulary, grammar, reading comprehension, and study strategies. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      let response = '';
      
      // Determine the type of query and route to appropriate AI service
      const query = currentInput.toLowerCase();
      
      if (query.includes('vocabulary') || query.includes('word') || query.includes('meaning') || 
          query.includes('definition') || /^[a-zA-Z]+$/.test(currentInput.trim())) {
        // Vocabulary explanation
        const word = currentInput.trim();
        const vocabResponse = await fetch('/api/ai/explain-vocabulary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word }),
        });
        
        if (vocabResponse.ok) {
          const data = await vocabResponse.json();
          response = data.data.explanation;
        } else {
          response = "I'm sorry, I couldn't process your vocabulary request. Please try again.";
        }
      } else if (query.includes('grammar') || query.includes('tense') || query.includes('sentence')) {
        // Grammar explanation
        const grammarResponse = await fetch('/api/ai/explain-grammar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            question: currentInput,
            userAnswer: "I need help understanding this grammar concept"
          }),
        });
        
        if (grammarResponse.ok) {
          const data = await grammarResponse.json();
          response = data.data.explanation;
        } else {
          response = "I'm sorry, I couldn't process your grammar question. Please try again.";
        }
      } else if (query.includes('question') || query.includes('quiz') || query.includes('practice')) {
        // Generate practice question
        const topic = currentInput.replace(/generate|question|quiz|practice/gi, '').trim() || 'general TOEIC';
        const questionResponse = await fetch('/api/ai/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            topic,
            difficulty: 'medium'
          }),
        });
        
        if (questionResponse.ok) {
          const data = await questionResponse.json();
          const question = data.data;
          response = `Here's a TOEIC practice question for you:\n\n**Part ${question.part}**\n\n${question.passage || question.question}\n\n`;
          
          if (question.options) {
            response += `Options:\n`;
            question.options.forEach((option: string, index: number) => {
              response += `${String.fromCharCode(65 + index)}. ${option}\n`;
            });
          }
          
          if (question.questions) {
            question.questions.forEach((q: any) => {
              response += `\n**Question ${q.number}:** ${q.question}\n`;
              q.options.forEach((option: string, index: number) => {
                response += `${String.fromCharCode(65 + index)}. ${option}\n`;
              });
            });
          }
          
          response += `\n**Explanation:** ${question.explanation}`;
        } else {
          response = "I'm sorry, I couldn't generate a practice question. Please try again.";
        }
      } else {
        // General TOEIC help
        response = `I can help you with TOEIC preparation in several ways:\n\n` +
          `• **Vocabulary**: Ask about specific words (e.g., "What does 'allocate' mean?")\n` +
          `• **Grammar**: Ask grammar questions (e.g., "Explain present perfect tense")\n` +
          `• **Practice Questions**: Request practice questions (e.g., "Generate a question about business emails")\n\n` +
          `What specific TOEIC topic would you like help with?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI service:', error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "allocate",
    "Explain passive voice",
    "Generate a question about business emails",
    "contingency",
    "Explain present perfect tense",
    "Generate a question about office procedures"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Bot className="h-8 w-8 mr-3 text-blue-600" />
                  AI Assistant
                </h1>
                <p className="text-gray-600">
                  Get personalized help with your TOEIC studies
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <h2 className="text-lg font-semibold flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Chat with AI Assistant
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {message.content.split('\n').map((line, index) => {
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return <strong key={index}>{line.slice(2, -2)}</strong>;
                              } else if (line.startsWith('• ')) {
                                return <div key={index} className="ml-2">• {line.slice(2)}</div>;
                              } else {
                                return <div key={index}>{line}</div>;
                              }
                            })}
                          </div>
                          <p className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about TOEIC..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Questions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Quick Questions
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Study Tips */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Study Tips
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 mt-0.5 text-green-600" />
                      <p>Focus on one skill at a time (listening, reading, grammar)</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 mt-0.5 text-green-600" />
                      <p>Practice with real TOEIC materials</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 mt-0.5 text-green-600" />
                      <p>Review mistakes and learn from them</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 mt-0.5 text-green-600" />
                      <p>Set realistic daily study goals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Status</h3>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <span className="font-medium">AI Assistant:</span> Ready
                    </p>
                    <p className="mb-2">
                      <span className="font-medium">User:</span> {user?.name || 'Guest'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {isAuthenticated ? 'Authenticated' : 'Not logged in'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
