declare module "@paystack/inline-js" {
  type PaystackTransaction = {
    id: number;
    reference: string;
    message: string;
  };

  type PaystackCallbacks = {
    onSuccess?: (
      transaction: PaystackTransaction
    ) => void;

    onCancel?: () => void;

    onError?: (
      error: {
        message: string;
      }
    ) => void;
  };

  class PaystackPop {
    resumeTransaction(
      accessCode: string,
      callbacks?: PaystackCallbacks
    ): void;

    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      reference?: string;
      onSuccess?: (
        transaction: PaystackTransaction
      ) => void;
      onCancel?: () => void;
      onError?: (
        error: {
          message: string;
        }
      ) => void;
    }): void;

    checkout(options: unknown): void;
  }

  export default PaystackPop;
}