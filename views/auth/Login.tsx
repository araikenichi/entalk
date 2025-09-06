
import React from 'react';
import { authService } from '../../services/authService';
import { User } from '../../types';
import AuthLayout from './AuthLayout';
import { EyeIcon, EyeOffIcon, LoadingIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignUp, onForgotPassword }) => {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState('li.wei@example.com'); // Pre-fill for convenience
  const [password, setPassword] = React.useState('password123'); // Pre-fill for convenience
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(t('errorInvalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t('loginTitle')}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('passwordLabel')}</label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-800"
            />
             <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="text-sm">
            <button type="button" onClick={onForgotPassword} className="font-medium text-blue-600 hover:text-blue-500">
              {t('forgotPassword')}
            </button>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingIcon className="animate-spin h-5 w-5 text-white" /> : t('signInButton')}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('notAMember')}
        {' '}
        <button onClick={onSwitchToSignUp} className="font-medium text-blue-600 hover:text-blue-500">
          {t('signUpLink')}
        </button>
      </p>
    </AuthLayout>
  );
};

export default Login;