import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDays, 
  Download, 
  Search, 
  SlidersHorizontal, 
  X, 
  Plus, 
  RefreshCw,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter
} from 'lucide-react';
import {
  bookingAPI,
  type Booking,
  type BookingResponse,
  type PaginationParams,
} from '../../../services/hallBooking';
import { BookingTable } from './BookingTable';

const DEFAULT_LIMIT = 10;

export default function BookingManagement() {
  // Data storage
  const [allRows, setAllRows] = useState<Booking[]>([]);
  const [rows, setRows] = useState<Booking[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [hallId, setHallId] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Params
  const params: PaginationParams = useMemo(
    () => ({ page, limit, status, paymentStatus, startDate, endDate, hallId }),
    [page, limit, status, paymentStatus, startDate, endDate, hallId]
  );

  // Frontend search function
  const applyFrontendSearch = useCallback((query: string, data: Booking[]) => {
    if (!query.trim()) return data;
    
    const lowercaseQuery = query.toLowerCase().trim();
    
    return data.filter((booking) => {
      const customerMatch = 
        booking.customerName?.toLowerCase().includes(lowercaseQuery) ||
        booking.customerEmail?.toLowerCase().includes(lowercaseQuery) ||
        booking.customerPhone?.toLowerCase().includes(lowercaseQuery);
      
      const hallMatch = 
        booking.hallId?.name?.toLowerCase().includes(lowercaseQuery) ||
        booking.hallId?.location?.toLowerCase().includes(lowercaseQuery);
      
      const bookingMatch = 
        booking._id?.toLowerCase().includes(lowercaseQuery) ||
        booking.eventType?.toLowerCase().includes(lowercaseQuery) ||
        booking.status?.toLowerCase().includes(lowercaseQuery) ||
        booking.paymentStatus?.toLowerCase().includes(lowercaseQuery) ||
        booking.bookingType?.toLowerCase().includes(lowercaseQuery);
      
      return customerMatch || hallMatch || bookingMatch;
    });
  }, []);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let backendData: Booking[] = [];
      let totalResults = 0;
      let totalPagesCount = 1;

      if (q.trim()) {
        setSearching(true);
        const res = await bookingAPI.searchBookings(q.trim(), limit);
        backendData = res;
        setAllRows(res);
        setRows(res);
        setTotal(res.length);
        setTotalPages(1);
      } else {
        const res: BookingResponse = await bookingAPI.getAllBookings(params);
        backendData = res.bookings;
        setAllRows(res.bookings);
        setRows(res.bookings);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }

      const totalRevenue = backendData.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
      setStats({
        total: backendData.length,
        pending: backendData.filter(b => b.status === 'pending').length,
        confirmed: backendData.filter(b => b.status === 'confirmed').length,
        cancelled: backendData.filter(b => b.status === 'cancelled').length,
        totalRevenue
      });

      setSearching(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch bookings');
      setSearching(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, status, paymentStatus, startDate, endDate, hallId]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setQ(value);
    
    if (allRows.length > 0 && !status && !paymentStatus && !startDate && !endDate && !hallId) {
      setSearching(true);
      const filteredData = applyFrontendSearch(value, allRows);
      
      const totalResults = filteredData.length;
      const totalPagesCount = Math.ceil(totalResults / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const pageResults = filteredData.slice(startIndex, endIndex);
      
      setRows(pageResults);
      setTotal(totalResults);
      setTotalPages(totalPagesCount);
      
      if (page > totalPagesCount && totalPagesCount > 0) {
        setPage(1);
      }
      
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setStatus('');
    setPaymentStatus('');
    setStartDate('');
    setEndDate('');
    setHallId('');
    setQ('');
    setPage(1);
  };

  const onExport = async () => {
    try {
      const blob = await bookingAPI.exportBookings({
        status, paymentStatus, startDate, endDate, hallId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-export-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.message || 'Export failed');
    }
  };

  const onQuickCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingAPI.adminCancelBooking(id);
      alert(res.message || 'Booking cancelled');
      fetchData();
    } catch (e: any) {
      alert(e?.message || 'Failed to cancel booking');
    }
  };

  const formatEventType = (type: string) => {
    const eventTypes: { [key: string]: string } = {
      'wedding': 'Wedding',
      'burial': 'Burial',
      'birthday': 'Birthday Party',
      'corporate': 'Corporate Event',
      'conference': 'Conference/Seminar',
      'graduation': 'Graduation Ceremony',
      'anniversary': 'Anniversary',
      'baby-shower': 'Baby Shower',
      'religious': 'Religious Event',
      'other': 'Other'
    };
    return eventTypes[type] || type;
  };

  // Format currency for Naira
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                Booking Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manage all hall bookings and reservations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={onExport}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                to="/admin/bookings/offline"
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Booking
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-red-600 text-xs mt-2">{stats.pending} pending</p>
            </div>

            <div className="border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatNaira(stats.totalRevenue)}</p>
              <p className="text-red-600 text-xs mt-2">All confirmed bookings</p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Confirmed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
              <p className="text-red-600 text-xs mt-2">Active bookings</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Cancelled</p>
              <p className="text-3xl font-bold text-gray-900">{stats.cancelled}</p>
              <p className="text-red-600 text-xs mt-2">{Math.round((stats.cancelled / stats.total) * 100)}% rate</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={q}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by customer name, email, phone, hall, booking ID, status..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => fetchData()}
              className="px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 flex items-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={() => fetchData()}
              className="px-4 py-3 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {q && (
            <div className="mt-3 text-sm text-gray-600">
              Showing {total} result{total !== 1 ? 's' : ''} for "{q}"
              <button
                onClick={() => handleSearchChange('')}
                className="ml-2 text-red-600 hover:text-red-700 underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center gap-2 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="partially_refunded">Partially Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hall ID</label>
                <input
                  value={hallId}
                  onChange={(e) => { setHallId(e.target.value); setPage(1); }}
                  placeholder="Enter Hall ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-3xl shadow-lg border border-red-200 p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Bookings</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              {q ? 
                `No bookings match your search for "${q}"` : 
                'No bookings match your current filters'
              }
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Booking Table */}
        {!loading && !error && rows.length > 0 && (
          <BookingTable
            bookings={rows}
            onQuickCancel={onQuickCancel}
            formatEventType={formatEventType}
          />
        )}

        {/* Pagination */}
        {!loading && !error && rows.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
                {q && ` for "${q}"`}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}