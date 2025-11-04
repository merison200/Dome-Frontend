import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Building2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { userManagementAPI, User, Analytics } from '../../services/userManagement';
import { analyticsAPI, type DashboardOverview, type HallPerformance } from '../../services/hallAnalytics';

const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState<Analytics | null>(null);
  const [hallAnalytics, setHallAnalytics] = useState<DashboardOverview | null>(null);
  const [hallPerformance, setHallPerformance] = useState<HallPerformance[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [userData, hallOverview, performanceData, usersData] = await Promise.all([
        userManagementAPI.getAnalytics(),
        analyticsAPI.getDashboardOverview(),
        analyticsAPI.getHallPerformance(),
        userManagementAPI.getUsers({ page: 1, limit: 5 })
      ]);

      setUserAnalytics(userData);
      setHallAnalytics(hallOverview);
      setHallPerformance(performanceData);
      setRecentUsers(usersData.users);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Section - No Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Users</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {userAnalytics?.totalStats.totalUsers || 0}
              </p>
              <p className="text-red-600 text-xs mt-2">{userAnalytics?.totalStats.activeUsers || 0} active</p>
            </div>

            <div className="border-b sm:border-b-0 lg:border-r border-gray-100 pb-6 sm:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {formatCurrency(hallAnalytics?.totalRevenue || 0).replace('NGN', '₦').split('.')[0]}
              </p>
              <p className="text-red-600 text-xs mt-2">
                {formatCurrency(hallAnalytics?.monthlyRevenue || 0).replace('NGN', '₦').split('.')[0]} monthly
              </p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {hallAnalytics?.totalBookings || 0}
              </p>
              <p className="text-red-600 text-xs mt-2">{hallAnalytics?.monthlyBookings || 0} this month</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Active Halls</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {hallPerformance.length}
              </p>
              <p className="text-red-600 text-xs mt-2">
                {hallPerformance.filter(hall => hall.totalBookings > 5).length} performing well
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Hall Performance Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Hall Performance</h2>
                  <p className="text-gray-500 text-sm mt-1">Top performing venues</p>
                </div>
                <Link 
                  to="/admin/analytics/hall-performance"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <span className="hidden sm:inline">View All</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="space-y-1">
                {hallPerformance.slice(0, 5).map((hall, index) => (
                  <div 
                    key={hall._id}
                    className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{hall.name}</p>
                          <p className="text-xs text-gray-500 truncate">{hall.location}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <p className="font-bold text-red-600">
                          {formatCurrency(hall.totalRevenue).replace('NGN', '₦').split('.')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{hall.totalBookings} bookings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Users Card */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent Users</h2>
                  <p className="text-gray-500 text-sm mt-1">Latest registrations</p>
                </div>
                <Link 
                  to="/admin/users"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <span className="hidden sm:inline">View All</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="space-y-1">
                {recentUsers.map((user) => (
                  <div 
                    key={user._id}
                    className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : user.role === 'staff'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{user.totalBookings} bookings</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;