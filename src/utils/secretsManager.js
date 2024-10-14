// src/utils/fetchApiKey.js

let cachedApiKey = null; // Cache the API key in memory

// Function to fetch the API key from the Lambda function (via Lambda URL or API Gateway)
export const fetchApiKeyFromLambda = async () => {
    // Return the cached key if it has already been fetched
    if (cachedApiKey) {
        return cachedApiKey;
    }

    try {
        // Call the Lambda function URL directly using fetch
        const response = await fetch('https://i5cjrd5b5zya3bu7osd5iivel40hankp.lambda-url.us-east-1.on.aws/', {
            method: 'GET',  // Make sure you are doing a GET request
            headers: {
                'Content-Type': 'application/json',
                // Add any other required headers like API keys, tokens, etc.
            },
        });

        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        // Parse the response to get the API key
        const data = await response.json();
        const apiKey = data.apiKey;

        // Cache the API key for future use
        cachedApiKey = apiKey;

        // Log the API key for debugging
        console.log('Fetched and cached API key from Lambda:', apiKey);

        return apiKey;
    } catch (error) {
        // Log detailed error info for debugging
        console.error('Error fetching API key from Lambda:', error);
        if (error.name === 'TypeError' && error.message.includes('CORS')) {
            console.error('This is likely a CORS issue. Check if the Lambda function is sending the correct CORS headers.');
        }
        return null; // Return null or handle the error gracefully
    }
};

