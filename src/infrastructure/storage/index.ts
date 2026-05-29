import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../config/env'

const s3 = new S3Client({ region: env.AWS_REGION })

export const storage = {
  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    )
    return `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
  },

  async delete(key: string): Promise<void> {
    await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }))
  },
}
