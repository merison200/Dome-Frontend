import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { paymentAPI, Payment, PaymentFilters, PaymentStats } from '../../../services/hallPayment';

interface FrontendPaymentStats extends PaymentStats {
  // All fields are now inherited from PaymentStats
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<FrontendPaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10, // Changed from 20 to 10 for pagination
    status: '',
    method: '',
    startDate: '',
    endDate: ''
  });
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStats(); // Fetch stats separately using the new API
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAllPayments(filters);
      setPayments(response.payments);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (filters.page === 1 && !filters.status && !filters.method && !filters.startDate && !filters.endDate) {
        const allResponse = await paymentAPI.getAllPayments({ limit: 1000 });
        setAllPayments(allResponse.payments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsFilters: { startDate?: string; endDate?: string } = {};
      if (filters.startDate) statsFilters.startDate = filters.startDate;
      if (filters.endDate) statsFilters.endDate = filters.endDate;

      const response = await paymentAPI.getPaymentStats(statsFilters);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      // Fallback to calculating from payments if API fails
      calculateStatsFromPayments();
    }
  };

  const calculateStatsFromPayments = () => {
    if (allPayments.length === 0) return;

    const completedPayments = allPayments.filter(p => p.status === 'completed');
    const grossRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const gatewayCharges = completedPayments.reduce((sum, p) => sum + (p.gatewayFee || 0), 0);
    const processingFees = completedPayments.reduce((sum, p) => sum + (p.processingFee || 0), 0);
    const totalFees = gatewayCharges + processingFees;
    const netRevenue = grossRevenue - totalFees;

    const stats: FrontendPaymentStats = {
      totalPayments: allPayments.length,
      completedPayments: completedPayments.length,
      pendingPayments: allPayments.filter(p => p.status === 'pending').length,
      failedPayments: allPayments.filter(p => p.status === 'failed').length,
      grossRevenue,
      gatewayCharges,
      processingFees,
      totalFees,
      netRevenue,
      refundAmount: completedPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0),
      pendingRevenue: allPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      cardPayments: allPayments.filter(p => p.method === 'card').length,
      transferPayments: allPayments.filter(p => p.method === 'transfer').length,
      pendingTransferVerifications: allPayments.filter(
        p => p.method === 'transfer' && 
             p.transferDetails?.verificationStatus === 'pending'
      ).length,
      feePercentage: paymentAPI.calculateFeePercentage(grossRevenue, totalFees),
      netRevenuePercentage: paymentAPI.calculateNetRevenuePercentage(grossRevenue, netRevenue)
    };

    setStats(stats);
  };

  const handleFilterChange = (key: keyof PaymentFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number)
    }));
  };

  const handleExport = async () => {
    try {
      const blob = await paymentAPI.exportPayments(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting payments:', error);
    }
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      fetchPayments();
      return;
    }

    const query = searchQuery.toLowerCase();
    const filteredPayments = allPayments.filter(payment => 
      payment.transactionId.toLowerCase().includes(query) ||
      payment.referenceNumber.toLowerCase().includes(query) ||
      payment.bookingId.customerName.toLowerCase().includes(query) ||
      payment.userId.email.toLowerCase().includes(query) ||
      payment.userId.name.toLowerCase().includes(query)
    );

    setPayments(filteredPayments);
    setTotal(filteredPayments.length);
    setTotalPages(Math.ceil(filteredPayments.length / (filters.limit || 10)));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      method: '',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
  };

  // Calculate pagination range
  const getPaginationRange = () => {
    const currentPage = filters.page || 1;
    const totalPagesToShow = 5; // Show max 5 page numbers
    const halfRange = Math.floor(totalPagesToShow / 2);
    
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < totalPagesToShow) {
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
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
        
        {/* Clean Stats Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            {/* Total Payments */}
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Payments</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {stats?.totalPayments || 0}
              </p>
              <p className="text-gray-600 text-xs mt-2">
                All payment attempts
              </p>
            </div>

            {/* Completed Payments */}
            <div className="border-b sm:border-b-0 lg:border-r border-gray-100 pb-6 sm:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Completed Payments</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {stats?.completedPayments || 0}
              </p>
              <p className="text-green-600 text-xs mt-2">
                Successful payments
              </p>
            </div>

            {/* Pending Payments */}
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Pending Payments</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {stats?.pendingPayments || 0}
              </p>
              <p className="text-yellow-600 text-xs mt-2">
                {paymentAPI.formatCurrency(stats?.pendingRevenue || 0)}
              </p>
            </div>

            {/* Transfer Verifications */}
            <div>
              <p className="text-gray-500 text-sm mb-2">Transfer Verifications</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {stats?.pendingTransferVerifications || 0}
              </p>
              <p className="text-red-600 text-xs mt-2">Awaiting approval</p>
            </div>
          </div>

          {/* Revenue Breakdown - Clean Design */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gross Revenue */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Gross Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {paymentAPI.formatCurrency(stats?.grossRevenue || 0)}
                </p>
                <p className="text-gray-600 text-xs mt-1">Total booking revenue</p>
              </div>

              {/* Total Fees */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Total Fees</p>
                <p className="text-2xl font-bold text-red-600">
                  {paymentAPI.formatCurrency(stats?.totalFees || 0)}
                </p>
                <div className="text-gray-600 text-xs mt-1">
                  <div>Gateway: {paymentAPI.formatCurrency(stats?.gatewayCharges || 0)}</div>
                  <div>Processing: {paymentAPI.formatCurrency(stats?.processingFees || 0)}</div>
                </div>
              </div>

              {/* Net Revenue */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Net Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {paymentAPI.formatCurrency(stats?.netRevenue || 0)}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {stats?.netRevenuePercentage || '0%'} of gross
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, transaction ID, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleSearch}
                className="flex-1 lg:flex-none px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 lg:flex-none px-4 py-3 border rounded-2xl transition-colors flex items-center gap-2 ${
                  showFilters ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchPayments();
                    fetchStats();
                  }}
                  className="p-3 border border-gray-300 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleExport}
                  className="p-3 border border-gray-300 rounded-2xl bg-white hover:bg-gray-50 transition-colors"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="pt-6 mt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                  <select
                    value={filters.method || ''}
                    onChange={(e) => handleFilterChange('method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">All Methods</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No payments found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                            {payment.transactionId}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.referenceNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.bookingId.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.userId.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {paymentAPI.formatCurrency(payment.amount)}
                        </div>
                        {(payment.gatewayFee > 0 || payment.processingFee > 0) && (
                          <div className="text-xs text-gray-500">
                            Fees: {paymentAPI.formatCurrency((payment.gatewayFee || 0) + (payment.processingFee || 0))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentAPI.getMethodColor(payment.method)}`}>
                          {paymentAPI.formatMethodName(payment.method)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentAPI.getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                        {payment.method === 'transfer' && payment.transferDetails?.verificationStatus === 'pending' && (
                          <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs verification
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {paymentAPI.formatRelativeTime(payment.createdAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewPaymentDetails(payment)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg group"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to {Math.min((filters.page || 1) * (filters.limit || 10), total)} of {total} results
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                  disabled={filters.page === 1}
                  className="p-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {getPaginationRange().map((page) => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`min-w-[40px] px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
                        filters.page === page
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, (filters.page || 1) + 1))}
                  disabled={filters.page === totalPages}
                  className="p-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Page Size Selector (Optional) */}
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <span>Show:</span>
                <select
                  value={filters.limit || 10}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span>per page</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setShowPaymentDetails(false)}
          onRefresh={fetchPayments}
        />
      )}
    </div>
  );
};

