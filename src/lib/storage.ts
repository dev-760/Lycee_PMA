import { getAuthenticatedClient } from './supabase';

const BUCKET_NAME = 'media';

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
 * Validate file before upload
 * @param file - The file to validate
 * @returns Object with isValid and error message
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: 'File type not allowed. Please use JPEG, PNG, WebP, or GIF.'
        };
    }

    if (file.size > MAX_SIZE) {
        return {
            isValid: false,
            error: 'File too large. Maximum size is 5MB.'
        };
    }

    return { isValid: true };
}
