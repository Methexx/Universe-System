'use client';

interface PasswordStrengthBarProps {
  password: string;
}

function getStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
}

const levels = [
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-amber-400' },
  { label: 'Strong', color: 'bg-green-500' },
];

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = getStrength(password);
  if (!password) return null;

  const level = levels[strength - 1];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength ? level.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-green-600'
      }`}>
        {level.label}
      </p>
    </div>
  );
}