// Enhanced Payment Details Modal Component with Revenue Breakdown
const PaymentDetailsModal: React.FC<{
  payment: Payment;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ payment, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const handleVerifyTransfer = async (action: 'approve' | 'reject', reason?: string) => {
    try {
      setLoading(true);
      await paymentAPI.verifyTransferPayment(payment.transactionId, {
        action,
        rejectionReason: reason
      });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error verifying transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const blob = await paymentAPI.downloadReceipt(payment.transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${payment.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  // Calculate revenue breakdown for this payment
  const revenueBreakdown = payment.revenueBreakdown || {
    grossRevenue: payment.amount + (payment.refundAmount || 0),
    gatewayFee: payment.gatewayFee || 0,
    processingFee: payment.processingFee || 0,
    totalFees: (payment.gatewayFee || 0) + (payment.processingFee || 0),
    refundAmount: payment.refundAmount || 0,
    netRevenue: (payment.amount + (payment.refundAmount || 0)) - ((payment.gatewayFee || 0) + (payment.processingFee || 0)) - (payment.refundAmount || 0),
    feePercentage: paymentAPI.calculateFeePercentage(payment.amount, (payment.gatewayFee || 0) + (payment.processingFee || 0)),
    netRevenuePercentage: paymentAPI.calculateNetRevenuePercentage(
      payment.amount + (payment.refundAmount || 0),
      (payment.amount + (payment.refundAmount || 0)) - ((payment.gatewayFee || 0) + (payment.processingFee || 0)) - (payment.refundAmount || 0)
    ),
    formatted: {
      grossRevenue: paymentAPI.formatCurrency(payment.amount + (payment.refundAmount || 0)),
      totalFees: paymentAPI.formatCurrency((payment.gatewayFee || 0) + (payment.processingFee || 0)),
      netRevenue: paymentAPI.formatCurrency(
        (payment.amount + (payment.refundAmount || 0)) - ((payment.gatewayFee || 0) + (payment.processingFee || 0)) - (payment.refundAmount || 0)
      ),
      amount: paymentAPI.formatCurrency(payment.amount)
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
            <p className="text-gray-600 mt-1">{payment.transactionId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Amount</div>
              <div className="text-3xl font-bold text-gray-900">
                {paymentAPI.formatCurrency(payment.amount)}
              </div>
              {(payment.gatewayFee > 0 || payment.processingFee > 0) && (
                <div className="text-sm text-gray-500 mt-1">
                  Total fees: {paymentAPI.formatCurrency((payment.gatewayFee || 0) + (payment.processingFee || 0))}
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Status</div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentAPI.getStatusColor(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-sm text-gray-600 mb-2">Method</div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentAPI.getMethodColor(payment.method)}`}>
                {paymentAPI.formatMethodName(payment.method)}
              </span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          {payment.status === 'completed' && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gross Revenue:</span>
                    <span className="font-medium text-gray-900">{revenueBreakdown.formatted.grossRevenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gateway Fees:</span>
                    <span className="font-medium text-red-600">-{paymentAPI.formatCurrency(revenueBreakdown.gatewayFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Fees:</span>
                    <span className="font-medium text-red-600">-{paymentAPI.formatCurrency(revenueBreakdown.processingFee)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Refunds:</span>
                    <span className="font-medium text-orange-600">-{paymentAPI.formatCurrency(revenueBreakdown.refundAmount)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Net Revenue:</span>
                      <span className="font-bold text-green-600">{revenueBreakdown.formatted.netRevenue}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {revenueBreakdown.netRevenuePercentage} of gross
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {revenueBreakdown.netRevenuePercentage}
                    </div>
                    <div className="text-sm text-gray-600">Net Revenue Percentage</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Fees: {revenueBreakdown.feePercentage}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Booking Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{payment.bookingId.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{payment.userId.email}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Hall</div>
                  <div className="font-medium">{payment.bookingId.hallId?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Booking ID</div>
                  <div className="font-medium text-sm">{payment.bookingId._id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Details & Verification */}
          {payment.method === 'transfer' && payment.transferDetails && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Account Name</div>
                    <div className="font-medium">{payment.transferDetails.accountName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Account Number</div>
                    <div className="font-medium">{payment.transferDetails.accountNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Bank</div>
                    <div className="font-medium">{payment.transferDetails.bankName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Verification Status</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentAPI.getVerificationStatusColor(payment.transferDetails.verificationStatus)}`}>
                      {payment.transferDetails.verificationStatus.charAt(0).toUpperCase() + payment.transferDetails.verificationStatus.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  {payment.transferDetails.transferProof && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Transfer Proof</div>
                      <img
                        src={payment.transferDetails.transferProof}
                        alt="Transfer Proof"
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Actions */}
              {payment.transferDetails.verificationStatus === 'pending' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVerifyTransfer('approve')}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Transfer</span>
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Rejection reason (optional):');
                        if (reason !== null) {
                          handleVerifyTransfer('reject', reason);
                        }
                      }}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Transfer</span>
                    </button>
                  </div>
                </div>
              )}

              {payment.transferDetails.verificationStatus === 'rejected' && payment.transferDetails.rejectionReason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {payment.transferDetails.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            {payment.status === 'completed' && (
              <button
                onClick={downloadReceipt}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;


