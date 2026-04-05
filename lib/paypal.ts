declare global {
    interface Window {
        paypal: any;
    }
}

export async function loadPayPalSDK(clientId: string, currency = 'USD'): Promise<any> {
    return new Promise((resolve, reject) => {
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
        script.async = true;
        script.onload = () => resolve(window.paypal);
        script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
        document.body.appendChild(script);
    });
}

export default loadPayPalSDK;
