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
      const query = currentInput.toLowerCase().trim();
      
      console.log('Processing query:', query);
      
      // Check for practice questions FIRST (most specific)
      const isPracticeQuery = query.includes('practice') || 
          query.includes('part 5') ||
          query.includes('part 6') ||
          query.includes('part 7') ||
          (query.includes('question') && (query.includes('toeic') || query.includes('part'))) || 
          query.includes('quiz');
      
      console.log('Is practice query?', isPracticeQuery);
      
      if (isPracticeQuery) {
        
        // Extract topic from query, but preserve part information
        let topic = query.replace(/practice|question|quiz|toeic|help me with|give me/gi, '').trim();
        if (!topic) topic = 'general TOEIC';
        
        // Preserve part information in the topic
        if (query.includes('part 5')) {
          topic = 'part 5 ' + topic;
        } else if (query.includes('part 6')) {
          topic = 'part 6 ' + topic;
        } else if (query.includes('part 7')) {
          topic = 'part 7 ' + topic;
        }
        
        console.log('Calling question generation API for topic:', topic);
        console.log('Original query was:', currentInput);
        const questionResponse = await fetch('https://toeiclearningassistant.onrender.com/api/ai/generate-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            topic,
            difficulty: 'medium'
          }),
        });
        
        console.log('Question API response status:', questionResponse.status);
        
        if (questionResponse.ok) {
          const data = await questionResponse.json();
          console.log('Question API success:', data);
          const question = data.data;
          response = `Here's a TOEIC practice question for you:\n**Part ${question.part}**\n${question.passage || question.question}\n\n`;
          
          if (question.options) {
            response += `**Options:**\n`;
            question.options.forEach((option: string, index: number) => {
              // Check if option already has alphabet prefix (A), B), etc.)
              if (option.match(/^[A-D]\)/)) {
                response += `${option}\n`;
              } else {
                response += `${String.fromCharCode(65 + index)}. ${option}\n`;
              }
            });
          }
          
          if (question.questions) {
            question.questions.forEach((q: any) => {
              response += `\n**Question ${q.number}:** ${q.question}\n\n`;
              q.options.forEach((option: string, index: number) => {
                // Check if option already has alphabet prefix (A), B), etc.)
                if (option.match(/^[A-D]\)/)) {
                  response += `${option}\n`;
                } else {
                  response += `${String.fromCharCode(65 + index)}. ${option}\n`;
                }
              });
            });
          }
          
          response += `\n**Explanation:**\n${question.explanation}`;
        } else {
          const errorData = await questionResponse.json();
          console.error('Question generation API error:', errorData);
          // Fallback response for practice questions
          response = `**TOEIC Practice Question (Sample)**\n\n` +
            `I'm currently unable to generate new questions via AI, but here's a sample TOEIC Part 5 question:\n\n` +
            `**Question:** The marketing team has been working _____ to launch the new product.\n\n` +
            `A) diligent` +
            `B) diligently` +
            `C) diligence` +
            `D) diligentness\n` +
            `**Answer:** B) diligently\n\n` +
            `**Explanation:** The blank requires an adverb to modify 'working'. 'Diligently' is the correct adverb form.\n\n` +
            `You can find more practice questions in the Quiz section of the app!`;
        }
      } 
      // Check for vocabulary queries (single words or "what does X mean")
      else if (/^[a-zA-Z]+$/.test(query) || 
               query.includes('what does') || 
               query.includes('meaning') || 
               query.includes('definition')) {
        
        console.log('Detected vocabulary query');
        
        // Extract word from query
        let word = query;
        if (query.includes('what does')) {
          word = query.replace(/what does|mean|\?|'/gi, '').trim();
        } else if (query.includes('meaning') || query.includes('definition')) {
          word = query.replace(/meaning|definition|\?/gi, '').trim();
        }
        
        console.log('Calling vocabulary API for word:', word);
        const vocabResponse = await fetch('https://toeiclearningassistant.onrender.com/api/ai/explain-vocabulary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ word }),
        });
        
        console.log('Vocabulary API response status:', vocabResponse.status);
        
        if (vocabResponse.ok) {
          const data = await vocabResponse.json();
          console.log('Vocabulary API success:', data);
          response = data.data.explanation;
        } else {
          const errorData = await vocabResponse.json();
          console.error('Vocabulary API error:', errorData);
          // Fallback response for vocabulary
          response = `**${word.toUpperCase()}**\n\n` +
            `I'm currently unable to access the AI vocabulary service, but here's what I can tell you:\n\n` +
            `• This is a common TOEIC business vocabulary word\n` +
            `• Try looking it up in your flashcards or dictionary\n` +
            `• Practice using it in business contexts\n` +
            `• The AI service will be available once the API key is configured\n\n` +
            `For now, you can use the flashcard system to study vocabulary!`;
        }
      } 
      // Check for grammar queries
      else if (query.includes('grammar') || 
               query.includes('tense') || 
               query.includes('sentence') ||
               query.includes('explain')) {
        
        console.log('Calling grammar API for query:', currentInput);
        const grammarResponse = await fetch('https://toeiclearningassistant.onrender.com/api/ai/explain-grammar', {
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
          const errorData = await grammarResponse.json();
          console.error('Grammar API error:', errorData);
          // Fallback response for grammar
          response = `**Grammar Help**\n\n` +
            `I'm currently unable to access the AI grammar service, but here are some general TOEIC grammar tips:\n\n` +
            `• **Verb Tenses**: Focus on present perfect, past perfect, and future tenses\n` +
            `• **Passive Voice**: Common in business contexts\n` +
            `• **Conditionals**: If/when statements are frequently tested\n` +
            `• **Prepositions**: In, on, at, by, for, with usage\n` +
            `• **Articles**: A, an, the in business contexts\n\n` +
            `The AI grammar service will be available once the API key is configured!`;
        }
      } 
      // Check for study tips/vocabulary help
      else if (query.includes('remember') || 
               query.includes('vocab') || 
               query.includes('study') ||
               query.includes('help')) {
        
        response = `Here are some effective strategies for remembering TOEIC vocabulary:\n\n` +
          `• **Spaced Repetition**: Review words at increasing intervals (1 day, 3 days, 1 week)\n` +
          `• **Context Learning**: Learn words in sentences, not in isolation\n` +
          `• **Association**: Connect new words to words you already know\n` +
          `• **Visual Memory**: Create mental images or use flashcards\n` +
          `• **Practice**: Use words in your own sentences\n` +
          `• **Business Context**: Focus on how words are used in business situations\n\n` +
          `Try asking me about specific words like "allocate" or "contingency" to see detailed explanations!`;
      } 
      else {
        console.log('Falling through to general help');
        // General TOEIC help
        response = `I can help you with TOEIC preparation in several ways:\n\n` +
          `• **Vocabulary**: Ask about specific words (e.g., "allocate" or "what does allocate mean?")\n` +
          `• **Grammar**: Ask grammar questions (e.g., "Explain passive voice")\n` +
          `• **Practice Questions**: Request practice questions (e.g., "Give me TOEIC part 5 practice")\n` +
          `• **Study Tips**: Ask for learning strategies (e.g., "How can I remember vocabulary?")\n\n` +
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
    "Explain passive voice",
    "contingency",
    "Generate a part 5 question",
    "Generate a part 6 question",
    "Generate a part 7 question"
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
                  <h2 className="text-lg font-semibold flex items-center text-gray-900">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Chat with AI Assistant
                  </h2>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 break-words ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap overflow-wrap-anywhere">
                            {message.content.split('\n').map((line, index, array) => {
                              const isEmptyLine = line.trim() === '';
                              const nextLine = array[index + 1];
                              const isNextLineEmpty = nextLine && nextLine.trim() === '';
                              const isNextLineBold = nextLine && nextLine.trim().startsWith('**');
                              
                              // Add spacing for empty lines
                              if (isEmptyLine) {
                                return <div key={index} className="h-3"></div>;
                              }
                              
                              // Handle bold text (headers)
                              if (line.startsWith('**') && line.endsWith('**')) {
                                return (
                                  <div key={index} className="mb-2 mt-3 first:mt-0">
                                    <strong className="text-base">{line.slice(2, -2)}</strong>
                                  </div>
                                );
                              } 
                              // Handle bullet points
                              else if (line.startsWith('• ')) {
                                return <div key={index} className="ml-2 mb-2">• {line.slice(2)}</div>;
                              } 
                              // Handle options (A, B, C, D)
                              else if (/^[A-D][\.\)]/.test(line.trim())) {
                                return <div key={index} className="mb-1.5 ml-2">{line}</div>;
                              }
                              // Handle regular text lines
                              else {
                                const isQuestionLine = line.includes('Question') || line.includes('Options:') || line.includes('Explanation:');
                                const spacingClass = isQuestionLine ? 'mt-2 mb-1' : 'mb-2';
                                return <div key={index} className={spacingClass}>{line}</div>;
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                  <h3 className="text-lg font-semibold flex items-center text-gray-900">
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
                        className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-900"
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
                  <h3 className="text-lg font-semibold flex items-center text-gray-900">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Study Tips
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-gray-700">
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

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
