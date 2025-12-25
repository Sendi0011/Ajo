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
  
    // Check for upcoming payments and send reminders
    private async checkReminders() {
      try {
        // Get reminder preferences
        const prefsStr = localStorage.getItem('reminder-preferences')
        if (!prefsStr) return
  
        const prefs: ReminderPreferences = JSON.parse(prefsStr)
        if (!prefs.enabled) return
  
        // Get user address
        const address = localStorage.getItem('user-address')
        if (!address) return
  
        // Fetch upcoming payments
        const response = await fetch(`/api/calendar/payments?userAddress=${address}`)
        if (!response.ok) return
  
        const payments = await response.json()
  
        // Check each payment
        payments.forEach((payment: any) => {
          if (payment.hasPaid) return // Skip if already paid
  
          const now = new Date().getTime()
          const dueTime = new Date(payment.dueDate).getTime()
          const timeUntilDue = dueTime - now
  
          // Convert to hours
          const hoursUntilDue = timeUntilDue / (1000 * 60 * 60)
  
          // Check if we should send a reminder
          let shouldRemind = false
          let reminderMessage = ''
  
          if (prefs.threeDaysBefore && hoursUntilDue <= 72 && hoursUntilDue > 71) {
            shouldRemind = true
            reminderMessage = `Payment due in 3 days: ${payment.poolName}`
          } else if (prefs.oneDayBefore && hoursUntilDue <= 24 && hoursUntilDue > 23) {
            shouldRemind = true
            reminderMessage = `Payment due tomorrow: ${payment.poolName}`
          } else if (prefs.twoHoursBefore && hoursUntilDue <= 2 && hoursUntilDue > 1.9) {
            shouldRemind = true
            reminderMessage = `⚠️ Payment due in 2 hours: ${payment.poolName}`
          } else if (prefs.thirtyMinsBefore && hoursUntilDue <= 0.5 && hoursUntilDue > 0.4) {
            shouldRemind = true
            reminderMessage = `🚨 URGENT: Payment due in 30 minutes: ${payment.poolName}`
          }
  
          if (shouldRemind) {
            this.sendReminder(payment, reminderMessage, prefs)
          }
        })
      } catch (error) {
        console.error('Reminder check failed:', error)
      }
    }
  
    
  }