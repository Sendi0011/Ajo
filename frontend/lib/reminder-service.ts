// lib/reminder-service.ts
// This service checks for upcoming payments and sends reminders

interface ReminderPreferences {
    enabled: boolean
    threeDaysBefore: boolean
    oneDayBefore: boolean
    twoHoursBefore: boolean
    thirtyMinsBefore: boolean
    balanceCheck: boolean
    browserNotifications: boolean
  }
  
  export class ReminderService {
    private checkInterval: NodeJS.Timeout | null = null
  
    // Start the reminder service
    start() {
      if (this.checkInterval) return // Already running
  
      // Check every 5 minutes
      this.checkInterval = setInterval(() => {
        this.checkReminders()
      }, 5 * 60 * 1000)
  
      // Check immediately on start
      this.checkReminders()
    }
  
    // Stop the reminder service
    stop() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval)
        this.checkInterval = null
      }
    }
  
    