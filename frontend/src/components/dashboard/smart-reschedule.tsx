import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartReschedule } from '@/lib/ai-dashboard';
import { Calendar, CheckCircle, X } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { showSuccess } from '@/utils/toast';

interface SmartRescheduleProps {
  suggestions: SmartReschedule[];
  onReschedule: (suggestion: SmartReschedule) => void;
  onDismiss: (suggestionId: string) => void;
}

export function SmartRescheduleWidget({ suggestions, onReschedule, onDismiss }: SmartRescheduleProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Calendar className="h-6 w-6 text-orange-600" />
          Smart Reschedule
        </CardTitle>
        <p className="text-sm text-gray-600">Missed deadlines? Let's get back on track!</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 bg-white rounded-xl shadow-sm border-2 border-orange-100"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Original: {formatDate(suggestion.originalDate)}</span>
                  <span>→</span>
                  <span className="font-medium text-orange-600">
                    New: {formatDate(suggestion.suggestedDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onReschedule(suggestion);
                  showSuccess('Task rescheduled successfully!');
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDismiss(suggestion.id)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}