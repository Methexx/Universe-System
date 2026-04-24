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

const variants = {
  enter: { x: 50, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

export function RegisterFlow() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});

  function goToStep(next: 1 | 2 | 3) {
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
              />
            )}
            {step === 2 && (
              <StepTwoOtp
                email={formData.email ?? ''}
                onSuccess={handleStepTwoSuccess}
                onBack={handleBack}
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
    </div>
  );
}
