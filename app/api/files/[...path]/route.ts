import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(process.cwd(), 'public', ...params.path);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and serve the file
    const fileBuffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (extension === '.jpg' || extension === '.jpeg') contentType = 'image/jpeg';
    else if (extension === '.png') contentType = 'image/png';
    else if (extension === '.gif') contentType = 'image/gif';
    else if (extension === '.webp') contentType = 'image/webp';
    else if (extension === '.mp3') contentType = 'audio/mpeg';
    else if (extension === '.wav') contentType = 'audio/wav';
    else if (extension === '.m4a') contentType = 'audio/mp4';
    else if (extension === '.flac') contentType = 'audio/flac';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });

  } catch (error) {
    console.error('File serving error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
