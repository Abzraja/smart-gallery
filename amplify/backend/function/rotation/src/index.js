const AWS = require('aws-sdk');
const appsync = new AWS.AppSync();
const secretsManager = new AWS.SecretsManager();

exports.handler = async (event) => {
    try {
        // Create a new API key
        const createApiKeyResponse = await appsync.createApiKey({
            apiId: 'mwp6i6x5mbhjfkzpda6tazz55q',
            description: 'API key for AppSync',
            expires: 604800 // 7 days in seconds
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
