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
      let response;
      if (activeTab === 'vocabulary') {
        response = await fetch('/api/ai/explain-vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: input }),
        });
      } else if (activeTab === 'grammar') {
        response = await fetch('/api/ai/explain-grammar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input, userAnswer: 'A' }),
        });
      } else {
        response = await fetch('/api/ai/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: input, difficulty: 'medium' }),
        });
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.data?.explanation || data.data?.question || 'Sorry, I could not process your request.',
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
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'vocabulary' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('vocabulary')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Vocabulary
          </Button>
          <Button
            variant={activeTab === 'grammar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('grammar')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Grammar
          </Button>
          <Button
            variant={activeTab === 'question' ? 'default' : 'outline'}
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
                  {activeTab === 'vocabulary' && 'Ask about any vocabulary word'}
                  {activeTab === 'grammar' && 'Ask about grammar rules'}
                  {activeTab === 'question' && 'Request a TOEIC question on any topic'}
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
