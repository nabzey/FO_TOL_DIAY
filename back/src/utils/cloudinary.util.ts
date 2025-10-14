import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileStorageUtil {
  private static readonly UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

  /**
   * S'assurer que le dossier uploads existe
   */
  private static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.UPLOAD_DIR);
    } catch {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Sauvegarder une image localement
   */
  static async saveImage(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = 'products'
  ): Promise<{ url: string; filename: string }> {
    await this.ensureUploadDir();

    // Générer un nom de fichier unique
    const extension = path.extname(originalName) || '.jpg';
    const filename = `${uuidv4()}${extension}`;
    const folderPath = path.join(this.UPLOAD_DIR, folder);

    // Créer le dossier si nécessaire
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, filename);

    // Écrire le fichier
    await fs.writeFile(filePath, fileBuffer);

    // Retourner l'URL relative pour le frontend
    const url = `/uploads/${folder}/${filename}`;

    console.log('Image saved locally:', { url, filename, filePath });

    return { url, filename };
  }

  /**
   * Sauvegarder plusieurs images
   */
  static async saveMultipleImages(
    files: Express.Multer.File[],
    folder: string = 'products'
  ): Promise<{ url: string; filename: string }[]> {
    const savePromises = files.map((file) =>
      this.saveImage(file.buffer, file.originalname, folder)
    );
    return Promise.all(savePromises);
  }

  /**
   * Supprimer une image locale
   */
  static async deleteImage(filename: string, folder: string = 'products'): Promise<void> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, folder, filename);
      await fs.unlink(filePath);
      console.log('Image deleted locally:', filePath);
    } catch (error) {
      console.error('Error deleting local image:', error);
      throw error;
    }
  }

  /**
   * Supprimer plusieurs images locales
   */
  static async deleteMultipleImages(filenames: string[], folder: string = 'products'): Promise<void> {
    const deletePromises = filenames.map(filename => this.deleteImage(filename, folder));
    await Promise.all(deletePromises);
  }

  /**
   * Vérifier si une image existe
   */
  static async imageExists(filename: string, folder: string = 'products'): Promise<boolean> {
    try {
      const filePath = path.join(this.UPLOAD_DIR, folder, filename);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export default FileStorageUtil;
