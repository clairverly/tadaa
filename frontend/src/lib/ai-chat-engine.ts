import {
  Bill,
  Errand,
  Appointment,
  ErrandCategory,
  ErrandPriority,
} from "@/types";
import { billStorage, errandStorage, appointmentStorage } from "./storage";
import { isOverdue, isUpcoming, formatDate, getDaysUntil } from "./utils/date";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string | { message: string; extraction?: any };
  timestamp: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  id: string;
  label: string;
  type: "navigate" | "execute" | "info";
  data?: any;
}

export interface ChatContext {
  bills: Bill[];
  errands: Errand[];
  appointments: Appointment[];
}

// Task creation state management
interface TaskCreationState {
  isCreating: boolean;
  type?: ErrandCategory;
  description?: string;
  priority?: ErrandPriority;
  preferredDate?: string;
}

let taskCreationState: TaskCreationState = {
  isCreating: false,
};

export function resetTaskCreation() {
  taskCreationState = { isCreating: false };
}

// Natural language understanding patterns
const patterns = {
  // Questions about bills
  billsOverdue: /overdue|late|past due|missed/i,
  billsUpcoming: /upcoming|due soon|next|coming up/i,
  billsTotal: /total|how much|spending|cost/i,
  billsSpecific: /bill.*(?:for|about|regarding)\s+(\w+)/i,

  // Questions about errands
  errandsActive: /errands?|tasks?|todo|to do/i,
  errandsGrocery: /grocery|groceries|shopping/i,

  // Questions about appointments
  appointmentsUpcoming: /appointments?|meetings?|schedule/i,

  // Actions
  addBill: /add.*bill|create.*bill|new bill/i,
  addErrand:
    /add.*errand|create.*errand|new errand|add.*task|create.*task|new task/i,
  addAppointment: /add.*appointment|schedule.*appointment|book.*appointment/i,
  markPaid: /mark.*paid|pay.*bill|paid.*bill/i,

  // General
  help: /help|what can you do|commands/i,
  summary: /summary|overview|status|dashboard/i,
};

