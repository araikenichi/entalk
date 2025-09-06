import React from 'react';
import { HomeIcon, GroupIcon, MessagesIcon, SearchIcon, UserIcon } from './Icons';
import { ActiveView } from '../types';

interface BottomNavProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

const NavItem: React.FC<{
  label: string;
  // FIX: Updated the type for the 'icon' prop to ensure it can accept a className.
  // This is necessary for React.cloneElement to pass props without a type error.
  icon: React.ReactElement<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-6 h-6' })}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[69px] bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-around z-50">
      <NavItem label="Home" icon={<HomeIcon />} isActive={activeView === 'feed'} onClick={() => onNavigate('feed')} />
      <NavItem label="Network" icon={<GroupIcon />} isActive={activeView === 'network'} onClick={() => onNavigate('network')} />
      <NavItem label="Search" icon={<SearchIcon />} isActive={activeView === 'search'} onClick={() => onNavigate('search')} />
      <NavItem label="Messages" icon={<MessagesIcon />} isActive={activeView === 'messages'} onClick={() => onNavigate('messages')} />
      <NavItem label="Me" icon={<UserIcon />} isActive={activeView === 'me'} onClick={() => onNavigate('me')} />
    </div>
  );
};

export default BottomNav;