import fs from 'fs/promises';
import path from 'path';
import { getFirebaseBucket } from '../config/firebase.js';

function safeFileName(originalName = 'file') {
  const base = path.basename(originalName, path.extname(originalName)).replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
  const extension = path.extname(originalName).toLowerCase();
  return `${base || 'file'}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}

export async function saveUploadedFile({
  folder,
  originalname,
  buffer,
  mimetype,
  makePublic = true,
}) {
  const filename = safeFileName(originalname);
  const storagePath = `${folder}/${filename}`;
  const bucket = getFirebaseBucket();

  if (bucket) {
    const file = bucket.file(storagePath);
    await file.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    if (makePublic) {
      const [publicUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '12-31-2491',
      });
      return {
        filename,
        storagePath,
        publicUrl,
      };
    }

    return {
      filename,
      storagePath,
      publicUrl: '',
    };
  }

  const localFolder = path.join(process.cwd(), 'uploads', folder);
  await fs.mkdir(localFolder, { recursive: true });
  const localPath = path.join(localFolder, filename);
  await fs.writeFile(localPath, buffer);

  return {
    filename,
    storagePath: localPath,
    publicUrl: `/uploads/${folder}/${filename}`,
  };
}
