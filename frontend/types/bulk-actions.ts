export type BulkActionType = 
  | 'DELETE'
  | 'EXPORT'
  | 'TAG'
  | 'UNTAG'
  | 'BOOKMARK'
  | 'UNBOOKMARK'
  | 'ADD_NOTE'
  | 'CATEGORIZE';

export interface BulkActionRequest {
  action: BulkActionType;
  transactionIds: string[];
  payload?: BulkActionPayload;
}

export interface BulkActionPayload {
  tags?: string[];
  note?: string;
  category?: TransactionCategory;
  exportOptions?: ExportOptions;
}

export interface BulkActionResponse {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: BulkActionError[];
  results?: any;
}

export interface BulkActionError {
  transactionId: string;
  error: string;
}