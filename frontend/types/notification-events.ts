export interface NotificationEvent {
    id: string;
    notificationId: string;
    eventType: NotificationEventType;
    userAddress: string;
    timestamp: string;
    metadata: Record<string, any>;
  }
  
  export type NotificationEventType =
    | 'CREATED'
    | 'SENT'
    | 'DELIVERED'
    | 'READ'
    | 'CLICKED'
    | 'ARCHIVED'
    | 'DELETED'
    | 'FAILED'
    | 'RETRIED'
    | 'EXPIRED';
  
  export interface NotificationAction {
    actionId: string;
    label: string;
    url?: string;
    handler?: string; // Function name to call
    data?: Record<string, any>;
    style?: 'primary' | 'secondary' | 'destructive';
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
  }