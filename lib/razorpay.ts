declare global {
    interface Window {
        Razorpay: any;
    }
}

export async function loadRazorpay(keyId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve(new window.Razorpay({
                key: keyId,
            }));
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            resolve(new window.Razorpay({
                key: keyId,
            }));
        };
        script.onerror = () => {
            reject(new Error('Failed to load Razorpay SDK'));
        };
        document.body.appendChild(script);
    });
}

export default loadRazorpay;
