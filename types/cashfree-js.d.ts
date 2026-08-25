declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeCheckoutOptions = {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | string;
  };

  export type CashfreeInstance = {
    checkout(options: CashfreeCheckoutOptions): Promise<void>;
  };

  export function load(options: {
    mode: "sandbox" | "production";
  }): Promise<CashfreeInstance | null>;
}
