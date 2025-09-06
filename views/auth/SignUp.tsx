import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/authService';
import { User } from '../../types';
import AuthLayout from './AuthLayout';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { EyeIcon, EyeOffIcon, LoadingIcon, CameraIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface SignUpProps {
  onSignUpSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    avatar: `https://picsum.photos/seed/newuser${Date.now()}/100/100`,
    bio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar);
      }
    };
  }, [formData.avatar]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // If there's an old blob URL, revoke it first
      if (formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar);
      }
      const newAvatarUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('errorPasswordsDoNotMatch'));
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { confirmPassword, ...signUpData } = formData;
      const newUser = await authService.signUp(signUpData);
      onSignUpSuccess(newUser);
    } catch (err: any) {
      setError(t('errorEmailExists'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t('signUpTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>}
        
        {/* Avatar Uploader */}
        <div className="flex justify-center">
            <div className="relative">
                <img src={formData.avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-md"
                    aria-label="Upload profile picture"
                >
                    <CameraIcon className="w-4 h-4" />
                </button>
            </div>
            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('nameLabel')}</label>
          <input type="text" name="name" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emailLabel')}</label>
          <input type="email" name="email" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumberLabel')}</label>
            <input type="tel" name="phoneNumber" onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('bioLabel')}</label>
            <textarea name="bio" onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" rows={2}/>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('passwordLabel')}</label>
          <div className="mt-1 relative">
            <input type={showPassword ? 'text' : 'password'} name="password" required onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label="Toggle password visibility">
              {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
            </button>
          </div>
          <PasswordStrengthIndicator password={formData.password} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('confirmPasswordLabel')}</label>
          <input type="password" name="confirmPassword" required onChange={handleChange} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-50 dark:bg-gray-800" />
        </div>

        <div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? <LoadingIcon className="animate-spin h-5 w-5 text-white" /> : t('createAccountButton')}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {t('alreadyHaveAccount')}
        {' '}
        <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500">
          {t('signInLink')}
        </button>
      </p>
    </AuthLayout>
  );
};

export default SignUp;