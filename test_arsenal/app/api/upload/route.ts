import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No hay archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Genera un nombre único (fecha + nombre)
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // Nota: Si tu bucket es privado, deberás añadir ACL: 'public-read' y configurar el bucket.
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error S3:', error);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}