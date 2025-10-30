import React, { useCallback, useState } from 'react';
import { Upload, Camera, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemoveImage: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  selectedImage,
  onRemoveImage,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onRemoveImage();
  };

  if (selectedImage && imagePreview) {
    return (
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden border-2 border-green-200">
          <img
            src={imagePreview}
            alt="Crop preview"
            className="w-full h-64 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <Upload className="h-12 w-12 text-green-500" />
          <Camera className="h-12 w-12 text-green-500" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700">
            Upload crop image for analysis
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Drag and drop or click to select an image of your crop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supports JPG, PNG, WEBP (Max 10MB)
          </p>
        </div>
      </div>
    </div>
  );
};