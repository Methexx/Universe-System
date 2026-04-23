import React from 'react';
import clsx from 'clsx';
import { ImagePlus } from 'lucide-react';

interface FileUploadInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  containerClassName?: string;
  placeholderText?: string;
}

export function FileUploadInput({ label, error, containerClassName, placeholderText = "Browse Files", className, ...props }: FileUploadInputProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', containerClassName)}>
      <label className="text-[13px] font-bold text-[#475569] tracking-wide">{label}</label>
      <div className="relative">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        <div 
          className={clsx(
            "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow flex items-center justify-between pointer-events-none",
            error && "border-red-500",
            className
          )}
        >
          <span>{placeholderText}</span>
          <ImagePlus className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
}
