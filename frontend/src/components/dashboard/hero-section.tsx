import { Sparkles, FileText, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-10 right-20 w-32 h-32 border-4 border-white/20 rounded-full"></div>
      <div className="absolute bottom-10 right-40 w-20 h-20 border-4 border-white/10 rounded-full"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-medium opacity-90">Welcome back!</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-blue-100 text-lg">Everything you need to stay organized and on track</p>
        </div>
        
        {/* Hero Illustration */}
        <div className="hidden lg:block">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-center h-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-6 hover:rotate-12 transition-transform">
                  <FileText className="h-12 w-12" />
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform -rotate-6 hover:-rotate-12 transition-transform">
                  <ShoppingBag className="h-12 w-12" />
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform -rotate-3 hover:-rotate-6 transition-transform">
                  <Calendar className="h-12 w-12" />
                </div>
                <div className="w-24 h-24 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}