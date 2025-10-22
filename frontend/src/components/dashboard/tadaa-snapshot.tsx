import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TadaaSnapshot } from '@/lib/ai-dashboard';
import { Sparkles, TrendingUp, Target, Flame } from 'lucide-react';

interface TadaaSnapshotProps {
  snapshot: TadaaSnapshot;
}

export function TadaaSnapshotWidget({ snapshot }: TadaaSnapshotProps) {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Tadaa Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Motivational Message */}
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <p className="text-lg font-semibold text-gray-900">
            {snapshot.motivationalMessage}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className="text-2xl font-bold text-purple-600">{snapshot.completionRate}%</span>
          </div>
          <Progress value={snapshot.completionRate} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{snapshot.tasksCompleted}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{snapshot.tasksRemaining}</p>
          </div>

          <div className="p-3 bg-white rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Streak</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{snapshot.streak} days</p>
          </div>

          <div className="p-3 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{snapshot.upcomingDeadlines}</p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              {snapshot.weeklyProgress}%
            </Badge>
          </div>
          <Progress value={snapshot.weeklyProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}