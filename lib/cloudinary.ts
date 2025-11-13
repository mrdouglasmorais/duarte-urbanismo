import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
// Hardcoded conforme solicitado pelo usuário
// Nota: Se não tiver Cloudinary configurado, o upload de avatar falhará
// Você pode configurar depois ou usar upload local
cloudinary.config({
  cloud_name: 'your-cloud-name', // Substitua pelos valores reais se tiver Cloudinary
  api_key: 'your-api-key',
  api_secret: 'your-api-secret',
  secure: true,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export async function uploadAvatar(file: Buffer, filename: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extensão
        transformation: [
          {
            width: 600,
            height: 600,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width || 600,
            height: result.height || 600,
          });
        } else {
          reject(new Error('Upload retornou resultado vazio'));
        }
      }
    );

    uploadStream.end(file);
  });
}

export { cloudinary };

