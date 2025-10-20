import { GroceryItem, PurchaseTrend } from '@/types';

// Mock OCR results for different types of grocery lists
const mockGroceryLists = [
  [
    { name: 'Milk', quantity: 2, unit: 'liters', category: 'Dairy', estimatedPrice: 5.98 },
    { name: 'Bread', quantity: 1, unit: 'loaf', category: 'Bakery', estimatedPrice: 2.99 },
    { name: 'Eggs', quantity: 12, unit: 'pieces', category: 'Dairy', estimatedPrice: 4.50 },
    { name: 'Chicken Breast', quantity: 1, unit: 'kg', category: 'Meat', estimatedPrice: 12.99 },
    { name: 'Tomatoes', quantity: 500, unit: 'grams', category: 'Produce', estimatedPrice: 3.50 },
    { name: 'Lettuce', quantity: 1, unit: 'head', category: 'Produce', estimatedPrice: 2.50 },
  ],
  [
    { name: 'Rice', quantity: 5, unit: 'kg', category: 'Grains', estimatedPrice: 15.99 },
    { name: 'Pasta', quantity: 500, unit: 'grams', category: 'Grains', estimatedPrice: 3.99 },
    { name: 'Olive Oil', quantity: 1, unit: 'liter', category: 'Oils', estimatedPrice: 12.99 },
    { name: 'Onions', quantity: 1, unit: 'kg', category: 'Produce', estimatedPrice: 2.99 },
    { name: 'Garlic', quantity: 200, unit: 'grams', category: 'Produce', estimatedPrice: 1.99 },
  ],
  [
    { name: 'Apples', quantity: 6, unit: 'pieces', category: 'Produce', estimatedPrice: 4.50 },
    { name: 'Bananas', quantity: 1, unit: 'bunch', category: 'Produce', estimatedPrice: 2.99 },
    { name: 'Yogurt', quantity: 4, unit: 'cups', category: 'Dairy', estimatedPrice: 5.96 },
    { name: 'Cheese', quantity: 250, unit: 'grams', category: 'Dairy', estimatedPrice: 6.99 },
    { name: 'Orange Juice', quantity: 1, unit: 'liter', category: 'Beverages', estimatedPrice: 4.99 },
  ],
];

export function simulateImageScan(imageFile: File): Promise<GroceryItem[]> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      const randomList = mockGroceryLists[Math.floor(Math.random() * mockGroceryLists.length)];
      const items = randomList.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        purchased: false,
      }));
      resolve(items);
    }, 1500);
  });
}

export function analyzePurchaseTrends(purchaseHistory: PurchaseTrend[]): {
  suggestions: string[];
  frequentItems: PurchaseTrend[];
  upcomingNeeds: string[];
} {
  const now = new Date();
  const frequentItems = purchaseHistory
    .filter(item => item.frequency >= 2)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const upcomingNeeds: string[] = [];
  purchaseHistory.forEach(item => {
    const lastPurchase = new Date(item.lastPurchased);
    const daysSince = Math.floor((now.getTime() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDays = 30 / item.frequency;
    
    if (daysSince >= expectedDays * 0.8) {
      upcomingNeeds.push(item.itemName);
    }
  });

  const suggestions = [
    `You typically buy ${frequentItems[0]?.itemName || 'milk'} every ${Math.floor(30 / (frequentItems[0]?.frequency || 4))} days`,
    `Based on your habits, you might need ${upcomingNeeds[0] || 'eggs'} soon`,
    `You often purchase ${frequentItems[1]?.itemName || 'bread'} - add to your list?`,
  ];

  return { suggestions, frequentItems, upcomingNeeds };
}

export function getMockPurchaseHistory(): PurchaseTrend[] {
  return [
    { itemName: 'Milk', frequency: 4, lastPurchased: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), averageQuantity: 2, category: 'Dairy' },
    { itemName: 'Bread', frequency: 3, lastPurchased: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), averageQuantity: 1, category: 'Bakery' },
    { itemName: 'Eggs', frequency: 2, lastPurchased: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), averageQuantity: 12, category: 'Dairy' },
    { itemName: 'Chicken', frequency: 2, lastPurchased: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), averageQuantity: 1, category: 'Meat' },
    { itemName: 'Rice', frequency: 1, lastPurchased: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), averageQuantity: 5, category: 'Grains' },
  ];
}