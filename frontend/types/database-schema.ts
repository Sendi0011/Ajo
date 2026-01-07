export interface DatabaseTransaction {
    id: string;
    pool_id: string;
    user_address: string;
    transaction_type: string;
    transaction_status: string;
    transaction_category: string;
    amount: string;
    amount_usd: string | null;
    currency: string;
    token_address: string;
    tx_hash: string;
    block_number: number | null;
    gas_used: string | null;
    gas_fee: string | null;
    timestamp: string;
    confirmed_at: string | null;
    description: string | null;
    metadata: Record<string, any>;
    receipt_url: string | null;
    tags: string[];
    notes: string | null;
    is_bookmarked: boolean;
    created_at: string;
    updated_at: string;
  }
  
  export interface TransactionTag {
    id: string;
    transaction_id: string;
    tag: string;
    added_by: string;
    added_at: string;
  }
  
  export interface TransactionNote {
    id: string;
    transaction_id: string;
    note: string;
    added_by: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface TransactionBookmark {
    id: string;
    transaction_id: string;
    user_address: string;
    bookmarked_at: string;
  }
  