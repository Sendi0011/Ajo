export interface Receipt {
    id: string;
    transactionId: string;
    transaction: Transaction;
    receiptNumber: string;
    generatedAt: string;
    format: 'PDF' | 'IMAGE';
    url: string;
    qrCode: string; // Base64 encoded QR code
    metadata: ReceiptMetadata;
  }
  
  export interface ReceiptMetadata {
    issuer: string;
    issuerAddress: string;
    recipient: string;
    recipientAddress: string;
    network: string;
    blockExplorer: string;
    disclaimers?: string[];
  }
  
  export interface ReceiptTemplate {
    id: string;
    name: string;
    description: string;
    headerLogo?: string;
    footerText?: string;
    includeQRCode: boolean;
    includeBlockExplorer: boolean;
    customFields: ReceiptCustomField[];
  }
  
  export interface ReceiptCustomField {
    key: string;
    label: string;
    value: string;
    type: 'text' | 'currency' | 'date' | 'link';
  }
  