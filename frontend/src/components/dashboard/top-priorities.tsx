import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SmartPriority } from '@/lib/ai-dashboard';
import { AlertCircle, ArrowRight, FileText, ShoppingBag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopPrioritiesProps {
  priorities: SmartPriority[];
}

export function TopPrioritiesWidget({ priorities }: TopPrioritiesProps) {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return <FileText className="h-5 w-5" />;
      case 'errand':
        return <ShoppingBag className="h-5 w-5" />;
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  if (priorities.length === 0) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <AlertCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No urgent tasks right now. Enjoy your day! 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <AlertCircle className="h-6 w-6 text-blue-600" />
          Top 3 for Today
        </CardTitle>
        <p className="text-sm text-gray-600">AI-prioritized tasks that need your attention</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {priorities.map((priority, index) => (
          <div
            key={priority.id}
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
            onClick={() => navigate(priority.actionUrl)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    {getIcon(priority.type)}
                  </div>
                  <h4 className="font-semibold text-gray-900 truncate">{priority.title}</h4>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getUrgencyColor(priority.urgencyScore)}>
                    {priority.urgencyScore >= 80 ? 'Critical' : 
                     priority.urgencyScore >= 60 ? 'High' : 
                     priority.urgencyScore >= 40 ? 'Medium' : 'Normal'}
                  </Badge>
                  <span className="text-sm text-gray-600">{priority.reason}</span>
                </div>
              </div>

              <Button variant="ghost" size="sm" className="flex-shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}