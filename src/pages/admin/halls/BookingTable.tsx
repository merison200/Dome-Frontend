import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { bookingAPI, type Booking } from '../../../services/hallBooking';

interface BookingTableProps {
  bookings: Booking[];
  onQuickCancel: (id: string) => void;
  formatEventType: (type: string) => string;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onQuickCancel,
  formatEventType
}) => {
  // Format currency for Naira
  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden xl:block bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hall & Event</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dates</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Payment</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {booking.hallId?.name || 'Hall information not available'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.hallId?.location || ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatEventType(booking.eventType)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {booking.eventDates?.slice(0, 2).map((date, index) => (
                        <div key={index} className="text-sm text-gray-900">
                          {bookingAPI.formatDate(date)}
                        </div>
                      ))}
                      {booking.eventDates?.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{booking.eventDates.length - 2} more
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-semibold text-gray-900">
                      {formatNaira(booking.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getBookingTypeBadge(booking.bookingType)}`}>
                      {booking.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/admin/bookings/${booking._id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      {bookingAPI.canCancelBooking(booking) && (
                        <button
                          onClick={() => onQuickCancel(booking._id!)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="xl:hidden space-y-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg">{booking.customerName}</h3>
                <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                <p className="text-sm text-gray-500">{booking.customerPhone}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getPaymentStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {booking._id && (
              <div className="mb-4">
                <span className="text-gray-500 font-medium text-sm">Booking ID:</span>
                <p className="text-sm font-mono text-gray-700 bg-gray-100 px-3 py-2 rounded-xl mt-1">
                  {booking._id}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500 font-medium">Hall:</span>
                <p className="font-semibold text-gray-900">
                  {booking.hallId?.name || 'Hall information not available'}
                </p>
                <p className="text-gray-600">{booking.hallId?.location}</p>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Amount:</span>
                <p className="font-bold text-gray-900">
                  {formatNaira(booking.totalAmount)}
                </p>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Event Type:</span>
                <p className="text-gray-900">{formatEventType(booking.eventType)}</p>
              </div>
              
              <div>
                <span className="text-gray-500 font-medium">Booking Type:</span>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${bookingAPI.getBookingTypeBadge(booking.bookingType)}`}>
                  {booking.bookingType}
                </span>
              </div>
            </div>

            {booking.eventDates && booking.eventDates.length > 0 && (
              <div className="mb-4">
                <span className="text-gray-500 font-medium text-sm">Event Dates:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {booking.eventDates.slice(0, 3).map((date, index) => (
                    <span key={index} className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-xl">
                      {bookingAPI.formatDate(date)}
                    </span>
                  ))}
                  {booking.eventDates.length > 3 && (
                    <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-xl">
                      +{booking.eventDates.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Link
                to={`/admin/bookings/${booking._id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
              {bookingAPI.canCancelBooking(booking) && (
                <button
                  onClick={() => onQuickCancel(booking._id!)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 rounded-xl text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};