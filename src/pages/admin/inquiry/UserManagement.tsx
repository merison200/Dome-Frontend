import React, { useState, useEffect } from 'react';
import { Search, Filter, Mail, Eye, Users, Calendar, UserCheck, X, Send, MoreVertical, AlertCircle } from 'lucide-react';
import { 
  userManagementAPI, 
  User, 
  Analytics, 
  UsersResponse, 
  UserDetails,
  Filters 
} from '../../../services/userManagement';

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipient: null as User | null
  });
  
  const [roleChangeData, setRoleChangeData] = useState({
    user: null as User | null,
    newRole: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
    limit: 5
  });

  // Load analytics and users on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load users when filters or page changes
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsData, usersData] = await Promise.all([
        userManagementAPI.getAnalytics(),
        userManagementAPI.getUsers({
          page: currentPage,
          limit: usersPerPage,
          search: searchTerm || undefined,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        })
      ]);

      setAnalytics(analyticsData);
      setUsers(usersData.users);
      setPagination(usersData.pagination);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setError(null);
      
      const usersData = await userManagementAPI.getUsers({
        page: currentPage,
        limit: usersPerPage,
        search: searchTerm || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setUsers(usersData.users);
      setPagination(usersData.pagination);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error loading users:', err);
    }
  };

  const loadUserDetails = async (userId: string) => {
    try {
      const details = await userManagementAPI.getUserDetails(userId);
      setUserDetails(details);
    } catch (err) {
      setError('Failed to load user details. Please try again.');
      console.error('Error loading user details:', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userManagementAPI.updateUserRole(userId, { newRole });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole as any } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole as any } : null);
      }
      
      setShowRoleModal(false);
      
      // Reload analytics to reflect changes
      const analyticsData = await userManagementAPI.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to update user role. Please try again.');
      console.error('Error updating role:', err);
    }
  };

  const handleUserStatusChange = async (userId: string, status: 'active' | 'inactive') => {
    try {
      await userManagementAPI.updateUserStatus(userId, { status });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status } : user
      ));
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status } : null);
      }
      
      // Reload analytics to reflect changes
      const analyticsData = await userManagementAPI.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to update user status. Please try again.');
      console.error('Error updating status:', err);
    }
  };

  const handleSendEmail = (user: User) => {
    setEmailData({
      subject: '',
      message: '',
      recipient: user
    });
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.recipient) return;

    try {
      await userManagementAPI.sendUserEmail(emailData.recipient._id, {
        subject: emailData.subject,
        message: emailData.message
      });

      setShowEmailModal(false);
      setEmailData({ subject: '', message: '', recipient: null });
    } catch (err) {
      setError('Failed to send email. Please try again.');
      console.error('Error sending email:', err);
    }
  };

  const openRoleModal = (user: User) => {
    setRoleChangeData({
      user,
      newRole: user.role
    });
    setShowRoleModal(true);
  };

  const openUserDetail = async (user: User) => {
    setSelectedUser(user);
    await loadUserDetails(user._id);
    setShowUserDetail(true);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
    return `₦${amount}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'staff': return 'bg-blue-100 text-blue-700';
      case 'customer': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 shadow-lg text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Analytics Section - Minimal Design */}
        {analytics && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="mr-3 h-6 w-6 text-red-600" />
              User Analytics
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
                <p className="text-gray-500 text-sm mb-2">Total Users</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {analytics.totalStats.totalUsers}
                </p>
                <p className="text-red-600 text-xs mt-2">{analytics.totalStats.activeUsers} active</p>
              </div>

              <div className="border-b sm:border-b-0 lg:border-r border-gray-100 pb-6 sm:pb-0 lg:pr-6">
                <p className="text-gray-500 text-sm mb-2">Avg Revenue/User</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {formatCurrency(analytics.totalStats.averageRevenue)}
                </p>
                <p className="text-red-600 text-xs mt-2">per user</p>
              </div>

              <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
                <p className="text-gray-500 text-sm mb-2">Inactive Users</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {analytics.totalStats.inactiveUsers}
                </p>
                <p className="text-red-600 text-xs mt-2">accounts</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-2">Top Customer</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {analytics.topCustomers[0]?.name || 'N/A'}
                </p>
                <p className="text-red-600 text-xs mt-2">
                  {formatCurrency(analytics.topCustomers[0]?.revenue || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Management Section */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-500 text-sm mt-1">Manage system users</p>
              </div>
              
              {/* Search and Filters - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users List - Mobile Friendly */}
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user._id}
                  className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">{user.name}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{user.totalBookings} bookings</span>
                          <span>•</span>
                          <span className="font-semibold text-red-600">{formatCurrency(user.totalRevenue)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleUserStatusChange(user._id, user.status === 'active' ? 'inactive' : 'active')}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}
                      >
                        {user.status}
                      </button>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openUserDetail(user)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(user)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="Send Email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openRoleModal(user)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title="Change Role"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)} of {pagination.totalUsers}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-500 hover:text-red-600 transition-colors p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Name</p>
                  <p className="text-gray-900 font-semibold">{userDetails.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p className="text-gray-900 font-semibold">{userDetails.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Role</p>
                  <p className="text-gray-900 font-semibold capitalize">{userDetails.user.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="text-gray-900 font-semibold capitalize">{userDetails.user.status}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{userDetails.stats.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(userDetails.stats.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <div className="text-center col-span-2 sm:col-span-1">
                    <p className="text-lg font-bold text-gray-900">
                      {formatDate(userDetails.stats.lastBooking)}
                    </p>
                    <p className="text-sm text-gray-600">Last Booking</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleSendEmail(userDetails.user)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </button>
                <button
                  onClick={() => openRoleModal(userDetails.user)}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                >
                  Change Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && emailData.recipient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Send Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-red-600 transition-colors p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm mb-1">To</p>
                <p className="text-gray-900 font-semibold">{emailData.recipient.name}</p>
                <p className="text-gray-600 text-sm">{emailData.recipient.email}</p>
              </div>
              
              <div>
                <label className="block text-gray-500 text-sm mb-2">Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-500 text-sm mb-2">Message</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && roleChangeData.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Role</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-500 hover:text-red-600 transition-colors p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-sm">User</p>
                <p className="text-gray-900 font-semibold">{roleChangeData.user.name}</p>
              </div>
              
              <div>
                <label className="block text-gray-500 text-sm mb-2">New Role</label>
                <select
                  value={roleChangeData.newRole}
                  onChange={(e) => setRoleChangeData(prev => ({ ...prev, newRole: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRoleChange(roleChangeData.user!._id, roleChangeData.newRole)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;


