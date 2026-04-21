import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import type { Express } from "express";
import * as sharp from "sharp";

// Bucket definitions
export const LISTING_BUCKET_URL = `https://images.mertcin.com`;
export const MESSAGE_BUCKET_URL = `message-images.mertcin.com`;
export const LISTING_BUCKET_NAME = "enterprise-listings";
export const MESSAGE_BUCKET_NAME = "enterprise-message-files";

// R2 client'ı oluştur
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!, 
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!, 
  },
});

// İzin verilen dosya uzantıları
const ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic"];
const ALLOWED_DOCUMENT_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".csv",
  ".odt",
  ".ods",
  ".odp",
];
const ALLOWED_ARCHIVE_TYPES = [".zip", ".rar"];
// iPhone formats added and video/audio formats updated
const ALLOWED_MEDIA_TYPES = [
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a", // iPhone audio recording format
  ".mp4",
  ".webm",
  ".mov", // iPhone video format
  ".m4v", // iPhone video format
];

// Dosya boyut limitleri (byte cinsinden)
const IMAGE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB - New limit for all image uploads
const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB

// Function to check file type
export function isAllowedFileType(filename: string): {
  allowed: boolean;
  type?: string;
} {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  if (ALLOWED_IMAGE_TYPES.includes(ext))
    return { allowed: true, type: "image" };
  if (ALLOWED_DOCUMENT_TYPES.includes(ext))
    return { allowed: true, type: "document" };
  if (ALLOWED_ARCHIVE_TYPES.includes(ext))
    return { allowed: true, type: "archive" };
  if (ALLOWED_MEDIA_TYPES.includes(ext))
    return { allowed: true, type: "media" };

  return { allowed: false };
}

// Function to check file size
export function isAllowedFileSize(size: number, type: string): boolean {
  if (type === "image") return size <= IMAGE_SIZE_LIMIT;
  return size <= FILE_SIZE_LIMIT;
}

// Create URL for message file
export function getMessageFileUrl(key: string): string {
  if (!key) return "";
  return `https://${MESSAGE_BUCKET_URL}/${key}`;
}

// Create multiple message file URLs
export function getMessageFilesUrls(keys: string[]): string[] {
  if (!keys || !Array.isArray(keys)) return [];
  return keys.map((key) => getMessageFileUrl(key));
}

// Helper function to determine file type
export function getFileType(filename: string): string {
  const { type } = isAllowedFileType(filename);
  return type || "unknown";
}

// Helper function to convert image file to webp format
async function convertImageToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .webp({ quality: 80 }) // 80% quality - optimum compression/quality ratio
      .toBuffer();
  } catch (error) {
    console.error("WebP conversion error:", error);
    throw new Error("Error converting image to WebP format");
  }
}

// Function to upload message files
export async function uploadMessageFile(
  file: Express.Multer.File
): Promise<string> {
  const { allowed, type } = isAllowedFileType(file.originalname);
  if (!allowed) {
    throw new Error("File type not allowed");
  }

  if (!isAllowedFileSize(file.size, type!)) {
    throw new Error(
      `File size is too large. Maximum size: ${
        type === "image" ? "20MB" : "20MB"
      }`
    );
  }

  let processedBuffer = file.buffer;
  let finalMimeType = file.mimetype;

  // Determine the correct extension according to the mime type
  const extension = finalMimeType.split("/")[1];
  const timestamp = Date.now();
  const fileName = `messages/${timestamp}-${
    file.originalname.split(".")[0]
  }.${extension}`;

  // If the file is an image, convert to WebP
  if (type === "image" && ALLOWED_IMAGE_TYPES.includes(file.originalname)) {
    try {
      processedBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();
      finalMimeType = "image/webp";
    } catch (error) {
      console.error("WebP dönüşüm hatası:", error);
      throw new Error("Resim WebP formatına dönüştürülürken hata oluştu");
    }
  }

  // Eğer yüklenen dosya bir resim ise WebP'ye dönüştür
  if (type === "image") {
    try {
      processedBuffer = await convertImageToWebP(file.buffer);
      finalMimeType = "image/webp";
    } catch (error) {
      console.error("Resim dönüştürme hatası:", error);
      throw new Error("Resim dönüştürülürken bir hata oluştu");
    }
  }

  const key = fileName;

  // Dosyayı yükle
  await r2Client.send(
    new PutObjectCommand({
      Bucket: MESSAGE_BUCKET_NAME,
      Key: key,
      Body: processedBuffer,
      ContentType: finalMimeType,
      ACL: "public-read",
    })
  );

  return key;
}

// Mesaj dosyasını silmek için fonksiyon
export async function deleteMessageFile(key: string): Promise<void> {
  if (!key) {
    console.log("Boş dosya anahtarı, işlem atlanıyor");
    return;
  }

  console.log("Dosya silme işlemi başlatıldı:", key);

  try {
    // Önce dosyanın varlığını kontrol et
    try {
      await r2Client.send(
        new HeadObjectCommand({
          Bucket: MESSAGE_BUCKET_NAME,
          Key: key,
        })
      );
      console.log("Dosya bulundu, silme işlemi başlıyor:", key);
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        console.log(`Dosya zaten silinmiş veya mevcut değil: ${key}`);
        return;
      }
      throw error; // Diğer hataları yukarı fırlat
    }

    // Dosyayı sil
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: MESSAGE_BUCKET_NAME,
        Key: key,
      })
    );

    console.log("Dosya başarıyla silindi:", key);
  } catch (error: any) {
    console.error("Dosya silme hatası:", error);
    throw new Error(`Dosya silinirken hata oluştu: ${error.message}`);
  }
}

// Profil resmi yüklemek için fonksiyon
export async function uploadProfileImage(
  file: Express.Multer.File, 
  userId: number
): Promise<string> {
  const { allowed, type } = isAllowedFileType(file.originalname);
  
  if (!allowed || type !== 'image') {
    throw new Error("Sadece resim dosyaları yüklenebilir");
  }

  if (!isAllowedFileSize(file.size, type)) {
    throw new Error("Dosya boyutu çok büyük. Maksimum boyut: 5MB");
  }

  // Resmi optimize et
  let processedBuffer;
  try {
    processedBuffer = await sharp(file.buffer)
      .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error("Resim optimizasyon hatası:", error);
    throw new Error("Resim işlenirken bir hata oluştu");
  }

  // Dosya adını oluştur
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const fileName = `profiles/profile_${userId}_${timestamp}_${random}.webp`;

  // Dosyayı yükle
  await r2Client.send(
    new PutObjectCommand({
      Bucket: LISTING_BUCKET_NAME,
      Key: fileName,
      Body: processedBuffer,
      ContentType: 'image/webp',
      ACL: "public-read",
    })
  );

  return fileName;
}

// Listing resmi için URL oluşturma
export function getListingImageUrl(key: string): string {
  if (!key) return "";
  
  // Eğer zaten tam URL ise olduğu gibi döndür
  if (key.startsWith("http")) {
    return key;
  }
  
  // Eğer yeni format (listings/ ile başlayan) ise
  if (key.startsWith("listings/")) {
    return `${LISTING_BUCKET_URL}/${key}`;
  }
  
  // Eğer eski format ise (sadece dosya adı)
  return `${LISTING_BUCKET_URL}/${key}`;
}

// Birden fazla listing resmi URL'si oluşturma
export function getListingImagesUrls(keys: string[]): string[] {
  if (!keys || !Array.isArray(keys)) return [];
  return keys.map((key) => getListingImageUrl(key));
}
