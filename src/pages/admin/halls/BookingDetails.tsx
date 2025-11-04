import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Save, XCircle, Calendar, User, Mail, Phone, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  bookingAPI,
  type Booking,
} from '../../../services/hallBooking';

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Actions state
  const [updating, setUpdating] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [adminCancelReason, setAdminCancelReason] = useState<string>('');
  const [adminCancelAmount, setAdminCancelAmount] = useState<number | undefined>(undefined);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await bookingAPI.getBookingById(id);
      setBooking(res);
      setStatus(res.status);
      setPaymentRef(res.paymentReference || '');
    } catch (e: any) {
      setError(e?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [id]);

  const doUpdateStatus = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      const res = await bookingAPI.updateBookingStatus(id, status);
      alert(res.message || 'Status updated');
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const doConfirmPayment = async () => {
    if (!id) return;
    try {
      setUpdating(true);
      const res = await bookingAPI.confirmPayment(id, paymentRef || undefined);
      alert(res.message || 'Payment confirmed');
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to confirm payment');
    } finally {
      setUpdating(false);
    }
  };

  const doCancel = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    try {
      setUpdating(true);
      const res = await bookingAPI.adminCancelBooking(id, adminCancelAmount, adminCancelReason);
      alert(res.message || 'Booking cancelled');
      await load();
    } catch (e: any) {
      alert(e?.message || 'Failed to cancel booking');
    } finally {
      setUpdating(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <Link 
              to="/admin/bookings" 
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bookings
            </Link>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Booking</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
            <Link 
              to="/admin/bookings" 
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bookings
            </Link>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
            <p className="text-gray-600">Booking not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-500 text-sm mt-1">Booking ID: {booking._id}</p>
            </div>
            <Link 
              to="/admin/bookings" 
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bookings
            </Link>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
              <p className="text-gray-500 text-sm mb-2">Booking Status</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{booking.status}</p>
              <p className="text-red-600 text-xs mt-2">Current status</p>
            </div>

            <div className="border-b md:border-b-0 lg:border-r border-gray-100 pb-6 md:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Payment Status</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{booking.paymentStatus.replace('_', ' ')}</p>
              <p className="text-red-600 text-xs mt-2">Payment status</p>
            </div>

            <div className="border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
              <p className="text-gray-500 text-sm mb-2">Booking Type</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{booking.bookingType}</p>
              <p className="text-red-600 text-xs mt-2">Booking method</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatNaira(booking.totalAmount)}</p>
              <p className="text-red-600 text-xs mt-2">Total booking cost</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Booking Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customer Information</h2>
                    <p className="text-gray-500 text-sm mt-1">Customer details and contact information</p>
                  </div>
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-700">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm">Full Name</p>
                        <p className="font-semibold text-gray-900 truncate">{booking.customerName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-700">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm">Email Address</p>
                        <p className="font-semibold text-gray-900 truncate">{booking.customerEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-700">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm">Phone Number</p>
                        <p className="font-semibold text-gray-900 truncate">{booking.customerPhone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                    <p className="text-gray-500 text-sm mt-1">Venue and event information</p>
                  </div>
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div className="space-y-4">
                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm">Hall</p>
                        <p className="font-semibold text-gray-900 truncate">{booking.hallId?.name || 'Hall information not available'}</p>
                        {booking.hallId?.location && (
                          <p className="text-gray-500 text-sm truncate">{booking.hallId.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm mb-2">Event Dates</p>
                        <div className="space-y-2">
                          {booking.eventDates?.map((date, index) => (
                            <div key={index} className="bg-purple-50 px-3 py-2 rounded-lg">
                              <p className="font-medium text-purple-900 text-sm">{bookingAPI.formatDate(date)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-sm">Event Type</p>
                        <p className="font-semibold text-gray-900">{formatEventType(booking.eventType)}</p>
                      </div>
                    </div>
                  </div>

                  {booking.additionalHours > 0 && (
                    <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-500 text-sm">Additional Hours</p>
                          <p className="font-semibold text-gray-900">{booking.additionalHours} hours</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.specialRequests && (
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <p className="text-gray-500 text-sm mb-2">Special Requests</p>
                      <p className="text-gray-900">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Payment Breakdown</h2>
                    <p className="text-gray-500 text-sm mt-1">Cost breakdown and total amount</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                    <span className="font-bold text-sm">₦</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-semibold text-gray-900">{formatNaira(booking.basePrice)}</span>
                  </div>
                  <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                    <span className="text-gray-600">Caution Fee</span>
                    <span className="font-semibold text-gray-900">{formatNaira(booking.cautionFee)}</span>
                  </div>
                  {booking.additionalHours > 0 && (
                    <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <span className="text-gray-600">Additional Hours ({booking.additionalHours}h)</span>
                      <span className="font-semibold text-gray-900">{formatNaira(booking.additionalHoursPrice)}</span>
                    </div>
                  )}
                  {booking.banquetChairs > 0 && (
                    <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <span className="text-gray-600">Banquet Chairs ({booking.banquetChairs})</span>
                      <span className="font-semibold text-gray-900">{formatNaira(booking.banquetChairsPrice)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                      <span className="text-xl font-bold text-red-600">{formatNaira(booking.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Update Status */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Update Status</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    onClick={doUpdateStatus}
                    disabled={updating || status === booking.status}
                    className="w-full px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Payment */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Confirm Payment</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Reference</label>
                    <input
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Enter payment reference"
                      className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button
                    onClick={doConfirmPayment}
                    disabled={updating || booking.paymentStatus === 'paid'}
                    className="w-full px-4 py-3 rounded-2xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {updating ? 'Processing...' : 'Confirm Payment'}
                  </button>
                  <p className="text-xs text-gray-500">
                    This will mark the payment as confirmed and update the booking status.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Cancel */}
            {booking.status !== 'cancelled' && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-red-200">
                <div className="p-6 sm:p-8">
                  <h4 className="font-semibold text-red-900 mb-4 text-lg">Cancel Booking</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Refund Amount (Optional)</label>
                      <input
                        type="number"
                        value={adminCancelAmount ?? ''}
                        onChange={(e) => setAdminCancelAmount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Enter refund amount"
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason</label>
                      <textarea
                        value={adminCancelReason}
                        onChange={(e) => setAdminCancelReason(e.target.value)}
                        placeholder="Enter reason for cancellation"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={doCancel}
                      disabled={updating}
                      className="w-full px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      {updating ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                    <p className="text-xs text-red-600">
                      This action cannot be undone. The customer will be notified via email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Timeline */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Booking Timeline</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Booking Created</p>
                      <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {booking.updatedAt !== booking.createdAt && (
                    <div className="flex items-center gap-4 group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white text-xs">
                        2
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">{new Date(booking.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs">
                      3
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Cancellation Deadline</p>
                      <p className="text-xs text-gray-500">{new Date(booking.cancellationDeadline).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}