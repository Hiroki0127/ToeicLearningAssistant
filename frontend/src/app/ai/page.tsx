import Layout from '@/components/layout/Layout';
import AIChat from '@/components/ai/AIChat';

export default function AIPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              AI Study Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Get instant help with vocabulary, grammar, and practice questions
            </p>
          </div>
          
          <AIChat />
        </div>
      </div>
    </Layout>
  );
}
