import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImageBuffer(
  buffer: Buffer,
  folder = 'deema/products',
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const opts: Record<string, unknown> = {
      folder,
      transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
    }
    if (publicId) opts.public_id = publicId

    cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error || !result) return reject(error ?? new Error('Upload failed'))
      resolve({ url: result.secure_url, publicId: result.public_id })
    }).end(buffer)
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary
