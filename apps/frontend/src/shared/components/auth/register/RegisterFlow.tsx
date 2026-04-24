'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import { StepOneDetails } from './StepOneDetails';
import { StepTwoOtp } from './StepTwoOtp';

interface FormData {
  full_name: string;
  email: string;
  role: string;
}

const variants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

export function RegisterFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  function handleStepOneSuccess(data: FormData) {
    setFormData(data);
    setStep(2);
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
                        role: formData.role,
                      }
                    : undefined
                }
                onSuccess={handleStepOneSuccess}
              />
            )}
            {step === 2 && (
              <StepTwoOtp
                email={formData.email ?? ''}
                role={formData.role ?? ''}
                onBack={() => setStep(1)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
