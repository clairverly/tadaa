import { Bill } from '@/types';
import { generateCalendarEvents } from './ai-insights';

// Generate iCalendar (.ics) format
export function generateICalendarFile(bills: Bill[]): string {
  const events = generateCalendarEvents(bills);
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tadaa//Bill Payment Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tadaa Bill Payments',
    'X-WR-TIMEZONE:UTC',
  ];

  events.forEach((event, index) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    // Format dates as YYYYMMDDTHHMMSSZ
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:tadaa-bill-${index}-${Date.now()}@tadaa.app`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      // Add reminder alarm
      'BEGIN:VALARM',
      'TRIGGER:-PT24H', // 24 hours before
      'ACTION:DISPLAY',
      `DESCRIPTION:${event.title}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  
  return icsContent.join('\r\n');
}

// Download calendar file
export function downloadCalendarFile(bills: Bill[]): void {
  const icsContent = generateICalendarFile(bills);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tadaa-bill-payments.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(bill: Bill): string {
  const startDate = new Date(bill.dueDate);
  const endDate = new Date(bill.dueDate);
  
  // Format: YYYYMMDDTHHmmssZ
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${bill.name} Payment Due`,
    details: `Payment of $${bill.amount.toFixed(2)} for ${bill.name}. ${bill.autoPayEnabled ? 'Auto-pay enabled.' : 'Manual payment required.'}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    location: 'Online Payment',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Generate Outlook Calendar URL
export function generateOutlookCalendarUrl(bill: Bill): string {
  const startDate = new Date(bill.dueDate);
  const endDate = new Date(bill.dueDate);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `${bill.name} Payment Due`,
    body: `Payment of $${bill.amount.toFixed(2)} for ${bill.name}. ${bill.autoPayEnabled ? 'Auto-pay enabled.' : 'Manual payment required.'}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    location: 'Online Payment',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

// Export all bills to calendar
export function exportAllBillsToCalendar(bills: Bill[]): void {
  downloadCalendarFile(bills);
}