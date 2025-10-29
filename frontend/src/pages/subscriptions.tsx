import { Sparkles } from 'lucide-react';

export default function Subscriptions() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Coming Soon</h1>
        <p className="text-lg text-gray-600">
          We're working on something exciting. Stay tuned!
        </p>
      </div>
    </div>
  );
}