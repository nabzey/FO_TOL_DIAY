"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageUtil = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Configuration Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class FileStorageUtil {
    /**
     * S'assurer que le dossier uploads existe (pour la compatibilité)
     */
    static async ensureUploadDir() {
        try {
            await fs_1.promises.access(this.UPLOAD_DIR);
        }
        catch {
            await fs_1.promises.mkdir(this.UPLOAD_DIR, { recursive: true });
        }
    }
    /**
     * Sauvegarder une image sur Cloudinary
     */
    static async saveImage(fileBuffer, originalName, folder = 'products') {
        try {
            // Générer un nom de fichier unique pour le public_id
            const publicId = `${folder}/${(0, uuid_1.v4)()}`;
            // Upload vers Cloudinary
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.v2.uploader.upload_stream({
                    public_id: publicId,
                    folder: folder,
                    resource_type: 'image',
                    format: 'jpg', // Forcer le format JPG pour la cohérence
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' }, // Redimensionner si nécessaire
                    ],
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                }).end(fileBuffer);
            });
            console.log('Image uploaded to Cloudinary:', { url: result.secure_url, publicId: result.public_id });
            return { url: result.secure_url, publicId: result.public_id };
        }
        catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    }
    /**
     * Sauvegarder plusieurs images sur Cloudinary
     */
    static async saveMultipleImages(files, folder = 'products') {
        const savePromises = files.map((file) => this.saveImage(file.buffer, file.originalname, folder));
        return Promise.all(savePromises);
    }
    /**
     * Supprimer une image de Cloudinary
     */
    static async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            console.log('Image deleted from Cloudinary:', publicId, result);
        }
        catch (error) {
            console.error('Error deleting from Cloudinary:', error);
            throw error;
        }
    }
    /**
     * Supprimer plusieurs images de Cloudinary
     */
    static async deleteMultipleImages(publicIds) {
        const deletePromises = publicIds.map(publicId => this.deleteImage(publicId));
        await Promise.all(deletePromises);
    }
    /**
     * Vérifier si une image existe sur Cloudinary (via API)
     */
    static async imageExists(publicId) {
        try {
            const result = await cloudinary_1.v2.api.resource(publicId);
            return !!result;
        }
        catch (error) {
            console.log('Image does not exist on Cloudinary:', publicId);
            return false;
        }
    }
    /**
     * Méthodes de compatibilité pour le stockage local (si nécessaire)
     */
    static async saveImageLocally(fileBuffer, originalName, folder = 'products') {
        await this.ensureUploadDir();
        const extension = path_1.default.extname(originalName) || '.jpg';
        const filename = `${(0, uuid_1.v4)()}${extension}`;
        const folderPath = path_1.default.join(this.UPLOAD_DIR, folder);
        try {
            await fs_1.promises.access(folderPath);
        }
        catch {
            await fs_1.promises.mkdir(folderPath, { recursive: true });
        }
        const filePath = path_1.default.join(folderPath, filename);
        await fs_1.promises.writeFile(filePath, fileBuffer);
        const url = `/uploads/${folder}/${filename}`;
        console.log('Image saved locally:', { url, filename, filePath });
        return { url, filename };
    }
    static async deleteImageLocally(filename, folder = 'products') {
        try {
            const filePath = path_1.default.join(this.UPLOAD_DIR, folder, filename);
            await fs_1.promises.unlink(filePath);
            console.log('Image deleted locally:', filePath);
        }
        catch (error) {
            console.error('Error deleting local image:', error);
            throw error;
        }
    }
}
exports.FileStorageUtil = FileStorageUtil;
FileStorageUtil.UPLOAD_DIR = path_1.default.join(__dirname, '../../public/uploads');
exports.default = FileStorageUtil;
//# sourceMappingURL=cloudinary.util.js.map