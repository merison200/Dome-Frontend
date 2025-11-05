import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Mail, Phone, MapPin, Clock, Plus, Minus, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { hallAPI, type Hall } from '../../../services/hall';
import { bookingAPI, type BookingFormData } from '../../../services/hallBooking';

interface FormData {
  hallId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDates: string[];
  additionalHours: number;
  banquetChairs: number;
  eventType: string;
  specialRequests: string;
}

export default function OfflineBookingForm() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    hallId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventDates: [''],
    additionalHours: 0,
    banquetChairs: 0,
    eventType: '',
    specialRequests: ''
  });

  // UI state
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(false);
  const [hallsLoading, setHallsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [pricing, setPricing] = useState({
    basePrice: 0,
    cautionFee: 0,
    additionalHoursPrice: 0,
    banquetChairsPrice: 0,
    totalAmount: 0
  });

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

  // Load halls on component mount
  useEffect(() => {
    loadHalls();
  }, []);

  // Update pricing when form data changes
  useEffect(() => {
    calculatePricing();
  }, [formData, selectedHall]);

  const loadHalls = async () => {
    try {
      setHallsLoading(true);
      const hallsData = await hallAPI.getAll();
      setHalls(hallsData);
    } catch (error: any) {
      setError('Failed to load halls');
      console.error('Error loading halls:', error);
    } finally {
      setHallsLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!selectedHall || formData.eventDates.filter(date => date).length === 0) {
      setPricing({
        basePrice: 0,
        cautionFee: 0, 
        additionalHoursPrice: 0,
        banquetChairsPrice: 0,
        totalAmount: 0 
      });
      return;
    }

    const validDates = formData.eventDates.filter(date => date).length;
    const basePrice = selectedHall.basePrice * validDates;
    const additionalHoursPrice = formData.additionalHours * selectedHall.additionalHourPrice * validDates;
    const banquetChairsPrice = formData.banquetChairs * 1000 * validDates;
    const cautionFee = Math.round(basePrice * 0.1);
    const totalAmount = basePrice + additionalHoursPrice + banquetChairsPrice + cautionFee;

    setPricing({
      basePrice,
      cautionFee,
      additionalHoursPrice,
      banquetChairsPrice,
      totalAmount
    });
  };

  const checkDateAvailability = async (hallId: string, dates: string[]) => {
    try {
      const response = await bookingAPI.checkAvailability(hallId, dates);
      return response;
    } catch (error: any) {
      console.error('Availability check error:', error);
      throw error;
    }
  };

  const handleHallChange = (hallId: string) => {
    const hall = halls.find(h => h._id === hallId);
    setSelectedHall(hall || null);
    setFormData(prev => ({ ...prev, hallId }));
  };

  const handleDateChange = async (index: number, value: string) => {
    const newDates = [...formData.eventDates];
    newDates[index] = value;
    setFormData(prev => ({ ...prev, eventDates: newDates }));

    if (error && error.includes('not available')) {
      setError(null);
    }

    if (value && formData.hallId) {
      try {
        const result = await checkDateAvailability(formData.hallId, [value]);
        if (!result[0].available) {
          setError(`Date ${value} is not available: ${result[0].reason || 'Already booked'}`);
        }
      } catch (error) {
        console.error('Real-time availability check failed:', error);
      }
    }
  };

  const addDate = () => {
    setFormData(prev => ({
      ...prev,
      eventDates: [...prev.eventDates, '']
    }));
  };

  const removeDate = (index: number) => {
    if (formData.eventDates.length > 1) {
      const newDates = formData.eventDates.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, eventDates: newDates }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.hallId) {
      setError('Please select a hall');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError('Please fill in all customer information');
      return;
    }

    if (!formData.eventType) {
      setError('Please select an event type');
      return;
    }

    const validDates = formData.eventDates.filter(date => date);
    if (validDates.length === 0) {
      setError('Please select at least one event date');
      return;
    }

    try {
      setLoading(true);

      const availabilityResults = await checkDateAvailability(formData.hallId, validDates);
      const unavailableDates = availabilityResults.filter(result => !result.available);
      
      if (unavailableDates.length > 0) {
        const unavailableDatesStr = unavailableDates.map(d => d.date).join(', ');
        setError(`The following dates are not available: ${unavailableDatesStr}`);
        return;
      }

      const bookingData: BookingFormData = {
        hallId: formData.hallId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        eventDates: validDates,
        additionalHours: formData.additionalHours,
        banquetChairs: formData.banquetChairs,
        totalAmount: pricing.totalAmount,
        cautionFee: pricing.cautionFee,
        basePrice: pricing.basePrice,
        additionalHoursPrice: pricing.additionalHoursPrice,
        banquetChairsPrice: pricing.banquetChairsPrice,
        eventType: formData.eventType,
        specialRequests: formData.specialRequests
      };

      const result = await bookingAPI.createOfflineBooking(bookingData);
      setSuccess('Offline booking created successfully!');
      
      setTimeout(() => {
        navigate(`/admin/bookings/${result.booking._id}`);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

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
                  <Plus className="w-6 h-6 text-white" />
                </div>
                Create Offline Booking
              </h1>
              <p className="text-gray-500 text-sm mt-1">Create a new booking for walk-in customers</p>
            </div>
            <Link 
              to="/admin/bookings" 
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Bookings
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hall Selection */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Select Hall</h2>
                      <p className="text-gray-500 text-sm mt-1">Choose a venue for the event</p>
                    </div>
                    <MapPin className="w-6 h-6 text-red-600" />
                  </div>
                  
                  {hallsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                      <span className="ml-2 text-gray-600">Loading halls...</span>
                    </div>
                  ) : (
                    <div>
                      <select
                        value={formData.hallId}
                        onChange={(e) => handleHallChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                        required
                      >
                        <option value="">Select a hall</option>
                        {halls.map(hall => (
                          <option key={hall._id} value={hall._id}>
                            {hall.name} - {hall.location} (Capacity: {hall.capacity})
                          </option>
                        ))}
                      </select>
                      
                      {selectedHall && (
                        <div className="mt-6 bg-gray-50 rounded-2xl p-6">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="group hover:bg-white rounded-2xl p-3 transition-all duration-200">
                              <span className="text-gray-500">Base Price:</span>
                              <span className="font-semibold text-gray-900 ml-2">
                                {formatNaira(selectedHall.basePrice)}/day
                              </span>
                            </div>
                            <div className="group hover:bg-white rounded-2xl p-3 transition-all duration-200">
                              <span className="text-gray-500">Additional Hour:</span>
                              <span className="font-semibold text-gray-900 ml-2">
                                {formatNaira(selectedHall.additionalHourPrice)}/hour
                              </span>
                            </div>
                            <div className="group hover:bg-white rounded-2xl p-3 transition-all duration-200">
                              <span className="text-gray-500">Capacity:</span>
                              <span className="font-semibold text-gray-900 ml-2">
                                {selectedHall.capacity} people
                              </span>
                            </div>
                            <div className="group hover:bg-white rounded-2xl p-3 transition-all duration-200">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-semibold text-gray-900 ml-2">
                                {selectedHall.size || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="Enter customer's full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                    </div>

                    <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="group hover:bg-gray-50 rounded-2xl p-4 transition-all duration-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Type *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                        <select
                          value={formData.eventType}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 appearance-none bg-white"
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
                  </div>
                </div>
              </div>

              {/* Event Dates */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Event Dates</h2>
                      <p className="text-gray-500 text-sm mt-1">Select dates for the event</p>
                    </div>
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                  
                  <div className="space-y-4">
                    {formData.eventDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-3 group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                        <div className="flex-1">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => handleDateChange(index, e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                        {formData.eventDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDate(index)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addDate}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Date</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Additional Services</h2>
                      <p className="text-gray-500 text-sm mt-1">Extra services and amenities</p>
                    </div>
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Additional Hours */}
                    <div className="bg-gray-50 rounded-2xl p-6 group hover:bg-white transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Additional Hours</h4>
                          <p className="text-sm text-gray-600">
                            {selectedHall ? formatNaira(selectedHall.additionalHourPrice) : '₦0'} per hour per day
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, additionalHours: Math.max(0, prev.additionalHours - 1) }))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm"
                            disabled={formData.additionalHours === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">{formData.additionalHours}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, additionalHours: prev.additionalHours + 1 }))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {formData.additionalHours > 0 && (
                        <div className="bg-red-50 rounded-xl p-3">
                          <span className="text-red-900 font-medium">
                            Total: {formatNaira(pricing.additionalHoursPrice)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Banquet Chairs */}
                    <div className="bg-gray-50 rounded-2xl p-6 group hover:bg-white transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900">Banquet Chairs</h4>
                          <p className="text-sm text-gray-600">₦1,000 per chair per day</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, banquetChairs: Math.max(0, prev.banquetChairs - 10) }))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm"
                            disabled={formData.banquetChairs === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-lg">{formData.banquetChairs}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, banquetChairs: prev.banquetChairs + 10 }))}
                            className="p-2 bg-white hover:bg-gray-100 rounded-xl transition-colors shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {formData.banquetChairs > 0 && (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <span className="text-blue-900 font-medium">
                            Total: {formatNaira(pricing.banquetChairsPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Requests</h2>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 resize-none"
                    placeholder="Any special requirements, decorations, or additional services..."
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Pricing Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden sticky top-6">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Pricing Summary</h2>
                      <p className="text-gray-500 text-sm mt-1">Cost breakdown and total amount</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
                      <span className="font-bold text-sm">₦</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <span className="text-gray-600">Base Price</span>
                      <span className="font-semibold text-gray-900">{formatNaira(pricing.basePrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                      <span className="text-gray-600">Caution Fee (10%)</span>
                      <span className="font-semibold text-gray-900">{formatNaira(pricing.cautionFee)}</span>
                    </div>
                    
                    {pricing.additionalHoursPrice > 0 && (
                      <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                        <span className="text-gray-600">Additional Hours</span>
                        <span className="font-semibold text-gray-900">{formatNaira(pricing.additionalHoursPrice)}</span>
                      </div>
                    )}
                    
                    {pricing.banquetChairsPrice > 0 && (
                      <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                        <span className="text-gray-600">Banquet Chairs</span>
                        <span className="font-semibold text-gray-900">{formatNaira(pricing.banquetChairsPrice)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between items-center group hover:bg-gray-50 rounded-2xl p-3 transition-all duration-200">
                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-red-600">{formatNaira(pricing.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-br from-red-500 to-red-600 text-white py-4 rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Booking...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Create Offline Booking</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-6 bg-yellow-50 rounded-2xl p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• Booking will be marked as confirmed</li>
                      <li>• Payment status will be set to paid</li>
                      <li>• Customer will receive confirmation email</li>
                      <li>• Caution fee is 10% of base price</li>
                      <li>• Caution fee is refundable after event</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}