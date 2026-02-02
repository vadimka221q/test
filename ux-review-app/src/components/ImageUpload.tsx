'use client';

import { useCallback, useRef } from 'react';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mediaType: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
}

interface ImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File): Promise<ImageFile | null> => {
    const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: result,
          base64,
          mediaType: file.type as ImageFile['mediaType'],
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return;

      const availableSlots = maxImages - images.length;
      const filesToProcess = Array.from(files).slice(0, availableSlots);

      const processed = await Promise.all(filesToProcess.map(processFile));
      const validImages = processed.filter((img): img is ImageFile => img !== null);

      if (validImages.length > 0) {
        onImagesChange([...images, ...validImages]);
      }
    },
    [images, maxImages, onImagesChange, processFile, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(
    (id: string) => {
      if (!disabled) {
        onImagesChange(images.filter((img) => img.id !== id));
      }
    },
    [images, onImagesChange, disabled]
  );

  const openFilePicker = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={openFilePicker}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50'
          }
          ${images.length >= maxImages ? 'opacity-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || images.length >= maxImages}
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF or WebP (max {maxImages} images)
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {images.length} of {maxImages} images
            </span>
            {!disabled && images.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImagesChange([]);
                }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
                               flex items-center justify-center text-xs font-bold
                               opacity-0 group-hover:opacity-100 transition-opacity
                               hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
                <p className="mt-1 text-xs text-gray-500 truncate" title={image.file.name}>
                  {image.file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { ImageFile };
