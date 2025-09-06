
import React from 'react';
import AuthLayout from './AuthLayout';
import { User } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface VerifyEmailProps {
  user: User;
  onContinue: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ user, onContinue }) => {
    const { t } = useTranslation();

    return (
        <AuthLayout title={t('verifyEmailTitle')}>
            <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                   {t('verifyEmailMessage1')} <span className="font-semibold text-gray-800 dark:text-gray-200">{user.email}</span>. {t('verifyEmailMessage2')}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    {t('verifyEmailCheckSpam')}
                </p>
                <button
                    onClick={onContinue}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {t('verifyEmailContinue')}
                </button>
                 <div className="mt-4 text-sm">
                    {/* In a real app, this would trigger a resend email API call */}
                    <button className="font-medium text-blue-600 hover:text-blue-500">
                       {t('verifyEmailResend')}
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;