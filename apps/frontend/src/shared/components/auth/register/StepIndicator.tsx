import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2;
}

const steps = [
  { label: 'Your details', sub: 'Name and email' },
  { label: 'Verify email', sub: 'Check your inbox' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-start w-full mb-8">
      {steps.map((step, index) => {
        const stepNum = (index + 1) as 1 | 2;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-start flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600'
                    : isActive
                    ? 'bg-blue-600'
                    : 'border-2 border-gray-300 bg-white'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} className="text-white" strokeWidth={3} />
                ) : isActive ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-white block" />
                ) : null}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{step.sub}</p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mt-4 mx-2">
                <div className={`h-0.5 w-full transition-colors duration-300 ${stepNum < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
