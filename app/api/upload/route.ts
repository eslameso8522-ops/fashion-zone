import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'لم يتم تحديد أي ملف للرفع' },
        { status: 400 }
      );
    }

    // Convert file to buffer and base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${mime};base64,${base64Data}`;

    // Upload directly to Cloudinary with auto optimization
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: 'fashion_zone_products',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' } // Auto compress and convert to WebP/AVIF
      ]
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'فشل في رفع الصورة إلى السحابة' },
      { status: 500 }
    );
  }
}
