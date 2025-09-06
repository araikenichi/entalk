import React, { useState } from 'react';
import { User } from '../../types';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email';

interface AuthFlowProps {
  onLogin: (user: User) => void;
}

const AuthFlow: React.FC<AuthFlowProps> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [userForVerification, setUserForVerification] = useState<User | null>(null);

  const handleSignUpSuccess = (user: User) => {
    setUserForVerification(user);
    setCurrentView('verify-email');
  };

  const renderView = () => {
    switch (currentView) {
      case 'signup':
        return <SignUp onSwitchToLogin={() => setCurrentView('login')} onSignUpSuccess={handleSignUpSuccess} />;
      case 'forgot-password':
        return <ForgotPassword onSwitchToLogin={() => setCurrentView('login')} onLinkSent={() => setCurrentView('login')} />;
      case 'reset-password':
        return <ResetPassword onSwitchToLogin={() => setCurrentView('login')} />;
      case 'verify-email':
        return userForVerification ? <VerifyEmail user={userForVerification} onContinue={() => onLogin(userForVerification)} /> : <Login onSwitchToSignUp={() => setCurrentView('signup')} onLogin={onLogin} onForgotPassword={() => setCurrentView('forgot-password')} />;
      case 'login':
      default:
        return <Login onSwitchToSignUp={() => setCurrentView('signup')} onLogin={onLogin} onForgotPassword={() => setCurrentView('forgot-password')} />;
    }
  };

  return <>{renderView()}</>;
};

export default AuthFlow;
