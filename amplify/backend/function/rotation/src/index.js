const AWS = require('aws-sdk');
const appsync = new AWS.AppSync();
const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
    try {
        // Calculate the expiration timestamp for 7 days from now
        const sevenDaysInSeconds = 7 * 24 * 60 * 60; // 7 days in seconds
        const currentTimeInSeconds = Math.floor(Date.now() / 1000); // current time in seconds since epoch
        const expirationTimestamp = currentTimeInSeconds + sevenDaysInSeconds;

        // Create a new API key with expiration in 7 days
        const createApiKeyResponse = await appsync.createApiKey({
            apiId: 'mwp6i6x5mbhjfkzpda6tazz55q',
            description: 'API key for AppSync',
            expires: expirationTimestamp // Pass the expiration timestamp (seconds since epoch)
        }).promise();

        const newApiKey = createApiKeyResponse.apiKey.id;

        // Update the secret in Secrets Manager
        const secretName = 'appsync-image-gallery';
        await secretsManager.updateSecret({
            SecretId: secretName,
            SecretString: JSON.stringify({ apiKey: newApiKey })
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify('API key rotated and updated in Secrets Manager successfully')
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(`Error: ${error.message}`)
        };
    }
};
