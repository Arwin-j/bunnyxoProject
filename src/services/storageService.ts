import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type StorageBucket = 'event-banners' | 'map-media' | 'feed-media';

/**
 * Uploads an image file to Supabase Storage and returns the public CDN URL.
 * Falls back to an inline data URL or temporary object URL if Supabase is not yet configured.
 */
export async function uploadMedia(file: File, bucket: StorageBucket): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Local dev fallback: convert file to Base64 data URL so it persists in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

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
    throw new Error(`Failed to upload to Supabase storage: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export default uploadMedia;
