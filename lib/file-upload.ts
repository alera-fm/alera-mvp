import { promises as fs } from 'fs';
import path from 'path';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<UploadResult> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to local directory
    await fs.writeFile(filePath, buffer);

    // Return the file URL (accessible via public folder)
    return {
      success: true,
      url: `/uploads/${folder}/${fileName}`
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function deleteFile(fileName: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), 'public', fileName);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
