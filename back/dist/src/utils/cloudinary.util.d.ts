export declare class FileStorageUtil {
    private static readonly UPLOAD_DIR;
    /**
     * S'assurer que le dossier uploads existe (pour la compatibilité)
     */
    private static ensureUploadDir;
    /**
     * Sauvegarder une image sur Cloudinary
     */
    static saveImage(fileBuffer: Buffer, originalName: string, folder?: string): Promise<{
        url: string;
        publicId: string;
    }>;
    /**
     * Sauvegarder plusieurs images sur Cloudinary
     */
    static saveMultipleImages(files: Express.Multer.File[], folder?: string): Promise<{
        url: string;
        publicId: string;
    }[]>;
    /**
     * Supprimer une image de Cloudinary
     */
    static deleteImage(publicId: string): Promise<void>;
    /**
     * Supprimer plusieurs images de Cloudinary
     */
    static deleteMultipleImages(publicIds: string[]): Promise<void>;
    /**
     * Vérifier si une image existe sur Cloudinary (via API)
     */
    static imageExists(publicId: string): Promise<boolean>;
    /**
     * Méthodes de compatibilité pour le stockage local (si nécessaire)
     */
    static saveImageLocally(fileBuffer: Buffer, originalName: string, folder?: string): Promise<{
        url: string;
        filename: string;
    }>;
    static deleteImageLocally(filename: string, folder?: string): Promise<void>;
}
export default FileStorageUtil;
//# sourceMappingURL=cloudinary.util.d.ts.map