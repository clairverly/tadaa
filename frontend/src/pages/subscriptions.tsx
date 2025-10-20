import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, CreditCard, Sparkles, Bell } from 'lucide-react';

export default function Subscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Grocery Subscriptions</h1>
        <p className="text-gray-500 mt-1">Automate your regular grocery deliveries</p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <Badge className="mb-4 bg-purple-600">Coming Soon</Badge>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Grocery Subscriptions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Set up recurring grocery deliveries based on your purchase habits. Never run out of essentials again!
          </p>
          <Button disabled className="bg-purple-600">
            <Bell className="h-4 w-4 mr-2" />
            Notify Me When Available
          </Button>
        </CardContent>
      </Card>

      {/* Feature Preview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-2">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Smart Bundles</CardTitle>
            <CardDescription>
              Create custom grocery bundles based on your regular purchases
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-2">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Flexible Schedule</CardTitle>
            <CardDescription>
              Choose weekly, bi-weekly, or monthly delivery schedules
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-2">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>Auto-Payment</CardTitle>
            <CardDescription>
              Seamless automatic payments with your saved payment methods
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* How It Will Work */}
      <Card>
        <CardHeader>
          <CardTitle>How It Will Work</CardTitle>
          <CardDescription>Simple steps to automate your grocery shopping</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Analyze Your Habits</h4>
                <p className="text-sm text-gray-600">We'll review your purchase history to suggest items you buy regularly</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Create Your Bundle</h4>
                <p className="text-sm text-gray-600">Customize your subscription with the items you need most</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Set Schedule & Payment</h4>
                <p className="text-sm text-gray-600">Choose delivery frequency and set up automatic payments</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Relax & Receive</h4>
                <p className="text-sm text-gray-600">Your groceries arrive automatically on schedule</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}