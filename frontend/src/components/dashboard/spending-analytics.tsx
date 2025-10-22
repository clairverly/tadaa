import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SpendingAnalytics as SpendingAnalyticsType } from '@/hooks/use-dashboard-data';

interface SpendingAnalyticsProps {
  analytics: SpendingAnalyticsType;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    utilities: '⚡',
    'telco-internet': '📡',
    insurance: '🛡️',
    subscriptions: '▶️',
    'credit-loans': '💳',
    general: '💰',
  };
  return icons[category] || '💰';
};

const getTrendIcon = (trend: string) => {
  if (trend === 'increasing') return <ArrowUpRight className="h-4 w-4 text-red-600" />;
  if (trend === 'decreasing') return <ArrowDownRight className="h-4 w-4 text-green-600" />;
  return <Minus className="h-4 w-4 text-gray-600" />;
};

const getTrendColor = (trend: string) => {
  if (trend === 'increasing') return 'text-red-600';
  if (trend === 'decreasing') return 'text-green-600';
  return 'text-gray-600';
};

export function SpendingAnalytics({ analytics }: SpendingAnalyticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Spending Overview */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            Monthly Spending
          </CardTitle>
          <CardDescription>Your average monthly expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ${analytics.totalMonthly.toFixed(0)}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.trend)}
                <span className={`text-sm font-medium ${getTrendColor(analytics.trend)}`}>
                  {Math.abs(analytics.monthOverMonth).toFixed(1)}% vs last month
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Top Categories:</p>
              <div className="space-y-3">
                {analytics.topCategories.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>{getCategoryIcon(cat.category)}</span>
                        {cat.category.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${cat.amount.toFixed(0)}
                      </span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {analytics.totalYearly > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Annual bills (prorated)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(analytics.totalYearly / 12).toFixed(0)}/mo
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Total yearly: ${analytics.totalYearly.toFixed(0)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Spending Insights
          </CardTitle>
          <CardDescription>AI-powered analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.trend === 'increasing' && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 text-sm">
                  <strong>Spending Increase Detected:</strong> Your bills have increased by {Math.abs(analytics.monthOverMonth).toFixed(1)}% compared to last month. Review your bills to identify the cause.
                </AlertDescription>
              </Alert>
            )}

            {analytics.trend === 'decreasing' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Great News!</strong> Your spending decreased by {Math.abs(analytics.monthOverMonth).toFixed(1)}% compared to last month. Keep up the good work!
                </AlertDescription>
              </Alert>
            )}

            {analytics.trend === 'stable' && (
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Stable Spending:</strong> Your bills are consistent with last month. Your budget is on track!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-sm text-gray-700">Category Breakdown:</h4>
              {analytics.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(cat.category)}</span>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {cat.category.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${cat.amount.toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat.percentage.toFixed(0)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}