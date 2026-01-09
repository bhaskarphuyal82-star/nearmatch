import { S3Client, PutObjectCommand, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';

async function testStorage() {
    console.log('🔄 Testing Digital Ocean Spaces connection...');

    const endpoint = process.env.SPACES_ENDPOINT;
    const region = process.env.SPACES_REGION;
    const bucket = process.env.SPACES_BUCKET;
    const key = process.env.SPACES_KEY;
    const secret = process.env.SPACES_SECRET;

    if (!endpoint || !bucket || !key || !secret) {
        console.error('❌ Missing Digital Ocean Spaces configuration!');
        console.log('\nRequired environment variables:');
        console.log('  SPACES_ENDPOINT:', endpoint ? '✅' : '❌ Missing');
        console.log('  SPACES_REGION:', region ? '✅' : '❌ Missing');
        console.log('  SPACES_BUCKET:', bucket ? '✅' : '❌ Missing');
        console.log('  SPACES_KEY:', key ? '✅' : '❌ Missing');
        console.log('  SPACES_SECRET:', secret ? '✅' : '❌ Missing');
        process.exit(1);
    }

    const client = new S3Client({
        endpoint,
        region: region || 'us-east-1',
        credentials: {
            accessKeyId: key,
            secretAccessKey: secret,
        },
    });

    try {
        // Test bucket access
        console.log(`\n📦 Checking bucket: ${bucket}`);
        await client.send(new HeadBucketCommand({ Bucket: bucket }));
        console.log('✅ Bucket accessible!');

        // Create nearmatch folder (by creating a placeholder object)
        console.log('\n📁 Creating nearmatch/ folder...');
        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: 'nearmatch/',
            Body: '',
            ACL: 'public-read',
        }));
        console.log('✅ Folder created: nearmatch/');

        // Create uploads subfolder
        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: 'nearmatch/uploads/',
            Body: '',
            ACL: 'public-read',
        }));
        console.log('✅ Folder created: nearmatch/uploads/');

        // List objects to verify
        console.log('\n📋 Listing objects in bucket:');
        const listResult = await client.send(new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: 'nearmatch/',
            MaxKeys: 10,
        }));

        if (listResult.Contents) {
            listResult.Contents.forEach(item => {
                console.log(`   - ${item.Key}`);
            });
        }

        console.log('\n✅ Digital Ocean Spaces test passed!');
    } catch (error) {
        console.error('❌ Storage test failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

testStorage();
