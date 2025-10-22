import { HeroSection } from '@/components/dashboard/hero-section';
import { TadaaSnapshotWidget } from '@/components/dashboard/tadaa-snapshot';
import { TopPrioritiesWidget } from '@/components/dashboard/top-priorities';
import { PredictiveSuggestionsWidget } from '@/components/dashboard/predictive-suggestions';
import { SmartRescheduleWidget } from '@/components/dashboard/smart-reschedule';
import { UrgentNotifications } from '@/components/dashboard/urgent-notifications';
import { SpendingAnalytics } from '@/components/dashboard/spending-analytics';
import { OverdueBillsAlert } from '@/components/dashboard/overdue-bills-alert';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AIInsightsCard } from '@/components/ai-assistant/ai-insights-card';
import { AIChatWidget } from '@/components/ai-chat/ai-chat-widget';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { isOverdue, isUpcoming } from '@/lib/utils/date';
import { exportAllBillsToCalendar } from '@/lib/calendar-integration';
import { showSuccess } from '@/utils/toast';

export default function Dashboard() {
  const {
    bills,
    errands,
    appointments,
    notifications,
    aiInsights,
    spendingAnalytics,
    topPriorities,
    predictiveSuggestions,
    tadaaSnapshot,
    rescheduleSuggestions,
    handleReschedule,
    handleDismissReschedule,
    reloadData,
  } = useDashboardData();

  const handleExportToCalendar = () => {
    exportAllBillsToCalendar(bills);
    showSuccess('Calendar file downloaded! Import it to your calendar app.');
  };

  // Derived data
  const upcomingBills = bills.filter(b => b.status === 'upcoming' && isUpcoming(b.dueDate, 30));
  const overdueBills = bills.filter(b => isOverdue(b.dueDate) && b.status !== 'paid');
  const activeErrands = errands.filter(e => e.status !== 'done');
  const upcomingAppointments = appointments.filter(a => isUpcoming(a.date, 14));

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <HeroSection />

      {/* AI-Powered Widgets Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {tadaaSnapshot && <TadaaSnapshotWidget snapshot={tadaaSnapshot} />}
        <TopPrioritiesWidget priorities={topPriorities} />
      </div>

      {/* Smart Reschedule Suggestions */}
      {rescheduleSuggestions.length > 0 && (
        <SmartRescheduleWidget
          suggestions={rescheduleSuggestions}
          onReschedule={handleReschedule}
          onDismiss={handleDismissReschedule}
        />
      )}

      {/* Predictive Suggestions */}
      {predictiveSuggestions.length > 0 && (
        <PredictiveSuggestionsWidget suggestions={predictiveSuggestions} />
      )}

      {/* Urgent Notifications */}
      <UrgentNotifications notifications={notifications} onReload={reloadData} />

      {/* Spending Analytics */}
      {spendingAnalytics && <SpendingAnalytics analytics={spendingAnalytics} />}

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <AIInsightsCard 
          insights={aiInsights} 
          onExportToCalendar={handleExportToCalendar}
        />
      )}

      {/* Overdue Bills Alert */}
      <OverdueBillsAlert bills={overdueBills} />

      {/* Quick Actions */}
      <QuickActions
        upcomingBills={upcomingBills}
        activeErrands={activeErrands}
        upcomingAppointments={upcomingAppointments}
      />

      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}