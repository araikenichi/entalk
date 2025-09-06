
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password = '' }) => {
  const { t } = useTranslation();

  const calculateStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 10) score++; // Keep further length checks for better scores
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  };

  const strength = calculateStrength();
  const strengthLabels = [
    t('strengthTooWeak'),
    t('strengthWeak'),
    t('strengthOkay'),
    t('strengthGood'),
    t('strengthStrong'),
    t('strengthVeryStrong')
  ];
  const strengthColors = [
    'bg-red-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-500'
  ];

  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-1.5 rounded-full ${strength > index ? strengthColors[strength] : 'bg-transparent'}`}
              style={{ width: '100%' }}
            />
          </div>
        ))}
      </div>
      {password && (
        <p className={`text-xs mt-1 ${strength < 3 ? 'text-red-500' : 'text-green-500'}`}>
          {t('passwordStrengthLabel')} {strengthLabels[strength]}
        </p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;