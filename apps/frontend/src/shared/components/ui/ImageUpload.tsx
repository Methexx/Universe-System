"use client";

import React, { useRef, useState } from 'react';
import { X, UploadCloud, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  previewUrl: string | null;
  onClear: () => void;
}

export function ImageUpload({ onImageSelect, previewUrl, onClear }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!previewUrl ? (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <UploadCloud className="w-6 h-6" />
            </div>
            
            <div className="text-center">
              <p className="text-[14px] font-bold text-slate-700">Click to upload or drag and drop</p>
              <p className="text-[12px] text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview-area"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden group border border-slate-200 h-48"
          >
            <Image 
              src={previewUrl} 
              alt="Preview" 
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105" 
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-slate-700 hover:text-indigo-500 shadow-lg transition-transform hover:scale-110"
              >
                <FileImage className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onClear}
                className="p-2 bg-white rounded-full text-slate-700 hover:text-red-500 shadow-lg transition-transform hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
