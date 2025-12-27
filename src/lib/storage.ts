import { getAuthenticatedClient } from './supabase';

const BUCKET_NAME = 'media';

// Maximum limits
export const MAX_IMAGES = 10;
export const MAX_VIDEOS = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param folder - Optional folder path (e.g., 'articles', 'news')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(file: File, folder: string = 'uploads'): Promise<string> {
    const supabase = getAuthenticatedClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Upload a video to Supabase Storage
 * @param file - The video file to upload
 * @param folder - Optional folder path (e.g., 'articles', 'news')
 * @returns The public URL of the uploaded video
 */
export async function uploadVideo(file: File, folder: string = 'videos'): Promise<string> {
    const supabase = getAuthenticatedClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Video upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
    const supabase = getAuthenticatedClient();

    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);

    if (pathParts.length < 2) {
        console.warn('Could not extract path from URL:', url);
        return;
    }

    const path = pathParts[1];

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);

    if (error) {
        console.error('Delete error:', error);
        throw error;
    }
}

/**
 * Delete a video from Supabase Storage (same as deleteImage)
 */
export const deleteVideo = deleteImage;

/**
 * Validate file before upload
 * @param file - The file to validate
 * @returns Object with isValid and error message
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'File type not allowed. Please use JPEG, PNG, WebP, or GIF.'
        };
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return {
            isValid: false,
            error: 'File too large. Maximum size is 5MB.'
        };
    }

    return { isValid: true };
}

/**
 * Validate video file before upload
 * @param file - The file to validate
 * @returns Object with isValid and error message
 */
export function validateVideoFile(file: File): { isValid: boolean; error?: string } {
    const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'Video type not allowed. Please use MP4, WebM, OGG, MOV, or AVI.'
        };
    }

    if (file.size > MAX_VIDEO_SIZE) {
        return {
            isValid: false,
            error: 'Video too large. Maximum size is 50MB.'
        };
    }

    return { isValid: true };
}

/**
 * Check if a URL is a video
 */
export function isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext));
}

