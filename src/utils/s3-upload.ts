/**
 * AWS S3 파일 업로드 유틸리티
 * 대용량 파일(이미지, 동영상)을 S3에 업로드하는 함수
 */

import { projectId, publicAnonKey } from './supabase/info';

interface UploadOptions {
  file: File;
  folder?: string; // 'profile', 'products', 'posts' 등
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * S3에 파일 업로드 (서버를 통해)
 * 보안을 위해 서버에서 signed URL을 생성하여 업로드
 */
export async function uploadToS3({
  file,
  folder = 'uploads',
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  try {
    // 1. 서버에 Presigned URL 요청
    const filename = `${folder}/${Date.now()}-${file.name}`;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c6687586/s3/presigned-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          filename,
          contentType: file.type,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Presigned URL 생성 실패');
    }

    const { presignedUrl, key } = await response.json();

    // 2. Presigned URL로 직접 S3에 업로드
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('S3 업로드 실패');
    }

    // 3. 업로드된 파일의 공개 URL 반환
    const publicUrl = presignedUrl.split('?')[0];

    return {
      success: true,
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error('S3 업로드 에러:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '업로드 실패',
    };
  }
}

/**
 * S3에서 파일 삭제
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-c6687586/s3/delete`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ key }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('S3 삭제 에러:', error);
    return false;
  }
}

/**
 * 이미지 파일 압축 (업로드 전 용량 줄이기)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 최대 너비 제한
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('이미지 압축 실패'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * 파일 크기 검증
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 파일 타입 검증
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some((type) => file.type.startsWith(type));
}
