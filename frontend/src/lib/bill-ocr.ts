import { BillCategory, BillRecurrence } from '@/types';

export interface ScannedBillData {
  name: string;
  amount: number;
  dueDate: string;
  category: BillCategory;
  recurrence: BillRecurrence;
  confidence: number;
}

// Mock bill templates for different types
const mockBillTemplates = [
  {
    name: 'Pacific Gas & Electric',
    amount: 127.45,
    category: 'utilities' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['electricity', 'gas', 'utility', 'power', 'energy'],
  },
  {
    name: 'City Water Department',
    amount: 68.90,
    category: 'utilities' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['water', 'sewer', 'utility'],
  },
  {
    name: 'Comcast Internet',
    amount: 89.99,
    category: 'subscription' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['internet', 'cable', 'broadband', 'wifi'],
  },
  {
    name: 'State Farm Insurance',
    amount: 156.00,
    category: 'insurance' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['insurance', 'premium', 'policy'],
  },
  {
    name: 'Apartment Rent',
    amount: 1850.00,
    category: 'rent' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['rent', 'lease', 'apartment', 'housing'],
  },
  {
    name: 'Netflix Subscription',
    amount: 15.99,
    category: 'subscription' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['netflix', 'streaming', 'subscription'],
  },
  {
    name: 'Visa Credit Card',
    amount: 342.67,
    category: 'credit-card' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['credit card', 'visa', 'mastercard', 'amex', 'payment due'],
  },
  {
    name: 'Annual Car Registration',
    amount: 245.00,
    category: 'other' as BillCategory,
    recurrence: 'yearly' as BillRecurrence,
    keywords: ['registration', 'annual', 'dmv', 'vehicle'],
  },
  {
    name: 'Gym Membership',
    amount: 49.99,
    category: 'subscription' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['gym', 'fitness', 'membership'],
  },
  {
    name: 'Phone Bill',
    amount: 75.00,
    category: 'utilities' as BillCategory,
    recurrence: 'monthly' as BillRecurrence,
    keywords: ['phone', 'mobile', 'cellular', 'wireless'],
  },
];

function detectRecurrenceFromText(text: string): BillRecurrence {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('monthly') || lowerText.includes('per month') || lowerText.includes('/mo')) {
    return 'monthly';
  }
  if (lowerText.includes('weekly') || lowerText.includes('per week') || lowerText.includes('/wk')) {
    return 'weekly';
  }
  if (lowerText.includes('annual') || lowerText.includes('yearly') || lowerText.includes('per year') || lowerText.includes('/yr')) {
    return 'yearly';
  }
  if (lowerText.includes('one-time') || lowerText.includes('single payment') || lowerText.includes('one time')) {
    return 'one-time';
  }
  
  // Default to monthly for most bills
  return 'monthly';
}

function generateDueDate(): string {
  const today = new Date();
  const daysToAdd = Math.floor(Math.random() * 30) + 1; // 1-30 days from now
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  return dueDate.toISOString().split('T')[0];
}

export function simulateBillScan(imageFile: File): Promise<ScannedBillData> {
  return new Promise((resolve) => {
    // Simulate OCR processing time
    setTimeout(() => {
      // Randomly select a bill template
      const template = mockBillTemplates[Math.floor(Math.random() * mockBillTemplates.length)];
      
      // Add some variation to the amount
      const amountVariation = (Math.random() - 0.5) * 20; // +/- $10
      const amount = Math.max(1, template.amount + amountVariation);
      
      const scannedData: ScannedBillData = {
        name: template.name,
        amount: parseFloat(amount.toFixed(2)),
        dueDate: generateDueDate(),
        category: template.category,
        recurrence: template.recurrence,
        confidence: 0.85 + Math.random() * 0.14, // 85-99% confidence
      };
      
      resolve(scannedData);
    }, 2000); // 2 second processing time
  });
}

export function extractBillInfo(text: string): Partial<ScannedBillData> {
  // This would use real OCR in production
  // For demo, we'll return mock data based on keywords
  const lowerText = text.toLowerCase();
  
  // Find matching template based on keywords
  const matchedTemplate = mockBillTemplates.find(template =>
    template.keywords.some(keyword => lowerText.includes(keyword))
  );
  
  if (matchedTemplate) {
    return {
      name: matchedTemplate.name,
      amount: matchedTemplate.amount,
      category: matchedTemplate.category,
      recurrence: detectRecurrenceFromText(text),
      confidence: 0.92,
    };
  }
  
  // Default fallback
  return {
    name: 'Scanned Bill',
    amount: 0,
    category: 'other',
    recurrence: 'monthly',
    confidence: 0.65,
  };
}

export function getBillCategoryFromName(name: string): BillCategory {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('electric') || lowerName.includes('gas') || lowerName.includes('water') || 
      lowerName.includes('utility') || lowerName.includes('phone') || lowerName.includes('internet')) {
    return 'utilities';
  }
  if (lowerName.includes('rent') || lowerName.includes('lease') || lowerName.includes('apartment')) {
    return 'rent';
  }
  if (lowerName.includes('insurance') || lowerName.includes('policy') || lowerName.includes('premium')) {
    return 'insurance';
  }
  if (lowerName.includes('credit card') || lowerName.includes('visa') || lowerName.includes('mastercard') || 
      lowerName.includes('amex') || lowerName.includes('discover')) {
    return 'credit-card';
  }
  if (lowerName.includes('subscription') || lowerName.includes('netflix') || lowerName.includes('spotify') || 
      lowerName.includes('gym') || lowerName.includes('membership')) {
    return 'subscription';
  }
  
  return 'other';
}