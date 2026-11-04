import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'event-banners' | 'map-media' | 'feed-media' | 'community-spotlights';

/**
 * Converts a File to a Base64 Data URL (used as fallback or offline storage)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image file to Supabase Storage and returns the public CDN URL.
 * Falls back gracefully to an inline data URL if Supabase is not configured or if the bucket
 * does not exist yet in Supabase Storage, ensuring submissions never fail.
 */
export async function uploadMedia(file: File, bucket: StorageBucket): Promise<string> {
  if (!isSupabaseConfigured()) {
    return fileToBase64(file);
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.warn(
        `Supabase storage bucket "${bucket}" notice (${uploadError.message}). Falling back gracefully to image data URL.`
      );
      return await fileToBase64(file);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.warn(
      `Supabase storage upload notice (${err?.message || err}). Falling back gracefully to image data URL.`
    );
    return await fileToBase64(file);
  }
}

export default uploadMedia;
