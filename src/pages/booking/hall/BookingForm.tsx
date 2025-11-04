import React from 'react';
import { User, Mail, Calendar, MessageSquare, Clock, Plus, Minus } from 'lucide-react';

interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  specialRequests: string;
  additionalHours: number;
}

interface BookingFormProps {
  formData: BookingFormData;
  onFormDataChange: (data: Partial<BookingFormData>) => void;
  selectedDates: string[];
  additionalHourPrice: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  formData,
  onFormDataChange,
  selectedDates,
  additionalHourPrice
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const eventTypes = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'burial', label: 'Burial' },
    { value: 'birthday', label: 'Birthday Party' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'conference', label: 'Conference/Seminar' },
    { value: 'graduation', label: 'Graduation Ceremony' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'baby-shower', label: 'Baby Shower' },
    { value: 'religious', label: 'Religious Event' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
        <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        <span>Customer Information</span>
      </h3>

      <div className="space-y-6">
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => onFormDataChange({ customerName: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>

        {/* Customer Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => onFormDataChange({ customerEmail: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        {/* Customer Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 text-sm">+234</span>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => onFormDataChange({ customerPhone: e.target.value })}
              className="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="8012345678"
              required
            />
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Type *
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={formData.eventType}
              onChange={(e) => onFormDataChange({ eventType: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select event type</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Additional Hours */}
        <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Additional Hours</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatPrice(additionalHourPrice)} per hour per day
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Standard package includes base hours
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onFormDataChange({ additionalHours: Math.max(0, formData.additionalHours - 1) })}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                disabled={formData.additionalHours === 0}
              >
                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
              <div className="w-16 text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{formData.additionalHours}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">hours</div>
              </div>
              <button
                onClick={() => onFormDataChange({ additionalHours: formData.additionalHours + 1 })}
                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
          
          {formData.additionalHours > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formData.additionalHours} hours × {selectedDates.length || 1} day{(selectedDates.length || 1) !== 1 ? 's' : ''}
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatPrice(formData.additionalHours * additionalHourPrice * (selectedDates.length || 1))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Special Requests (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <textarea
              value={formData.specialRequests}
              onChange={(e) => onFormDataChange({ specialRequests: e.target.value })}
              rows={4}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Any special requirements, decorations, or additional services..."
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Please note: We are not responsible for decorations or personal equipment
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;