'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import { StepOneDetails } from './StepOneDetails';
import { StepTwoOtp } from './StepTwoOtp';
import { StepThreePending } from './StepThreePending';

interface FormData {
  full_name: string;
  email: string;
}

interface Toast {
  id: number;
  message: string;
}

const variants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

export function RegisterFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [direction, setDirection] = useState<1 | -1>(1);

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function goToStep(next: 1 | 2 | 3) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleStepOneSuccess(data: FormData) {
    setFormData(data);
    goToStep(2);
  }

  function handleStepTwoSuccess() {
    goToStep(3);
  }

  function handleBack() {
    goToStep(1);
  }

  return (
    <div className="w-full">
      <StepIndicator currentStep={step} />

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            {step === 1 && (
              <StepOneDetails
                defaultValues={
                  formData.full_name
                    ? {
                        full_name: formData.full_name,
                        email: formData.email,
                      }
                    : undefined
                }
                onSuccess={handleStepOneSuccess}
                onToast={showToast}
              />
            )}
            {step === 2 && (
              <StepTwoOtp
                email={formData.email ?? ''}
                onSuccess={handleStepTwoSuccess}
                onBack={handleBack}
                onToast={showToast}
              />
            )}
            {step === 3 && (
              <StepThreePending
                fullName={formData.full_name ?? ''}
                email={formData.email ?? ''}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-sm"
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
