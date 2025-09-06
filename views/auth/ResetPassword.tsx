
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { EyeIcon, EyeOffIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ResetPasswordProps {
  onSwitchToLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordsDoNotMatch'));
      return;
    }
    setError(null);
    // In a real app, you would call an API here with a token from the URL.
    console.log("Password reset successfully.");
    setSuccess(true);
    setTimeout(() => {
        onSwitchToLogin();
    }, 2000);
  };

  return (
    <AuthLayout title={t('resetPasswordTitle')}>
      {success ? (
        <div className="text-center">
            <p className="text-green-600 dark:text-green-400">{t('resetPasswordSuccess')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('resetPasswordNewPassword')}</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('resetPasswordConfirmPassword')}</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('resetPasswordButton')}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;