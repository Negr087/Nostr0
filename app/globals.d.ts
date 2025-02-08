interface Window {
  webln?: {
    enable: () => Promise<void>;
    makeInvoice: (args: {
      amount: number;
      defaultMemo?: string;
    }) => Promise<{ paymentRequest: string }>;
    sendPayment: (paymentRequest: string) => Promise<void>;
  };
}
