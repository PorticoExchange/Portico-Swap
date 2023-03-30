const request = require('request');

const LIGHTNING_API_KEY = 'your-lightning-api-key-here';
const LIGHTNING_CHARGE_URL = 'http://localhost:9112';

const LIQUID_API_KEY = 'your-liquid-api-key-here';
const LIQUID_URL = 'http://localhost:8080';

// Step 1: Generate a Lightning invoice
request.post({
    url: `${LIGHTNING_CHARGE_URL}/invoice`,
    headers: {
        'X-Access-Token': LIGHTNING_API_KEY,
    },
    json: {
        msatoshi: 1000,
        description: 'Swap payment',
        expiry: 60,
    },
}, (error, response, lightningInvoice) => {
    if (error) {
        console.error(error);
        return;
    }
    console.log('Lightning invoice created:', lightningInvoice);

    // Step 2: Create a Liquid asset
    request.post({
        url: `${LIQUID_URL}/asset`,
        headers: {
            'Authorization': `Bearer ${LIQUID_API_KEY}`,
        },
        json: {
            name: 'Example Asset',
            ticker: 'EXM',
            isw: true,
        },
    }, (error, response, liquidAsset) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log('Liquid asset created:', liquidAsset);

        // Step 3: Create a Liquid invoice
        request.post({
            url: `${LIQUID_URL}/invoice`,
            headers: {
                'Authorization': `Bearer ${LIQUID_API_KEY}`,
            },
            json: {
                asset: liquidAsset.asset_id
