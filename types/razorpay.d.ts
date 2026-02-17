declare module 'razorpay' {
    interface RazorpayOptions {
        key_id: string;
        key_secret: string;
        headers?: any;
    }

    interface RazorpayOrderOptions {
        amount: number;
        currency: string;
        receipt?: string;
        payment_capture?: boolean;
        notes?: any;
    }

    class Razorpay {
        constructor(options: RazorpayOptions);
        orders: {
            create(options: RazorpayOrderOptions): Promise<any>;
            fetch(orderId: string): Promise<any>;
            all(options?: any): Promise<any>;
        };
    }

    export = Razorpay;
}
