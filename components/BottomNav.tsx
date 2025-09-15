import React from 'react';
import { HomeIcon, GroupIcon, MessagesIcon, PlusCircleIcon, UserIcon } from './Icons';
import { ActiveView } from '../src/types';

interface BottomNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onShowPostCreator?: () => void;
}

const NavItem: React.FC<{
  label: string;
  // FIX: Updated the type for the 'icon' prop to ensure it can accept a className.
  // This is necessary for React.cloneElement to pass props without a type error.
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  iconSize?: string;
}> = ({ label, icon, isActive, onClick, iconSize = 'w-6 h-6' }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-1 transition-colors duration-200 ${
      isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
    }`}
    aria-label={label}
  >
    {React.cloneElement(icon, { className: iconSize })}
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, onShowPostCreator }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-around z-50">
      <NavItem label="Home" icon={<HomeIcon />} isActive={activeView === 'feed'} onClick={() => onNavigate('feed')} iconSize="w-5 h-5" />
      <NavItem label="Network" icon={<GroupIcon />} isActive={activeView === 'network'} onClick={() => onNavigate('network')} iconSize="w-5 h-5" />
      <NavItem label="Post" icon={<PlusCircleIcon />} isActive={false} onClick={() => {
        console.log('Post button clicked!');
        onShowPostCreator?.();
      }} iconSize="w-7 h-7" />
      <NavItem label="Messages" icon={<MessagesIcon />} isActive={activeView === 'messages'} onClick={() => onNavigate('messages')} iconSize="w-5 h-5" />
      <NavItem label="Me" icon={<UserIcon />} isActive={activeView === 'me'} onClick={() => onNavigate('me')} iconSize="w-5 h-5" />
    </div>
  );
};

export default BottomNav;