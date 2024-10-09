const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, GetObjectCommand, waitUntilObjectExists } = require('@aws-sdk/client-s3');

const rekognitionClient = new RekognitionClient({ region: 'us-east-1' });
const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

const getObjectFromS3 = async (bucket, key) => {
    try {
        await waitUntilObjectExists({ client: s3Client, maxWaitTime: 20 }, { Bucket: bucket, Key: key });
        return await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    } catch (error) {
        throw new Error(`Error accessing S3 object: ${error.message}`);
    }
};

const detectLabelsInImage = async (bucket, key, minConfidence = 90) => {
    const params = {
        Image: {
            S3Object: { Bucket: bucket, Name: key }
        },
        MaxLabels: 10
    };
    const rekognitionResponse = await rekognitionClient.send(new DetectLabelsCommand(params));
    
    // Filter labels based on confidence score
    const highConfidenceLabels = rekognitionResponse.Labels
        .filter(label => label.Confidence >= minConfidence)
        .map(label => label.Name); // Extract only the label names
    
    return highConfidenceLabels;
};

const storeLabelsInDynamoDB = async (key, labels) => {
    const dynamoParams = {
        TableName: 'PhotoTag-mwp6i6x5mbhjfkzpda6tazz55q-dev',
        Item: {
            PhotoID: { S: key },
            Tags: { SS: labels }
        }
    };
    return await dynamodbClient.send(new PutItemCommand(dynamoParams));
};

exports.handler = async function (event) {
    console.log('Received S3 event:', JSON.stringify(event, null, 2));
    const bucket = event.Records[0].s3.bucket.name;
    let key = event.Records[0].s3.object.key;
    key = decodeURIComponent(key.replace(/\+/g, ' '));

    try {
        const s3Response = await getObjectFromS3(bucket, key);
        console.log('S3 object metadata:', s3Response);

        const highConfidenceLabels = await detectLabelsInImage(bucket, key, 90); // Only labels with confidence >= 90%
        console.log('High-confidence labels:', highConfidenceLabels);

        if (highConfidenceLabels.length > 0) {
            await storeLabelsInDynamoDB(key, highConfidenceLabels);
            console.log('Labels stored successfully');
        } else {
            console.log('No high-confidence labels detected.');
        }
    } catch (error) {
        console.error(`Error processing image ${key}:`, error.message);
    }
};
