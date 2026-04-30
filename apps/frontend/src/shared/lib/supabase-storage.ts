import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadImageToSupabase = async (
  file: File,
  bucketName: string,
  folderPath: string
): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  return publicUrlData.publicUrl;
};

export const uploadNoticeImage = async (file: File): Promise<string> => {
  return uploadImageToSupabase(file, 'notices', 'announcements');
};

export const uploadLostFoundImage = async (file: File): Promise<string> => {
  return uploadImageToSupabase(file, 'lost-found', 'items');
};
