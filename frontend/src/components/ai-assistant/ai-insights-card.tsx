import { AIInsight } from '@/lib/ai-insights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Bell, TrendingUp, AlertCircle, Lightbulb, Calendar, ArrowRight, DollarSign, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AIInsightsCardProps {
  insights: AIInsight[];
  onExportToCalendar?: () => void;
}

export function AIInsightsCard({ insights, onExportToCalendar }: AIInsightsCardProps) {
  const navigate = useNavigate();

  const getIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'reminder':
        return <Bell className="h-5 w-5" />;
      case 'pattern':
        return <TrendingUp className="h-5 w-5" />;
      case 'prediction':
        return <Sparkles className="h-5 w-5" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'savings':
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTypeColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'reminder':
        return 'text-blue-600 bg-blue-50';
      case 'pattern':
        return 'text-purple-600 bg-purple-50';
      case 'prediction':
        return 'text-indigo-600 bg-indigo-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      case 'tip':
        return 'text-green-600 bg-green-50';
      case 'trend':
        return 'text-amber-600 bg-amber-50';
      case 'savings':
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  if (insights.length === 0) {
    return (
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-sm text-gray-600">No urgent insights right now. I'll keep monitoring your bills.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total potential savings
  const totalSavings = insights
    .filter(i => i.savingsAmount)
    .reduce((sum, i) => sum + (i.savingsAmount || 0), 0);

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-900">AI Assistant</CardTitle>
              <CardDescription>Smart insights and recommendations</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalSavings > 0 && (
              <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                <DollarSign className="h-3 w-3 mr-1" />
                Save ${totalSavings.toFixed(0)}/mo
              </Badge>
            )}
            {onExportToCalendar && (
              <Button variant="outline" size="sm" onClick={onExportToCalendar}>
                <Calendar className="h-4 w-4 mr-2" />
                Export to Calendar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.slice(0, 5).map((insight) => (
          <div
            key={insight.id}
            className={cn(
              'p-4 rounded-lg border-2 transition-all hover:shadow-md',
              getPriorityColor(insight.priority)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', getTypeColor(insight.type))}>
                {getIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs capitalize">
                    {insight.type}
                  </Badge>
                  {insight.savingsAmount && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Save ${insight.savingsAmount.toFixed(0)}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                  {insight.naturalLanguage}
                </p>
                
                {insight.actionable && insight.actionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(insight.actionUrl!)}
                    className="h-7 text-xs -ml-2"
                  >
                    Take Action
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {insights.length > 5 && (
          <p className="text-xs text-center text-gray-500 pt-2">
            +{insights.length - 5} more insight{insights.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}