import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PredictiveSuggestion } from '@/lib/ai-dashboard';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PredictiveSuggestionsProps {
  suggestions: PredictiveSuggestion[];
}

export function PredictiveSuggestionsWidget({ suggestions }: PredictiveSuggestionsProps) {
  const navigate = useNavigate();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <Lightbulb className="h-6 w-6 text-amber-600" />
          Smart Suggestions
        </CardTitle>
        <p className="text-sm text-gray-600">AI-powered recommendations based on your patterns</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-amber-200"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(suggestion.confidence * 100)}% match
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(suggestion.actionUrl)}
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                >
                  {suggestion.actionText}
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}