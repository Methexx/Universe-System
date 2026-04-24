'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  shake?: boolean;
}

export function OtpInput({ value, onChange, disabled, hasError, shake }: OtpInputProps) {
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function focusAt(index: number) {
    refs.current[Math.max(0, Math.min(5, index))]?.focus();
  }

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;
    const next = digits.map((d, i) => (i === index ? char : d)).join('').replace(/ /g, '');
    onChange(next);
    if (index < 5) focusAt(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index] && digits[index] !== ' ') {
        const next = digits.map((d, i) => (i === index ? '' : d)).join('').padEnd(6, ' ').slice(0, 6);
        onChange(next.trimEnd());
      } else {
        focusAt(index - 1);
        const prev = index - 1;
        if (prev >= 0) {
          const next = digits.map((d, i) => (i === prev ? '' : d)).join('').trimEnd();
          onChange(next);
        }
      }
    } else if (e.key === 'ArrowLeft') {
      focusAt(index - 1);
    } else if (e.key === 'ArrowRight') {
      focusAt(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(5, pasted.length));
  }

  const borderClass = hasError
    ? 'border-red-500 bg-red-50'
    : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600';

  return (
    <div
      className={`flex gap-2 justify-center ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
      onPaste={handlePaste}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' || !digits[i] ? '' : digits[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className={`w-11 h-12 text-center text-lg font-semibold rounded-lg border outline-none transition-all ${borderClass} disabled:opacity-50`}
        />
      ))}
    </div>
  );
}
