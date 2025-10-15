import { v2 as cloudinary } from 'cloudinary';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class FileStorageUtil {
  private static readonly UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

  /**
   * S'assurer que le dossier uploads existe (pour la compatibilité)
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Sauvegarder une image sur Cloudinary
   */
  static async saveImage(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = 'products'
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Générer un nom de fichier unique pour le public_id
      const publicId = `${folder}/${uuidv4()}`;

      // Upload vers Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: folder,
            resource_type: 'image',
            format: 'jpg', // Forcer le format JPG pour la cohérence
            transformation: [
              { width: 800, height: 800, crop: 'limit' }, // Redimensionner si nécessaire
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileBuffer);
      });

      console.log('Image uploaded to Cloudinary:', { url: result.secure_url, publicId: result.public_id });

      return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder plusieurs images sur Cloudinary
   */
  static async saveMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'products'
  ): Promise<{ url: string; publicId: string }[]> {
    const savePromises = files.map((file) =>
      this.saveImage(file.buffer, file.originalname, folder)
    );
    return Promise.all(savePromises);
  }

  /**
   * Supprimer une image de Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Image deleted from Cloudinary:', publicId, result);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Supprimer plusieurs images de Cloudinary
   */
  static async deleteMultipleImages(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
    await Promise.all(deletePromises);
  }

  /**
   * Vérifier si une image existe sur Cloudinary (via API)
   */
  static async imageExists(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return !!result;
    } catch (error) {
      console.log('Image does not exist on Cloudinary:', publicId);
      return false;
    }
  }

  /**
   * Méthodes de compatibilité pour le stockage local (si nécessaire)
   */
  static async saveImageLocally(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = 'products'
  ): Promise<{ url: string; filename: string }> {
    await this.ensureUploadDir();

    const extension = path.extname(originalName) || '.jpg';
    const filename = `${uuidv4()}${extension}`;
    const folderPath = path.join(this.UPLOAD_DIR, folder);

    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);
    await fs.writeFile(filePath, fileBuffer);

    const url = `/uploads/${folder}/${filename}`;

    console.log('Image saved locally:', { url, filename, filePath });

    return { url, filename };
  }

  static async deleteImageLocally(filename: string, folder: string = 'products'): Promise<void> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, folder, filename);
      await fs.unlink(filePath);
      console.log('Image deleted locally:', filePath);
    } catch (error) {
      console.error('Error deleting local image:', error);
      throw error;
    }
  }
}

export default FileStorageUtil;