export function generateAIResponse(
  userMessage: string,
  context: ChatContext
): ChatMessage {
  const message = userMessage.toLowerCase();
  const { bills, errands, appointments } = context;

  // Help command
  if (patterns.help.test(message)) {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: `I can help you with:

📋 **Bills**: Ask about overdue bills, upcoming payments, or total spending
🛒 **Errands**: Check active tasks or create new ones
📅 **Appointments**: View your schedule or book new appointments
➕ **Actions**: Add bills, errands, or appointments
💡 **Insights**: Get summaries and recommendations

Try asking: "What bills are due soon?" or "Add a new bill"`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View Bills",
          type: "navigate",
          data: "/bills",
        },
        {
          id: "action-2",
          label: "View Errands",
          type: "navigate",
          data: "/errands",
        },
        {
          id: "action-3",
          label: "View Appointments",
          type: "navigate",
          data: "/appointments",
        },
      ],
    };
  }

  // Dashboard summary
  if (patterns.summary.test(message)) {
    const overdueBills = bills.filter(
      (b) => isOverdue(b.dueDate) && b.status !== "paid"
    );
    const upcomingBills = bills.filter(
      (b) => isUpcoming(b.dueDate, 7) && b.status !== "paid"
    );
    const activeErrands = errands.filter((e) => e.status !== "done");
    const upcomingAppointments = appointments.filter((a) =>
      isUpcoming(a.date, 7)
    );

    let summary = `📊 **Your Dashboard Summary**\n\n`;

    if (overdueBills.length > 0) {
      summary += `⚠️ **${overdueBills.length} overdue bill${
        overdueBills.length > 1 ? "s" : ""
      }** requiring attention\n`;
    }

    if (upcomingBills.length > 0) {
      summary += `📋 **${upcomingBills.length} bill${
        upcomingBills.length > 1 ? "s" : ""
      }** due this week\n`;
    }

    if (activeErrands.length > 0) {
      summary += `🛒 **${activeErrands.length} active errand${
        activeErrands.length > 1 ? "s" : ""
      }**\n`;
    }

    if (upcomingAppointments.length > 0) {
      summary += `📅 **${upcomingAppointments.length} appointment${
        upcomingAppointments.length > 1 ? "s" : ""
      }** this week\n`;
    }

    if (
      overdueBills.length === 0 &&
      upcomingBills.length === 0 &&
      activeErrands.length === 0
    ) {
      summary += `✨ You're all caught up! Great job staying organized!`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: summary,
      timestamp: new Date().toISOString(),
      actions:
        overdueBills.length > 0
          ? [
              {
                id: "action-1",
                label: "View Overdue Bills",
                type: "navigate",
                data: "/bills",
              },
            ]
          : [],
    };
  }

  // Overdue bills
  if (patterns.billsOverdue.test(message)) {
    const overdueBills = bills.filter(
      (b) => isOverdue(b.dueDate) && b.status !== "paid"
    );

    if (overdueBills.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `✅ Great news! You don't have any overdue bills. You're all caught up!`,
        timestamp: new Date().toISOString(),
      };
    }

    let response = `⚠️ You have **${overdueBills.length} overdue bill${
      overdueBills.length > 1 ? "s" : ""
    }**:\n\n`;

    overdueBills.slice(0, 3).forEach((bill) => {
      const daysOverdue = Math.abs(getDaysUntil(bill.dueDate));
      response += `• **${bill.name}**: $${bill.amount.toFixed(
        2
      )} (${daysOverdue} days overdue)\n`;
    });

    if (overdueBills.length > 3) {
      response += `\n...and ${overdueBills.length - 3} more`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View All Bills",
          type: "navigate",
          data: "/bills",
        },
        { id: "action-2", label: "Pay Now", type: "navigate", data: "/bills" },
      ],
    };
  }

  // Upcoming bills
  if (patterns.billsUpcoming.test(message)) {
    const upcomingBills = bills.filter(
      (b) => isUpcoming(b.dueDate, 7) && b.status !== "paid"
    );

    if (upcomingBills.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `✨ No bills due in the next 7 days. You're ahead of schedule!`,
        timestamp: new Date().toISOString(),
      };
    }

    let response = `📋 You have **${upcomingBills.length} bill${
      upcomingBills.length > 1 ? "s" : ""
    }** due soon:\n\n`;

    upcomingBills.slice(0, 3).forEach((bill) => {
      const daysUntil = getDaysUntil(bill.dueDate);
      const dueText =
        daysUntil === 0
          ? "today"
          : daysUntil === 1
          ? "tomorrow"
          : `in ${daysUntil} days`;
      response += `• **${bill.name}**: $${bill.amount.toFixed(
        2
      )} (due ${dueText})\n`;
    });

    if (upcomingBills.length > 3) {
      response += `\n...and ${upcomingBills.length - 3} more`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View Bills",
          type: "navigate",
          data: "/bills",
        },
      ],
    };
  }

  // Total spending
  if (patterns.billsTotal.test(message)) {
    const monthlyBills = bills.filter(
      (b) => b.recurrence === "monthly" || b.recurrence === "as-billed"
    );
    const totalMonthly = monthlyBills.reduce(
      (sum, bill) => sum + bill.amount,
      0
    );

    const yearlyBills = bills.filter((b) => b.recurrence === "yearly");
    const totalYearly = yearlyBills.reduce((sum, bill) => sum + bill.amount, 0);

    let response = `💰 **Your Spending Overview**\n\n`;
    response += `📊 Monthly bills: **$${totalMonthly.toFixed(2)}**/month\n`;

    if (totalYearly > 0) {
      response += `📅 Annual bills: **$${totalYearly.toFixed(2)}**/year (${(
        totalYearly / 12
      ).toFixed(2)}/month)\n`;
      response += `\n💵 **Total average**: **$${(
        totalMonthly +
        totalYearly / 12
      ).toFixed(2)}**/month`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View Detailed Breakdown",
          type: "navigate",
          data: "/",
        },
      ],
    };
  }

  // Active errands
  if (patterns.errandsActive.test(message)) {
    const activeErrands = errands.filter((e) => e.status !== "done");

    if (activeErrands.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `✅ All errands completed! You're crushing it! 🎉`,
        timestamp: new Date().toISOString(),
        actions: [
          {
            id: "action-1",
            label: "Add New Errand",
            type: "navigate",
            data: "/errands",
          },
        ],
      };
    }

    let response = `🛒 You have **${activeErrands.length} active errand${
      activeErrands.length > 1 ? "s" : ""
    }**:\n\n`;

    activeErrands.slice(0, 3).forEach((errand) => {
      const statusEmoji = errand.status === "in-progress" ? "🔄" : "⏳";
      const priorityText = errand.priority === "urgent" ? " (URGENT)" : "";
      response += `${statusEmoji} **${errand.type.replace(
        "-",
        " "
      )}**${priorityText}\n`;
      response += `   ${errand.description.substring(0, 50)}...\n\n`;
    });

    if (activeErrands.length > 3) {
      response += `...and ${activeErrands.length - 3} more`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View All Errands",
          type: "navigate",
          data: "/errands",
        },
      ],
    };
  }

  // Upcoming appointments
  if (patterns.appointmentsUpcoming.test(message)) {
    const upcomingAppointments = appointments.filter((a) =>
      isUpcoming(a.date, 14)
    );

    if (upcomingAppointments.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `📅 Your schedule is clear for the next 2 weeks!`,
        timestamp: new Date().toISOString(),
        actions: [
          {
            id: "action-1",
            label: "Schedule Appointment",
            type: "navigate",
            data: "/appointments",
          },
        ],
      };
    }

    let response = `📅 You have **${upcomingAppointments.length} appointment${
      upcomingAppointments.length > 1 ? "s" : ""
    }** coming up:\n\n`;

    upcomingAppointments.slice(0, 3).forEach((apt) => {
      const daysUntil = getDaysUntil(apt.date);
      const whenText =
        daysUntil === 0
          ? "Today"
          : daysUntil === 1
          ? "Tomorrow"
          : formatDate(apt.date);
      response += `• **${apt.title}**\n`;
      response += `   ${whenText} at ${apt.time}\n\n`;
    });

    if (upcomingAppointments.length > 3) {
      response += `...and ${upcomingAppointments.length - 3} more`;
    }

    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "View Calendar",
          type: "navigate",
          data: "/appointments",
        },
      ],
    };
  }

  // Add bill
  if (patterns.addBill.test(message)) {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: `📋 I can help you add a new bill! Click the button below to get started, or you can scan a bill image for automatic data extraction.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "Add Bill Manually",
          type: "navigate",
          data: "/bills",
        },
        {
          id: "action-2",
          label: "Scan Bill",
          type: "navigate",
          data: "/bills",
        },
      ],
    };
  }

  // Add task/errand - Start conversational flow
  if (patterns.addErrand.test(message) && !taskCreationState.isCreating) {
    taskCreationState.isCreating = true;
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: `✨ I'll help you create a new task! Let's start with the basics.

What type of task is this? Please choose one:
• Home Maintenance
• Cleaning
• Gardening
• Groceries
• Delivery
• Pharmacy`,
      timestamp: new Date().toISOString(),
    };
  }

  // Handle task creation flow
  if (taskCreationState.isCreating) {
    // Step 1: Get task type
    if (!taskCreationState.type) {
      const typeMap: { [key: string]: ErrandCategory } = {
        "home maintenance": "home-maintenance",
        home: "home-maintenance",
        maintenance: "home-maintenance",
        cleaning: "cleaning",
        clean: "cleaning",
        gardening: "gardening",
        garden: "gardening",
        groceries: "groceries",
        grocery: "groceries",
        shopping: "groceries",
        delivery: "delivery",
        deliver: "delivery",
        pharmacy: "pharmacy",
        medicine: "pharmacy",
        medication: "pharmacy",
      };

      const matchedType = Object.keys(typeMap).find((key) =>
        message.includes(key.toLowerCase())
      );

      if (matchedType) {
        taskCreationState.type = typeMap[matchedType];
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Great! I've set the task type to **${taskCreationState.type.replace(
            "-",
            " "
          )}**.

Now, please describe what needs to be done. Be as specific as possible.`,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `I didn't quite catch that. Please choose one of these task types:
• Home Maintenance
• Cleaning
• Gardening
• Groceries
• Delivery
• Pharmacy`,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // Step 2: Get description
    if (!taskCreationState.description) {
      if (message.length < 5) {
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Please provide a more detailed description of the task. What exactly needs to be done?`,
          timestamp: new Date().toISOString(),
        };
      }

      taskCreationState.description = userMessage;
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Perfect! I've noted: "${taskCreationState.description}"

Is this task urgent or normal priority? (Type "urgent" or "normal")`,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 3: Get priority
    if (!taskCreationState.priority) {
      if (message.includes("urgent")) {
        taskCreationState.priority = "urgent";
      } else if (message.includes("normal")) {
        taskCreationState.priority = "normal";
      } else {
        return {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `Please specify if this is "urgent" or "normal" priority.`,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Got it! Priority set to **${taskCreationState.priority}**.

When would you prefer this to be completed? You can provide a date (e.g., "tomorrow", "next Monday", "2024-12-25") or type "anytime" if there's no specific deadline.`,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 4: Get preferred date (optional) and create task
    if (taskCreationState.priority) {
      let preferredDate = "";

      if (
        !message.includes("anytime") &&
        !message.includes("no date") &&
        !message.includes("skip")
      ) {
        // Try to parse date from message
        const today = new Date();
        if (message.includes("today")) {
          preferredDate = today.toISOString();
        } else if (message.includes("tomorrow")) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          preferredDate = tomorrow.toISOString();
        } else if (message.match(/\d{4}-\d{2}-\d{2}/)) {
          const dateMatch = message.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) {
            preferredDate = new Date(dateMatch[0]).toISOString();
          }
        }
      }

      // Create the task
      const newTask: Errand = {
        id: `errand-${Date.now()}`,
        type: taskCreationState.type!,
        description: taskCreationState.description!,
        priority: taskCreationState.priority!,
        status: "pending",
        preferredDate: preferredDate,
        adminNotes: "",
        reminderEnabled: false,
        reminderHours: 24,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      errandStorage.add(newTask);

      const response: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant" as const,
        content: `✅ **Task created successfully!**

📋 **Summary:**
• Type: ${newTask.type.replace("-", " ")}
• Description: ${newTask.description}
• Priority: ${newTask.priority}
• Preferred Date: ${preferredDate ? formatDate(preferredDate) : "Anytime"}

Your task has been added and is now pending. You can view it in the Tasks page.`,
        timestamp: new Date().toISOString(),
        actions: [
          {
            id: "action-1",
            label: "View Tasks",
            type: "navigate",
            data: "/errands",
          },
          { id: "action-2", label: "Create Another Task", type: "info" },
        ],
      };

      // Reset state
      resetTaskCreation();

      return response;
    }
  }

  // Add appointment
  if (patterns.addAppointment.test(message)) {
    return {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: `📅 I'll help you schedule an appointment. Click below to add the details.`,
      timestamp: new Date().toISOString(),
      actions: [
        {
          id: "action-1",
          label: "Schedule Appointment",
          type: "navigate",
          data: "/appointments",
        },
      ],
    };
  }

  // Default response with suggestions
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content: `I'm here to help! Here are some things you can ask me:

• "What bills are overdue?"
• "Show me upcoming bills"
• "How much am I spending?"
• "What errands do I have?"
• "Show my appointments"
• "Add a new bill"

Or just ask me anything about your bills, errands, or appointments!`,
    timestamp: new Date().toISOString(),
    actions: [
      { id: "action-1", label: "View Dashboard", type: "navigate", data: "/" },
    ],
  };
}

// Quick suggestions based on context
export function generateQuickSuggestions(context: ChatContext): string[] {
  const { bills, errands, appointments } = context;
  const suggestions: string[] = [];

  const overdueBills = bills.filter(
    (b) => isOverdue(b.dueDate) && b.status !== "paid"
  );
  const upcomingBills = bills.filter(
    (b) => isUpcoming(b.dueDate, 7) && b.status !== "paid"
  );
  const activeErrands = errands.filter((e) => e.status !== "done");
  const upcomingAppointments = appointments.filter((a) =>
    isUpcoming(a.date, 7)
  );

  if (overdueBills.length > 0) {
    suggestions.push("Show overdue bills");
  }

  if (upcomingBills.length > 0) {
    suggestions.push("What bills are due soon?");
  }

  if (activeErrands.length > 0) {
    suggestions.push("Show my errands");
  }

  if (upcomingAppointments.length > 0) {
    suggestions.push("What appointments do I have?");
  }

  suggestions.push("Show me a summary");
  suggestions.push("How much am I spending?");

  return suggestions.slice(0, 4);
}
