'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, MessageCircle, BookOpen, Lightbulb } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'question'>('vocabulary');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      console.log('Auth token:', token ? 'Found' : 'Not found');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
      
      console.log('Request headers:', headers);
      console.log('Request body:', activeTab === 'question' ? { topic: input, difficulty: 'medium' } : 
                  activeTab === 'grammar' ? { question: input, userAnswer: 'A' } : 
                  { word: input });

      let response;
      if (activeTab === 'vocabulary') {
        response = await fetch('http://localhost:3001/api/ai/explain-vocabulary', {
          method: 'POST',
          headers,
          body: JSON.stringify({ word: input }),
        });
      } else if (activeTab === 'grammar') {
        response = await fetch('http://localhost:3001/api/ai/explain-grammar', {
          method: 'POST',
          headers,
          body: JSON.stringify({ question: input, userAnswer: 'A' }),
        });
      } else {
        response = await fetch('http://localhost:3001/api/ai/generate-question', {
          method: 'POST',
          headers,
          body: JSON.stringify({ topic: input, difficulty: 'medium' }),
        });
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        const textResponse = await response.text();
        console.log('Raw response text:', textResponse);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `❌ **Error:** Invalid response from server (${response.status} ${response.statusText})\n\nRaw response: ${textResponse}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
      
      // Check for errors first
      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        const validationErrors = data.validationErrors ? `\n\nValidation errors: ${JSON.stringify(data.validationErrors, null, 2)}` : '';
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: `❌ **Error:** ${errorMessage}${validationErrors}\n\nPlease make sure you are logged in and try again.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        return;
      }
      
      let aiContent = '';
      
      if (activeTab === 'question' && data.data) {
        // Format the generated TOEIC question nicely with fallback handling
        try {
          console.log('Formatting question data:', data.data);
          
          // Check for Part 6 format (passage with multiple questions)
          if (data.data.part === '6' && data.data.passage && data.data.questions) {
            const partInfo = `**TOEIC Part ${data.data.part}** - ${data.data.questionType || 'Text Completion'}\n\n`;
            let questionsText = '';
            
            const questions = Array.isArray(data.data.questions) ? data.data.questions : [];
            questions.forEach((q: { question: string; options?: string[]; correctAnswer?: string; number?: number }, index: number) => {
              const questionNum = q.number || (131 + index);
              
              if (q.options && Array.isArray(q.options)) {
                // Get the correct answer before shuffling
                const originalCorrectAnswer = q.correctAnswer || 'A';
                const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(originalCorrectAnswer);
                const correctOption = q.options[correctAnswerIndex];
                
                // Shuffle options to randomize correct answer position
                const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
                
                // Find the new position of the correct answer
                const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
                const newCorrectAnswer = ['A', 'B', 'C', 'D'][newCorrectIndex];
                
                questionsText += `**${questionNum}.** ${q.question}\n`;
                questionsText += shuffledOptions.map((option: string, optIndex: number) => 
                  `${String.fromCharCode(65 + optIndex)}. ${option}`
                ).join('\n') + '\n\n';
                questionsText += `**Answer:** ${newCorrectAnswer}\n\n`;
              } else {
                questionsText += `**${questionNum}.** ${q.question}\nA. [Option A]\nB. [Option B]\nC. [Option C]\nD. [Option D]\n\n**Answer:** ${q.correctAnswer || 'A'}\n\n`;
              }
            });
            
            aiContent = `${partInfo}**Passage:**\n${data.data.passage}\n\n**Questions:**\n${questionsText}**Explanation:**\n${data.data.explanation || 'No explanation provided'}`;
            
          } 
          // Check for Part 7 format (passage with multiple questions)
          else if (data.data.part === '7' && data.data.passage && data.data.questions) {
            const partInfo = `**TOEIC Part ${data.data.part}** - ${data.data.questionType || 'Reading Comprehension'}\n\n`;
            let questionsText = '';
            
            const questions = Array.isArray(data.data.questions) ? data.data.questions : [];
            questions.forEach((q: { question: string; options?: string[]; correctAnswer?: string; number?: number }, index: number) => {
              const questionNum = q.number || (161 + index);
              
              if (q.options && Array.isArray(q.options)) {
                // Get the correct answer before shuffling
                const originalCorrectAnswer = q.correctAnswer || 'A';
                const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(originalCorrectAnswer);
                const correctOption = q.options[correctAnswerIndex];
                
                // Shuffle options to randomize correct answer position
                const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
                
                // Find the new position of the correct answer
                const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
                const newCorrectAnswer = ['A', 'B', 'C', 'D'][newCorrectIndex];
                
                questionsText += `**${questionNum}.** ${q.question}\n`;
                questionsText += shuffledOptions.map((option: string, optIndex: number) => 
                  `${String.fromCharCode(65 + optIndex)}. ${option}`
                ).join('\n') + '\n\n';
                questionsText += `**Answer:** ${newCorrectAnswer}\n\n`;
              } else {
                questionsText += `**${questionNum}.** ${q.question}\nA. [Option A]\nB. [Option B]\nC. [Option C]\nD. [Option D]\n\n**Answer:** ${q.correctAnswer || 'A'}\n\n`;
              }
            });
            
            aiContent = `${partInfo}**Passage:**\n${data.data.passage}\n\n**Questions:**\n${questionsText}**Explanation:**\n${data.data.explanation || 'No explanation provided'}`;
            
          }
          // Check for Part 5 format (single question with options)
          else if (data.data.part === '5' && data.data.question && data.data.options) {
            const partInfo = `**TOEIC Part ${data.data.part}** - ${data.data.questionType || 'Incomplete Sentences'}\n\n`;
            
            // Get the correct answer before shuffling
            const originalCorrectAnswer = data.data.correctAnswer || 'A';
            const options = Array.isArray(data.data.options) ? data.data.options : ['Option A', 'Option B', 'Option C', 'Option D'];
            const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(originalCorrectAnswer);
            const correctOption = options[correctAnswerIndex];
            
            // Shuffle options to randomize correct answer position
            const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
            
            // Find the new position of the correct answer
            const newCorrectIndex = shuffledOptions.findIndex(option => option === correctOption);
            const newCorrectAnswer = ['A', 'B', 'C', 'D'][newCorrectIndex];
            
            // Format the question to highlight the blank if it's Part 5
            const questionText = data.data.question.includes('_____') 
              ? data.data.question.replace('_____', '**_____**') 
              : data.data.question;
            
            aiContent = `${partInfo}**Question:**\n${questionText}\n\n**Options:**\n${shuffledOptions.map((option: string, index: number) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n')}\n\n**Correct Answer:** ${newCorrectAnswer}\n\n**Explanation:**\n${data.data.explanation || 'No explanation provided'}`;
            
          } else {
            // Generic fallback for unexpected formats
            console.log('Unexpected format, data structure:', data.data);
            aiContent = `**Generated Content:**\n${JSON.stringify(data.data, null, 2)}\n\n*Note: This response had an unexpected format. Please try again.*`;
          }
        } catch (formatError) {
          console.error('Error formatting question:', formatError);
          const errorMessage = formatError instanceof Error ? formatError.message : String(formatError);
          aiContent = `**Error formatting question:** ${errorMessage}\n\n**Raw data:** ${JSON.stringify(data.data, null, 2)}`;
        }
      } else {
        aiContent = data.data?.explanation || data.data?.question || 'Sorry, I could not process your request.';
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI request failed:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">AI Study Assistant</h2>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'vocabulary' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('vocabulary')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Vocabulary
          </Button>
          <Button
            variant={activeTab === 'grammar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('grammar')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Grammar
          </Button>
          <Button
            variant={activeTab === 'question' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('question')}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Question
          </Button>
        </div>
        
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with your AI study assistant!</p>
                <p className="text-sm mt-2">
                  {activeTab === 'vocabulary' && 'Type any vocabulary word to get a detailed explanation'}
                  {activeTab === 'grammar' && 'Ask about specific grammar rules or concepts'}
                  {activeTab === 'question' && 'Type a topic (e.g., "prepositions", "business email", "company news") to generate a TOEIC question'}
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                activeTab === 'vocabulary' 
                  ? 'Enter a vocabulary word...'
                  : activeTab === 'grammar'
                  ? 'Ask about a grammar rule...'
                  : 'Enter a topic for a TOEIC question...'
              }
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
