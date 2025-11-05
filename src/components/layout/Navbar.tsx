import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Sun, Moon, ShieldCheck, Briefcase, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../ui/AuthModal';
import domeLogo from '../../assests/320679750_490341296533363_5557851170066739253_n.jpg';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Event Halls', href: '/halls' },
    { name: 'Club Coded', href: '/nightclub' },
    { name: 'Circle Lounge', href: '/lounge' },
    { name: 'Office Spaces', href: '/offices' },
    { name: 'Green Fields', href: '/fields' },
  ];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const getDisplayName = () => {
    if (!user) return '';
    if (user.name) {
      const firstName = user.name.split(' ')[0];
      return firstName;
    }
    const emailUsername = user.email?.split('@')[0];
    return emailUsername || '';
  };

  const handleDashboardClick = () => {
    if (user?.role === 'admin' || user?.role === 'staff') navigate('/admin');
    else if (user?.role === 'customer') navigate('/profile');
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                <img 
                  src={domeLogo} 
                  alt="The Dome Logo" 
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              <span className="text-sm lg:text-xl font-bold bg-gradient-to-r from-[#dc2626] to-[#1e3a8a] bg-clip-text text-transparent tracking-tight">
                The Dome
              </span>
            </Link>

            {/* Desktop Navigation - Single Line */}
            <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive(item.href)
                      ? 'text-[#dc2626] border-b-2 border-[#dc2626] dark:border-[#dc2626]'
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#dc2626] hover:border-b-2 hover:border-[#dc2626]'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#dc2626] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300 hidden xl:block whitespace-nowrap">
                    Hi, {getDisplayName()}
                  </span>
                  
                  {/* Desktop: Icon-only buttons */}
                  <button
                    onClick={handleDashboardClick}
                    className="p-2 lg:p-3 bg-gradient-to-r from-[#dc2626] to-[#1e3a8a] text-white rounded-lg hover:from-red-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    title={user.role === 'admin' ? 'Admin Dashboard' : user.role === 'staff' ? 'Staff Dashboard' : 'My Profile'}
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : user.role === 'staff' ? (
                      <Briefcase className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <User className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </button>

                  <button
                    onClick={logout}
                    className="p-2 lg:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#dc2626] transition-colors px-3 lg:px-4 py-2 whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-[#dc2626] to-[#1e3a8a] text-white px-4 lg:px-6 py-2.5 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#dc2626] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-[#dc2626] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="px-2 pt-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'text-[#dc2626] bg-red-50/80 dark:bg-red-900/20 border-b-2 border-[#dc2626]'
                      : 'text-gray-700 dark:text-gray-300 hover:text-[#dc2626] hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {item.name}
                </Link>
              ))}

              {user ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    Hi, {getDisplayName()}
                  </div>
                  <button
                    onClick={() => {
                      handleDashboardClick();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#dc2626] to-[#1e3a8a] text-white font-medium rounded-lg hover:from-red-700 hover:to-blue-700 transition-all duration-200"
                  >
                    {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'staff' ? 'Staff Dashboard' : 'My Profile'}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <button
                    onClick={() => {
                      handleAuthClick('login');
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#dc2626] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('signup');
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#dc2626] to-[#1e3a8a] text-white font-medium rounded-lg hover:from-red-700 hover:to-blue-700 transition-all duration-200"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
};

export default Navbar;