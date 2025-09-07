
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import { authService } from '../../services/authService';
import { LoadingIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ForgotPasswordProps {
  onLinkSent: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onLinkSent, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await authService.sendPasswordResetLink(email);
    setIsLoading(false);
    setMessage(t('forgotPasswordLinkSent'));
    setTimeout(() => {
      onLinkSent();
    }, 3000);
  };

  return (
    <AuthLayout title={t('forgotPasswordTitle')}>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
        {t('forgotPasswordInstructions')}
      </p>
      {message ? (
        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm text-center">
            {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailLabel')}</label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <LoadingIcon className="animate-spin h-5 w-5" /> : t('forgotPasswordSendLink')}
            </button>
          </div>
        </form>
      )}
      <div className="mt-6 text-center">
        <button onClick={onSwitchToLogin} className="text-sm font-medium text-blue-600 hover:text-blue-500">
            {t('forgotPasswordBackToLogin')}
        </button>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;