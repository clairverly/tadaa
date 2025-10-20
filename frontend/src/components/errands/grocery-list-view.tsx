import { useState } from 'react';
import { GroceryItem, PurchaseTrend } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, TrendingUp, Sparkles, CreditCard } from 'lucide-react';
import { analyzePurchaseTrends, getMockPurchaseHistory } from '@/lib/grocery-scanner';
import { showSuccess } from '@/utils/toast';

interface GroceryListViewProps {
  items: GroceryItem[];
  onItemToggle: (itemId: string) => void;
  onCheckout: () => void;
}

export function GroceryListView({ items, onItemToggle, onCheckout }: GroceryListViewProps) {
  const [showTrends, setShowTrends] = useState(true);
  const purchaseHistory = getMockPurchaseHistory();
  const trends = analyzePurchaseTrends(purchaseHistory);

  const totalCost = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const purchasedCount = items.filter(item => item.purchased).length;

  const handleQuickCheckout = () => {
    showSuccess('Payment processed successfully! Your groceries will be delivered soon.');
    onCheckout();
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {showTrends && trends.suggestions.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Sparkles className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
            <CardDescription>Based on your purchase history</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {trends.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                <p className="text-sm text-gray-700">{suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grocery List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Grocery List
              </CardTitle>
              <CardDescription>
                {purchasedCount} of {items.length} items checked
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Estimated total</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  checked={item.purchased}
                  onCheckedChange={() => onItemToggle(item.id)}
                />
                <div className="flex-1">
                  <p className={`font-medium ${item.purchased ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${item.estimatedPrice.toFixed(2)}</p>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* One-Click Checkout */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Ready to checkout?</h3>
              <p className="text-sm text-gray-600">One-click payment with your default method</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700">${totalCost.toFixed(2)}</p>
            </div>
          </div>
          <Button
            onClick={handleQuickCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Pay Now & Schedule Delivery
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Demo: This simulates payment processing
          </p>
        </CardContent>
      </Card>

      {/* Frequent Items */}
      {trends.frequentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Frequent Purchases
            </CardTitle>
            <CardDescription>Items you buy regularly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trends.frequentItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{item.itemName}</span>
                  <Badge variant="secondary">
                    {item.frequency}x per month
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}