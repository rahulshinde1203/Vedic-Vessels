import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { config } from '../config/env';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key:    config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
  secure:     true,
});

export function uploadBuffer(
  buffer:   Buffer,
  folder:   string,
  publicId: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Cloudinary upload failed'));
          else resolve(result);
        },
      )
      .end(buffer);
  });
}
