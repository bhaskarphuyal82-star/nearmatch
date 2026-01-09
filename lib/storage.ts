import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    endpoint: process.env.SPACES_ENDPOINT!,
    region: process.env.SPACES_REGION!,
    forcePathStyle: false, // Use virtual-hosted-style URLs
    credentials: {
        accessKeyId: process.env.SPACES_KEY!,
        secretAccessKey: process.env.SPACES_SECRET!,
    },
});

const BUCKET_NAME = process.env.SPACES_BUCKET!;
// CDN URL should be like: https://dunz0.sgp1.digitaloceanspaces.com (bucket already in subdomain)
const CDN_URL = process.env.SPACES_CDN_ENDPOINT || `https://${BUCKET_NAME}.${process.env.SPACES_REGION}.digitaloceanspaces.com`;

export async function uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    const key = `nearmatch/uploads/${Date.now()}-${fileName}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file,
            ContentType: contentType,
            ACL: 'public-read',
        })
    );

    // Don't add bucket name again - it's already in the CDN URL subdomain
    return `${CDN_URL}/${key}`;
}

export async function deleteFile(fileUrl: string): Promise<void> {
    const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) return;

    const key = urlParts[1];

    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        })
    );
}

export async function getPresignedUploadUrl(
    fileName: string,
    contentType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
    const key = `nearmatch/uploads/${Date.now()}-${fileName}`;

    const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            ACL: 'public-read',
        }),
        { expiresIn: 3600 }
    );

    return {
        uploadUrl,
        fileUrl: `${CDN_URL}/${key}`,
    };
}

export { s3Client, BUCKET_NAME };
