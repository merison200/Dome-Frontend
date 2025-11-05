import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Clock,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Users,
  Building2,
  ExternalLink,
  Filter,
  Search,
  X
} from 'lucide-react';
import {
  notificationAPI,
  Notification,
  NotificationSummary,
  NotificationCounts,
  NotificationType
} from '../../../services/hallNotification';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [counts, setCounts] = useState<NotificationCounts['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, selectedType, selectedPriority, searchQuery]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [notificationsData, countsData] = await Promise.all([
        notificationAPI.getNotifications(),
        notificationAPI.getNotificationCounts()
      ]);
      
      setNotifications(notificationsData.notifications);
      setSummary(notificationsData.summary);
      setLastUpdated(notificationsData.lastUpdated);
      setCounts(countsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (selectedType !== 'all') {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === selectedPriority);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.details.customerName.toLowerCase().includes(query) ||
        n.details.hallName.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(filtered);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap = {
      pending_booking: Calendar,
      transfer_verification: CreditCard,
      payment_failed: AlertTriangle,
      payment_completed: CheckCircle
    };
    return iconMap[type] || Bell;
  };

  const getNotificationIconColor = (type: NotificationType, priority: string) => {
    if (priority === 'urgent') {
      return 'text-red-600 bg-red-50';
    }
    
    const colorMap = {
      pending_booking: 'text-blue-600 bg-blue-50',
      transfer_verification: 'text-orange-600 bg-orange-50',
      payment_failed: 'text-red-600 bg-red-50',
      payment_completed: 'text-green-600 bg-green-50'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-50';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-yellow-100 text-yellow-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[priority as keyof typeof badges] || badges.low}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const StatCard = ({ title, value, color }: {
    title: string;
    value: number;
    color: string;
  }) => (
    <div className="bg-white rounded-2xl border border-gray-200/60 p-6">
      <div>
        <p className="text-sm text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
    const Icon = getNotificationIcon(notification.type);
    const iconColorClass = getNotificationIconColor(notification.type, notification.priority);
    const actionUrl = notificationAPI.getActionUrl(notification);
    const actionText = notificationAPI.getActionButtonText(notification.type);

    return (
      <div className={`bg-white rounded-2xl border border-gray-200/60 p-6 hover:shadow-sm transition-all ${
        notification.priority === 'urgent' ? 'border-red-200 bg-red-50/30' : 
        notification.priority === 'high' ? 'border-yellow-200' : ''
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                {getPriorityBadge(notification.priority)}
              </div>
              <p className="text-gray-600 mb-3">{notification.message}</p>
            </div>
          </div>
          <span className="text-sm text-gray-500 flex-shrink-0">
            {notificationAPI.formatNotificationTime(notification.createdAt)}
          </span>
        </div>

        {/* Notification Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {notification.details.customerName && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Customer:</span> {notification.details.customerName}
            </div>
          )}
          {notification.details.hallName && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Hall:</span> {notification.details.hallName}
            </div>
          )}
          {notification.details.amount && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> {notificationAPI.formatCurrency(notification.details.amount).replace('NGN', '₦')}
            </div>
          )}
          {notification.details.eventDate && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Event Date:</span> {notificationAPI.formatDate(notification.details.eventDate)}
            </div>
          )}
        </div>

        {/* Contact Information */}
        {(notification.details.customerEmail || notification.details.customerPhone) && (
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              {notification.details.customerEmail && (
                <div>Email: {notification.details.customerEmail}</div>
              )}
              {notification.details.customerPhone && (
                <div>Phone: {notification.details.customerPhone}</div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {notification.actionRequired && (
          <div className="flex justify-end">
            <Link
              to={actionUrl}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
            >
              {actionText}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications Center</h1>
              <p className="text-gray-600 mt-2">
                {summary ? notificationAPI.getSummaryText(summary) : 'Manage and review all system notifications'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated ? notificationAPI.formatNotificationTime(lastUpdated) : '--'}
              </div>
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 border border-gray-300 shadow-sm"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Consolidated Stats Card */}
        {summary && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-gray-500 text-sm font-medium">Pending Bookings</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{summary.byType.pendingBookings}</div>
              </div>

              <div className="text-center">
                <div className="text-gray-500 text-sm font-medium">Transfer Verifications</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{summary.byType.pendingTransfers}</div>
              </div>

              <div className="text-center">
                <div className="text-gray-500 text-sm font-medium">Failed Payments</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{summary.byType.failedPayments}</div>
              </div>

              <div className="text-center">
                <div className="text-gray-500 text-sm font-medium">Completed Payments</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{summary.byType.completedPayments}</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as NotificationType | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pending_booking">Pending Bookings</option>
              <option value="transfer_verification">Transfer Verifications</option>
              <option value="payment_failed">Failed Payments</option>
              <option value="payment_completed">Completed Payments</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="flex items-center justify-center space-x-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors py-2"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Notifications</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchAllData}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {notifications.length === 0 ? 'No notifications' : 'No matching notifications'}
              </h3>
              <p className="text-gray-600">
                {notifications.length === 0 
                  ? 'All caught up! No new notifications at this time.' 
                  : 'Try adjusting your filters to see more notifications.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Showing {filteredNotifications.length} of {notifications.length} notifications
                </p>
              </div>
              
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;