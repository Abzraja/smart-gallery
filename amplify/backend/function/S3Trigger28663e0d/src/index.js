const { RekognitionClient, DetectLabelsCommand } = require('@aws-sdk/client-rekognition');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, GetObjectCommand, waitUntilObjectExists } = require('@aws-sdk/client-s3');

const rekognitionClient = new RekognitionClient({ region: 'us-east-1' });
const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' });
const s3Client = new S3Client({ region: 'us-east-1' });

exports.handler = async function (event) {
    console.log('Received S3 event:', JSON.stringify(event, null, 2));
    const bucket = event.Records[0].s3.bucket.name;
    let key = event.Records[0].s3.object.key;
    key = decodeURIComponent(key.replace(/\+/g, ' ')); // Decode the key
    console.log(`Bucket: ${bucket}`, `Key: ${key}`);

    // Wait until the object exists
    try {
        await waitUntilObjectExists({ client: s3Client, maxWaitTime: 20 }, { Bucket: bucket, Key: key });
        const s3Response = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        console.log('S3 object metadata:', s3Response);
    } catch (error) {
        console.error('Error accessing S3 object:', error);
        return;
    }

    // Call Rekognition to detect labels in the image
    const params = {
        Image: {
            S3Object: {
                Bucket: bucket,
                Name: key
            }
        },
        MaxLabels: 10
    };

    try {
        const rekognitionResponse = await rekognitionClient.send(new DetectLabelsCommand(params));
        const labels = rekognitionResponse.Labels.map(label => label.Name);
        console.log('Detected labels:', labels);

        // Store labels in DynamoDB
        const dynamoParams = {
            TableName: 'PhotoTag-mwp6i6x5mbhjfkzpda6tazz55q-dev', //enter dynamodb table name from aws console here
            Item: {
                PhotoID: { S: key },
                Tags: { SS: labels }
            }
        };

        await dynamodbClient.send(new PutItemCommand(dynamoParams));
        console.log('Labels stored successfully');
    } catch (error) {
        console.error('Error detecting labels or storing in DynamoDB:', error);
    }
};
