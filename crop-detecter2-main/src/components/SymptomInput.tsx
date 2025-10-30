import React from 'react';
import { MessageSquare, Leaf } from 'lucide-react';

interface SymptomInputProps {
  symptoms: string;
  cropType: string;
  onSymptomsChange: (symptoms: string) => void;
  onCropTypeChange: (cropType: string) => void;
}

const CROP_TYPES = [
  'Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 'Soybean',
  'Sugarcane', 'Banana', 'Apple', 'Grapes', 'Citrus', 'Other'
];

export const SymptomInput: React.FC<SymptomInputProps> = ({
  symptoms,
  cropType,
  onSymptomsChange,
  onCropTypeChange,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Leaf className="h-4 w-4 mr-2 text-green-600" />
          Crop Type
        </label>
        <select
          value={cropType}
          onChange={(e) => onCropTypeChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select crop type</option>
          {CROP_TYPES.map((crop) => (
            <option key={crop} value={crop}>
              {crop}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
          Describe symptoms (optional)
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          placeholder="Describe symptoms in detail: leaf spots, discoloration, wilting, growth patterns, affected areas, timing of symptoms, weather conditions, etc. The more details you provide, the better our recommendations will be."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          Example: "Yellow spots on tomato leaves, starting from bottom leaves, spots have dark borders, leaves are curling, noticed after recent rain"
        </p>
      </div>
    </div>
  );
};