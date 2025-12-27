/**
 * Media Uploader Component
 * 
 * Supports uploading multiple images (up to 10) and videos.
 * Features drag-and-drop, preview, and reordering.
 */

import { useState, useRef } from 'react';
import {
    Upload,
    X,
    Image as ImageIcon,
    Video,
    Loader2,
    Plus,
    GripVertical,
    Film
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import {
    uploadImage,
    uploadVideo,
    validateImageFile,
    validateVideoFile,
    MAX_IMAGES,
    MAX_VIDEOS,
    isVideoUrl
} from '@/lib/storage';

interface MediaUploaderProps {
    images: string[];
    videos: string[];
    onImagesChange: (images: string[]) => void;
    onVideosChange: (videos: string[]) => void;
    folder?: string;
}

const MediaUploader = ({
    images,
    videos,
    onImagesChange,
    onVideosChange,
    folder = 'uploads'
}: MediaUploaderProps) => {
    const { language } = useLanguage();
    const { toast } = useToast();
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Translations
    const translations = {
        ar: {
            images: 'الصور',
            videos: 'الفيديوهات',
            uploadImages: 'رفع صور',
            uploadVideo: 'رفع فيديو',
            dragDrop: 'اسحب وأفلت الملفات هنا',
            or: 'أو',
            clickUpload: 'اضغط للرفع',
            uploading: 'جاري الرفع...',
            maxImages: 'الحد الأقصى 10 صور',
            maxVideos: 'الحد الأقصى 5 فيديوهات',
            imageAdded: 'تمت إضافة الصورة',
            videoAdded: 'تم إضافة الفيديو',
            imageRemoved: 'تم حذف الصورة',
            videoRemoved: 'تم حذف الفيديو',
            maxImagesReached: 'تم الوصول للحد الأقصى من الصور',
            maxVideosReached: 'تم الوصول للحد الأقصى من الفيديوهات',
            orPasteUrl: 'أو الصق رابط',
            addUrl: 'إضافة رابط',
            imageUrl: 'رابط الصورة',
            videoUrl: 'رابط الفيديو'
        },
        en: {
            images: 'Images',
            videos: 'Videos',
            uploadImages: 'Upload Images',
            uploadVideo: 'Upload Video',
            dragDrop: 'Drag and drop files here',
            or: 'or',
            clickUpload: 'Click to upload',
            uploading: 'Uploading...',
            maxImages: 'Maximum 10 images',
            maxVideos: 'Maximum 5 videos',
            imageAdded: 'Image added',
            videoAdded: 'Video added',
            imageRemoved: 'Image removed',
            videoRemoved: 'Video removed',
            maxImagesReached: 'Maximum images reached',
            maxVideosReached: 'Maximum videos reached',
            orPasteUrl: 'Or paste URL',
            addUrl: 'Add URL',
            imageUrl: 'Image URL',
            videoUrl: 'Video URL'
        },
        fr: {
            images: 'Images',
            videos: 'Vidéos',
            uploadImages: 'Télécharger des images',
            uploadVideo: 'Télécharger une vidéo',
            dragDrop: 'Glissez et déposez les fichiers ici',
            or: 'ou',
            clickUpload: 'Cliquez pour télécharger',
            uploading: 'Téléchargement...',
            maxImages: 'Maximum 10 images',
            maxVideos: 'Maximum 5 vidéos',
            imageAdded: 'Image ajoutée',
            videoAdded: 'Vidéo ajoutée',
            imageRemoved: 'Image supprimée',
            videoRemoved: 'Vidéo supprimée',
            maxImagesReached: 'Nombre maximum d\'images atteint',
            maxVideosReached: 'Nombre maximum de vidéos atteint',
            orPasteUrl: 'Ou collez l\'URL',
            addUrl: 'Ajouter URL',
            imageUrl: 'URL de l\'image',
            videoUrl: 'URL de la vidéo'
        }
    };

    const t = (key: keyof typeof translations.en) =>
        translations[language as keyof typeof translations]?.[key] || translations.en[key];

    // Handle image file upload
    const handleImageUpload = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const remainingSlots = MAX_IMAGES - images.length;

        if (remainingSlots <= 0) {
            toast({
                title: t('maxImagesReached'),
                variant: 'destructive'
            });
            return;
        }

        const filesToUpload = fileArray.slice(0, remainingSlots);
        setUploadingImages(true);

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const validation = validateImageFile(file);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }
                return uploadImage(file, folder);
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onImagesChange([...images, ...uploadedUrls]);

            toast({
                title: t('imageAdded')
            });
        } catch (error: any) {
            toast({
                title: error.message || 'Upload failed',
                variant: 'destructive'
            });
        } finally {
            setUploadingImages(false);
        }
    };

    // Handle video file upload
    const handleVideoUpload = async (file: File) => {
        if (videos.length >= MAX_VIDEOS) {
            toast({
                title: t('maxVideosReached'),
                variant: 'destructive'
            });
            return;
        }

        const validation = validateVideoFile(file);
        if (!validation.isValid) {
            toast({
                title: validation.error,
                variant: 'destructive'
            });
            return;
        }

        setUploadingVideo(true);
        try {
            const url = await uploadVideo(file, folder);
            onVideosChange([...videos, url]);
            toast({
                title: t('videoAdded')
            });
        } catch (error: any) {
            toast({
                title: error.message || 'Video upload failed',
                variant: 'destructive'
            });
        } finally {
            setUploadingVideo(false);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length === 0) return;

        // Separate images and videos
        const imageFiles: File[] = [];
        const videoFiles: File[] = [];

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                imageFiles.push(file);
            } else if (file.type.startsWith('video/')) {
                videoFiles.push(file);
            }
        });

        if (imageFiles.length > 0) {
            handleImageUpload(imageFiles);
        }
        if (videoFiles.length > 0 && videoFiles[0]) {
            handleVideoUpload(videoFiles[0]);
        }
    };

    // Remove image
    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
        toast({ title: t('imageRemoved') });
    };

    // Remove video
    const removeVideo = (index: number) => {
        const newVideos = videos.filter((_, i) => i !== index);
        onVideosChange(newVideos);
        toast({ title: t('videoRemoved') });
    };

    // Add URL manually
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    const addImageUrl = () => {
        if (!imageUrl.trim()) return;
        if (images.length >= MAX_IMAGES) {
            toast({ title: t('maxImagesReached'), variant: 'destructive' });
            return;
        }
        onImagesChange([...images, imageUrl.trim()]);
        setImageUrl('');
        toast({ title: t('imageAdded') });
    };

    const addVideoUrl = () => {
        if (!videoUrl.trim()) return;
        if (videos.length >= MAX_VIDEOS) {
            toast({ title: t('maxVideosReached'), variant: 'destructive' });
            return;
        }
        onVideosChange([...videos, videoUrl.trim()]);
        setVideoUrl('');
        toast({ title: t('videoAdded') });
    };

    return (
        <div className="space-y-6">
            {/* Images Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        {t('images')}
                        <span className="text-slate text-xs font-normal">
                            ({images.length}/{MAX_IMAGES})
                        </span>
                    </label>
                    <span className="text-xs text-slate">{t('maxImages')}</span>
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mb-4">
                        {images.map((url, index) => (
                            <div
                                key={index}
                                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                            >
                                <img
                                    src={url}
                                    alt={`Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {index === 0 && (
                                    <div className="absolute top-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-md">
                                        {language === 'ar' ? 'رئيسية' : language === 'fr' ? 'Principal' : 'Main'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Area */}
                {images.length < MAX_IMAGES && (
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
                            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => imageInputRef.current?.click()}
                    >
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                            disabled={uploadingImages}
                        />
                        {uploadingImages ? (
                            <div className="flex items-center justify-center gap-2 text-slate">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('uploading')}
                            </div>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-slate text-sm">{t('dragDrop')}</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {t('or')} <span className="text-blue-500">{t('clickUpload')}</span>
                                </p>
                            </>
                        )}
                    </div>
                )}

                {/* URL Input */}
                <div className="flex gap-2 mt-3">
                    <input
                        type="url"
                        placeholder={t('imageUrl')}
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-sm"
                        disabled={images.length >= MAX_IMAGES}
                    />
                    <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={!imageUrl.trim() || images.length >= MAX_IMAGES}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Videos Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-charcoal flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        {t('videos')}
                        <span className="text-slate text-xs font-normal">
                            ({videos.length}/{MAX_VIDEOS})
                        </span>
                    </label>
                    <span className="text-xs text-slate">{t('maxVideos')}</span>
                </div>

                {/* Video Preview List */}
                {videos.length > 0 && (
                    <div className="space-y-3 mb-4">
                        {videos.map((url, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="w-20 h-14 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                                    {isVideoUrl(url) ? (
                                        <video
                                            src={url}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Film className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1 truncate text-sm text-slate">
                                    {url}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVideo(index)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Video Upload */}
                {videos.length < MAX_VIDEOS && (
                    <div className="flex gap-3">
                        <label
                            className={`flex-1 flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                ${uploadingVideo ? 'border-purple-300 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'}`}
                        >
                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                disabled={uploadingVideo}
                            />
                            {uploadingVideo ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                                    <span className="text-slate">{t('uploading')}</span>
                                </>
                            ) : (
                                <>
                                    <Video className="w-5 h-5 text-purple-500" />
                                    <span className="text-slate">{t('uploadVideo')}</span>
                                </>
                            )}
                        </label>
                    </div>
                )}

                {/* Video URL Input */}
                <div className="flex gap-2 mt-3">
                    <input
                        type="url"
                        placeholder={t('videoUrl')}
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm"
                        disabled={videos.length >= MAX_VIDEOS}
                    />
                    <button
                        type="button"
                        onClick={addVideoUrl}
                        disabled={!videoUrl.trim() || videos.length >= MAX_VIDEOS}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaUploader;
