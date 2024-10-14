const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
    // Handle OPTIONS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',  // Allow all origins (for OPTIONS request)
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400',  // Cache the preflight request for 24 hours
            },
            body: ''  // No body needed for OPTIONS response
        };
    }

    // Handle the actual request (GET request)
    try {
        const secretName = 'appsync-image-gallery';  // Your secret name
        const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

        if ('SecretString' in secretValue) {
            const secret = JSON.parse(secretValue.SecretString);
            const apiKey = secret.apiKey;

            // Return the response without CORS headers
            return {
                statusCode: 200,
                body: JSON.stringify({ apiKey }),
            };
        }
    } catch (error) {
        console.error('Error fetching secret:', error);

        // Return the error response without CORS headers
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error fetching API key from Secrets Manager' }),
        };
    }
};
