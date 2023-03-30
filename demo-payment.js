const request = require('request');

const API_KEY = 'your-api-key-here';
const LIGHTNING_CHARGE_URL = 'http://localhost:9112';

// Generate a Lightning invoice
request.post({
    url: `${LIGHTNING_CHARGE_URL}/invoice`,
    headers: {
        'X-Access-Token': API_KEY,
    },
    json: {
        msatoshi: 1000,
        description: 'Demo payment',
        expiry: 60,
    },
}, (error, response, body) => {
    if (error) {
        console.error(error);
        return;
    }
    const invoice = body;
    console.log('Invoice created:', invoice);

    // Initiate a payment
    request.post({
        url: `${LIGHTNING_CHARGE_URL}/payinvoice/${invoice.id}`,
        headers: {
            'X-Access-Token': API_KEY,
        },
    }, (error, response, body) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log('Payment initiated:', body);

        // Monitor the status of the HTLCs
        setInterval(() => {
            request.get({
                url: `${LIGHTNING_CHARGE_URL}/listinvoices/${invoice.id}`,
                headers: {
                    'X-Access-Token': API_KEY,
                },
            }, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return;
                }
                const invoice = JSON.parse(body);
                console.log('Invoice status:', invoice.status);

                request.get({
                    url: `${LIGHTNING_CHARGE_URL}/listpayments`,
                    headers: {
                        'X-Access-Token': API_KEY,
                    },
                }, (error, response, body) => {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    const payments = JSON.parse(body);
                    const payment = payments.find(p => p.id === invoice.payments[0].id);
                    console.log('Payment status:', payment.status);

                    if (invoice.status === 'paid' && payment.status === 'complete') {
                        console.log('Payment successful!');
                        clearInterval(interval);
                    }
                });
            });
        }, 1000);
   
