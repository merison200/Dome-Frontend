import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Building2, Building, LayoutDashboard, Briefcase, GlassWater,
  BarChart2, CalendarDays, CreditCard, Bell, ChevronRight,
  Home, Users, MessageCircle, Menu, PieChart, FileText, Zap
} from 'lucide-react';

import HallList from './halls/HallList';
import HallForm from './halls/HallForm';
import HallDetails from './halls/HallDetails';

import ClubEventForm from './club/ClubEventForm';
import ClubEventList from './club/ClubEventList';
import ClubEventDetails from './club/ClubEventDetails';

import LoungeEventList from './lounge/LoungeEventList';
import LoungeEventForm from './lounge/LoungeEventForm';
import LoungeEventDetails from './lounge/LoungeEventDetails';

import AnalyticsDashboard from '../../pages/admin/halls/AnalyticsDashboard';
import InquiryManagement from '../../pages/admin/inquiry/InquiryManagement';
import UserManagement from '../../pages/admin/inquiry/UserManagement';

import BookingManagement from '../../pages/admin/halls/BookingManagement';
import OfflineBookingForm from '../../pages/admin/halls/OfflineBookingForm';
import BookingDetails from '../../pages/admin/halls/BookingDetails';

import PaymentManagement from '../../pages/admin/halls/PaymentManagement';
import TransferVerification from '../../pages/admin/halls/TransferVerification';

import NotificationCenter from '../../pages/admin/halls/NotificationCenter';
import AdminChatPage from '../../pages/admin/chat/AdminChatPage';

import { notificationAPI } from '../../services/hallNotification';
import HallPerformanceTable from '../../pages/admin/halls/HallPerformanceTable';
import { useChatNotifications } from '../../services/useChatNotifications';

import DashboardOverview from './DashboardOverview';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
  category?: string;
}

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const { unreadChatCount } = useChatNotifications();

  // Poll for unread notifications
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationAPI.getUnreadCount();
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simplified flat navigation structure
  const navigationItems: NavigationItem[] = [
    // Overview
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard', category: 'overview' },
    
    // Hall Management
    { id: 'halls', name: 'Halls', icon: Building2, href: '/admin/halls', category: 'halls' },
    { id: 'bookings', name: 'Bookings', icon: CalendarDays, href: '/admin/bookings', category: 'halls' },
    { id: 'offline-booking', name: 'Offline Booking', icon: CalendarDays, href: '/admin/bookings/offline', category: 'halls' },
    { id: 'payments', name: 'Payments', icon: CreditCard, href: '/admin/payments', category: 'halls' },
    { id: 'transfer-verification', name: 'Transfers', icon: FileText, href: '/admin/payments/transfer-verification', category: 'halls' },
    { id: 'analytics', name: 'Analytics', icon: BarChart2, href: '/admin/analytics/dashboard', category: 'halls' },
    { id: 'performance', name: 'Performance', icon: PieChart, href: '/admin/analytics/hall-performance', category: 'halls' },
    { id: 'notifications', name: 'Notifications', icon: Bell, href: '/admin/notifications', badge: unreadCount, category: 'halls' },
    
    // Chat
    { id: 'chat', name: 'Messages', icon: MessageCircle, href: '/admin/chat', badge: unreadChatCount, category: 'chat' },
    
    // Club & Lounge
    { id: 'club-events', name: 'Club Events', icon: Building, href: '/admin/club/events', category: 'events' },
    { id: 'lounge-events', name: 'Lounge Events', icon: GlassWater, href: '/admin/lounge/events', category: 'events' },
    
    // Management
    { id: 'inquiry', name: 'Inquiries', icon: Briefcase, href: '/admin/inquiry', category: 'management' },
    { id: 'users', name: 'Users', icon: Users, href: '/admin/users', category: 'management' },
  ];

  // Group items by category for visual separation
  const categories = {
    overview: { items: navigationItems.filter(item => item.category === 'overview') },
    halls: { items: navigationItems.filter(item => item.category === 'halls') },
    chat: { items: navigationItems.filter(item => item.category === 'chat') },
    events: { items: navigationItems.filter(item => item.category === 'events') },
    management: { items: navigationItems.filter(item => item.category === 'management') },
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Simplified Sidebar - Shorter Width */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 shadow-sm flex flex-col`}>
        {/* Header */}
        <div className="px-3 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">Dome Admin</h1>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation - Simplified */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {/* Dashboard */}
          {categories.overview.items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.id}
                to={item.href}
                className={`flex items-center px-3 py-2.5 mx-1 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="ml-2.5 text-sm font-medium">{item.name}</span>
                )}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {sidebarOpen && (
            <>
              {/* Hall Management Section */}
              <div className="px-3 py-1 mt-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hall Management</h3>
              </div>
              
              {categories.halls.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center px-3 py-2 mx-1 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-2.5 text-sm">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center text-[10px]">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Events Section */}
              <div className="px-3 py-1 mt-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Events</h3>
              </div>
              
              {categories.events.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center px-3 py-2 mx-1 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-2.5 text-sm">{item.name}</span>
                  </Link>
                );
              })}

              {/* Management Section */}
              <div className="px-3 py-1 mt-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</h3>
              </div>
              
              {categories.management.items.concat(categories.chat.items).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center px-3 py-2 mx-1 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-red-50 text-red-700 border-l-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="ml-2.5 text-sm">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-1 py-0.5 rounded-full min-w-[16px] text-center text-[10px]">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </>
          )}

          {/* Collapsed View */}
          {!sidebarOpen && (
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`flex items-center justify-center p-2.5 mx-1 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={item.name}
                  >
                    <Icon className="w-4 h-4" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
            <div className="text-xs text-gray-400 text-center">
              <p>Dome Admin v2.0</p>
              <p>© 2025 Dome Venues</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Minimalist Header - No Text */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="h-16"></div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Routes>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />

            {/* Hall Routes */}
            <Route path="halls" element={<HallList />} />
            <Route path="halls/new" element={<HallForm mode="create" />} />
            <Route path="halls/:id/edit" element={<HallForm mode="edit" />} />
            <Route path="halls/:id" element={<HallDetails />} />

            {/* Club Routes */}
            <Route path="club/events" element={<ClubEventList />} />
            <Route path="club/events/new" element={<ClubEventForm mode="create" />} />
            <Route path="club/events/:id/edit" element={<ClubEventForm mode="edit" />} />
            <Route path="club/events/:id" element={<ClubEventDetails />} />

            {/* Lounge Routes */}
            <Route path="lounge/events" element={<LoungeEventList />} />
            <Route path="lounge/events/new" element={<LoungeEventForm mode="create" />} />
            <Route path="lounge/events/:id/edit" element={<LoungeEventForm mode="edit" />} />
            <Route path="lounge/events/:id" element={<LoungeEventDetails />} />

            {/* Analytics Routes */}
            <Route path="analytics/dashboard" element={<AnalyticsDashboard />} />
            <Route path="analytics/hall-performance" element={<HallPerformanceTable />} />

            {/* Booking Routes */}
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="bookings/offline" element={<OfflineBookingForm />} />
            <Route path="bookings/:id" element={<BookingDetails />} />

            {/* Payment Routes */}
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="payments/transfer-verification" element={<TransferVerification />} />

            {/* Notification Routes */}
            <Route path="notifications" element={<NotificationCenter />} />

            {/* Chat Routes */}
            <Route path="chat" element={<AdminChatPage />} />

            {/* Inquiry Routes */}
            <Route path="inquiry" element={<InquiryManagement />} />

            {/* User Routes */}
            <Route path="users" element={<UserManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;