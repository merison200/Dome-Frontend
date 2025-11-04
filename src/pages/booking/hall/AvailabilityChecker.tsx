// import React, { useState, useEffect } from 'react';
// import { Calendar, Loader, AlertTriangle, Plus, X, Check, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
// import { bookingAPI, AvailabilityCheck } from '../../../services/hallBooking';

// interface AvailabilityCheckerProps {
//   selectedDates: string[];
//   onDateChange: (dates: string[]) => void;
//   hallId: string;
//   isAuthenticated: boolean;
// }

// const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
//   selectedDates,
//   onDateChange,
//   hallId,
//   isAuthenticated
// }) => {
//   const [availabilityResults, setAvailabilityResults] = useState<AvailabilityCheck[]>([]);
//   const [checking, setChecking] = useState(false);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedMonth, setSelectedMonth] = useState(new Date());

//   const today = new Date();
//   const oneYearFromNow = new Date();
//   oneYearFromNow.setFullYear(today.getFullYear() + 1);

//   useEffect(() => {
//     if (selectedDates.length > 0 && hallId && isAuthenticated) {
//       checkAvailability();
//     }
//   }, [selectedDates, hallId, isAuthenticated]);

//   const checkAvailability = async () => {
//     try {
//       setChecking(true);
//       const results = await bookingAPI.checkAvailability(hallId, selectedDates);
//       setAvailabilityResults(results);
//     } catch (err) {
//       console.error('Error checking availability:', err);
//     } finally {
//       setChecking(false);
//     }
//   };

//   const handleDateToggle = (date: string) => {
//     const newDates = selectedDates.includes(date)
//       ? selectedDates.filter(d => d !== date)
//       : [...selectedDates, date].sort();
//     onDateChange(newDates);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const getQuickDateOptions = () => {
//     const options = [];
//     const today = new Date();
    
//     // Next 12 days with proper date formatting
//     for (let i = 1; i <= 12; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       const dateString = date.toISOString().split('T')[0];
//       options.push({
//         date: dateString,
//         day: date.getDate(),
//         month: date.toLocaleDateString('en-US', { month: 'short' })
//       });
//     }
//     return options;
//   };

//   const getDaysInMonth = (date: Date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
//     const daysInMonth = lastDay.getDate();
//     const startingDayOfWeek = firstDay.getDay();

//     const days = [];
    
//     for (let i = 0; i < startingDayOfWeek; i++) {
//       days.push(null);
//     }
    
//     for (let day = 1; day <= daysInMonth; day++) {
//       const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
//       const isPast = new Date(year, month, day) < today;
//       const isFuture = new Date(year, month, day) > oneYearFromNow;
      
//       days.push({
//         day,
//         dateString,
//         isPast,
//         isFuture,
//         isSelectable: !isPast && !isFuture
//       });
//     }
    
//     return days;
//   };

//   const getAvailabilityStatus = (date: string) => {
//     const result = availabilityResults.find(r => r.date === date);
//     if (!result) return 'unknown';
//     return result.available ? 'available' : 'unavailable';
//   };

//   const hasUnavailableDates = availabilityResults.some(result => !result.available);
//   const quickOptions = getQuickDateOptions();
//   const monthDays = getDaysInMonth(selectedMonth);
  
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
//   const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 max-w-4xl mx-auto">
//       <div className="mb-6">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
//             <Calendar className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <h2 className="text-xl font-bold text-gray-900">Select Event Dates</h2>
//             <p className="text-gray-600 text-sm">Choose your preferred dates for the event</p>
//           </div>
//         </div>
//       </div>

//       {!isAuthenticated && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
//           <div className="flex items-center space-x-3">
//             <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
//             <div>
//               <h3 className="font-semibold text-red-900">Authentication Required</h3>
//               <p className="text-red-800 text-sm mt-1">Please log in to select dates and check availability.</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Quick Date Selection */}
//       {isAuthenticated && (
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose Dates</h3>
//           <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
//             {quickOptions.map(option => {
//               const isSelected = selectedDates.includes(option.date);
//               const status = getAvailabilityStatus(option.date);
              
//               return (
//                 <button
//                   key={option.date}
//                   onClick={() => handleDateToggle(option.date)}
//                   className={`relative p-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
//                     isSelected
//                       ? status === 'unavailable'
//                         ? 'bg-red-50 text-red-700 border-red-300'
//                         : 'bg-red-600 text-white border-red-600 shadow-md'
//                       : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
//                   }`}
//                 >
//                   {checking && isSelected && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
//                       <Loader className="w-3 h-3 animate-spin text-red-600" />
//                     </div>
//                   )}
//                   <div className={`${checking && isSelected ? 'opacity-30' : 'opacity-100'} text-center`}>
//                     <div className="text-lg font-bold">{option.day}</div>
//                     <div className="text-xs opacity-75">{option.month}</div>
//                   </div>
//                   {isSelected && status === 'available' && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
//                       <Check className="w-2 h-2" />
//                     </div>
//                   )}
//                   {isSelected && status === 'unavailable' && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
//                       <X className="w-2 h-2" />
//                     </div>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Custom Date Picker Toggle */}
//       {isAuthenticated && (
//         <div className="mb-6">
//           <button
//             onClick={() => setShowDatePicker(!showDatePicker)}
//             className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 text-left transition-all duration-200 flex items-center justify-between group"
//           >
//             <div className="flex items-center space-x-2">
//               <Plus className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
//               <span className="font-medium text-gray-700 text-sm">View Calendar</span>
//             </div>
//             <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-red-600 transition-all duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
//           </button>

//           {showDatePicker && (
//             <div className="mt-3 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
//               {/* Month Navigation */}
//               <div className="flex items-center justify-between mb-4">
//                 <button
//                   onClick={() => {
//                     const newMonth = new Date(selectedMonth);
//                     newMonth.setMonth(selectedMonth.getMonth() - 1);
//                     if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
//                       setSelectedMonth(newMonth);
//                     }
//                   }}
//                   className="p-1 hover:bg-red-50 rounded-md transition-colors text-gray-700 hover:text-red-600"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </button>
                
//                 <h4 className="text-base font-bold text-gray-900">
//                   {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
//                 </h4>
                
//                 <button
//                   onClick={() => {
//                     const newMonth = new Date(selectedMonth);
//                     newMonth.setMonth(selectedMonth.getMonth() + 1);
//                     if (newMonth <= oneYearFromNow) {
//                       setSelectedMonth(newMonth);
//                     }
//                   }}
//                   className="p-1 hover:bg-red-50 rounded-md transition-colors text-gray-700 hover:text-red-600"
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>

//               {/* Day Headers */}
//               <div className="grid grid-cols-7 gap-1 mb-2">
//                 {dayNames.map(day => (
//                   <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
//                     {day}
//                   </div>
//                 ))}
//               </div>

//               {/* Calendar Grid */}
//               <div className="grid grid-cols-7 gap-1">
//                 {monthDays.map((dayData, index) => {
//                   if (!dayData) {
//                     return <div key={index} className="h-8"></div>;
//                   }

//                   const { day, dateString, isSelectable } = dayData;
//                   const isSelected = selectedDates.includes(dateString);
//                   const status = getAvailabilityStatus(dateString);
                  
//                   return (
//                     <button
//                       key={dateString}
//                       onClick={() => isSelectable && handleDateToggle(dateString)}
//                       disabled={!isSelectable}
//                       className={`h-8 rounded-md text-xs font-semibold transition-all duration-200 relative border ${
//                         !isSelectable
//                           ? 'text-gray-300 cursor-not-allowed border-transparent'
//                           : isSelected
//                           ? status === 'unavailable'
//                             ? 'bg-red-50 text-red-700 border-red-300'
//                             : 'bg-red-600 text-white border-red-600'
//                           : 'text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600'
//                       }`}
//                     >
//                       {checking && isSelected && (
//                         <Loader className="absolute inset-0 m-auto w-3 h-3 animate-spin" />
//                       )}
//                       <span className={checking && isSelected ? 'opacity-0' : 'opacity-100'}>
//                         {day}
//                       </span>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Selected Dates Summary */}
//       {selectedDates.length > 0 && (
//         <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
//               <Clock className="w-4 h-4 text-red-600" />
//               <span>Selected Dates ({selectedDates.length})</span>
//             </h3>
//             {checking && (
//               <div className="flex items-center space-x-2 text-red-600">
//                 <Loader className="w-3 h-3 animate-spin" />
//                 <span className="text-xs font-medium">Checking availability...</span>
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//             {selectedDates.map(date => {
//               const status = getAvailabilityStatus(date);
//               return (
//                 <div key={date} className={`flex items-center justify-between p-3 rounded-md border transition-all ${
//                   status === 'available' ? 'bg-green-50 border-green-200' :
//                   status === 'unavailable' ? 'bg-red-50 border-red-200' :
//                   'bg-white border-gray-200'
//                 }`}>
//                   <div className="flex items-center space-x-2">
//                     <div className={`w-2 h-2 rounded-full ${
//                       status === 'available' ? 'bg-green-500' :
//                       status === 'unavailable' ? 'bg-red-500' :
//                       'bg-gray-400'
//                     }`} />
//                     <span className="font-medium text-gray-900 text-sm">{formatDate(date)}</span>
//                     {status === 'available' && (
//                       <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Available</span>
//                     )}
//                     {status === 'unavailable' && (
//                       <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Unavailable</span>
//                     )}
//                   </div>
//                   <button
//                     onClick={() => handleDateToggle(date)}
//                     className="w-6 h-6 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-300 rounded-full flex items-center justify-center transition-all duration-200 group"
//                   >
//                     <X className="w-3 h-3 text-gray-500 group-hover:text-red-600" />
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Status Messages */}
//       {hasUnavailableDates && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//           <div className="flex items-start space-x-3">
//             <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <h3 className="font-semibold text-red-900 mb-1 text-sm">Some Dates Unavailable</h3>
//               <p className="text-red-800 text-sm">Please select different dates or remove the unavailable ones to proceed with your booking.</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Booking Info */}
//       <div className="text-center py-3 border-t border-gray-200">
//         <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
//           <Calendar className="w-3 h-3" />
//           <span>Available booking period: Today - {oneYearFromNow.toLocaleDateString('en-US', { 
//             month: 'long', 
//             year: 'numeric' 
//           })}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AvailabilityChecker;


import React, { useState, useEffect } from 'react';
import { Calendar, Loader, AlertTriangle, Plus, X, Check, Clock, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingAPI, AvailabilityCheck } from '../../../services/hallBooking';

interface AvailabilityCheckerProps {
  selectedDates: string[];
  onDateChange: (dates: string[]) => void;
  hallId: string;
  isAuthenticated: boolean;
}

const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({
  selectedDates,
  onDateChange,
  hallId,
  isAuthenticated
}) => {
  const [availabilityResults, setAvailabilityResults] = useState<AvailabilityCheck[]>([]);
  const [checking, setChecking] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  useEffect(() => {
    if (selectedDates.length > 0 && hallId && isAuthenticated) {
      checkAvailability();
    }
  }, [selectedDates, hallId, isAuthenticated]);

  const checkAvailability = async () => {
    try {
      setChecking(true);
      const results = await bookingAPI.checkAvailability(hallId, selectedDates);
      setAvailabilityResults(results);
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleDateToggle = (date: string) => {
    const newDates = selectedDates.includes(date)
      ? selectedDates.filter(d => d !== date)
      : [...selectedDates, date].sort();
    onDateChange(newDates);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getQuickDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Next 12 days with proper date formatting
    for (let i = 1; i <= 12; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      options.push({
        date: dateString,
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return options;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = new Date(year, month, day) < today;
      const isFuture = new Date(year, month, day) > oneYearFromNow;
      
      days.push({
        day,
        dateString,
        isPast,
        isFuture,
        isSelectable: !isPast && !isFuture
      });
    }
    
    return days;
  };

  const getAvailabilityStatus = (date: string) => {
    const result = availabilityResults.find(r => r.date === date);
    if (!result) return 'unknown';
    return result.available ? 'available' : 'unavailable';
  };

  const hasUnavailableDates = availabilityResults.some(result => !result.available);
  const quickOptions = getQuickDateOptions();
  const monthDays = getDaysInMonth(selectedMonth);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Event Dates</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Choose your preferred dates for the event</p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Authentication Required</h3>
              <p className="text-red-800 dark:text-red-300 text-sm mt-1">Please log in to select dates and check availability.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Date Selection */}
      {isAuthenticated && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Choose Dates</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
            {quickOptions.map(option => {
              const isSelected = selectedDates.includes(option.date);
              const status = getAvailabilityStatus(option.date);
              
              return (
                <button
                  key={option.date}
                  onClick={() => handleDateToggle(option.date)}
                  className={`relative p-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                    isSelected
                      ? status === 'unavailable'
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                        : 'bg-red-600 text-white border-red-600 shadow-md'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                  }`}
                >
                  {checking && isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700 bg-opacity-90 dark:bg-opacity-90 rounded-lg">
                      <Loader className="w-3 h-3 animate-spin text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  <div className={`${checking && isSelected ? 'opacity-30' : 'opacity-100'} text-center`}>
                    <div className="text-lg font-bold">{option.day}</div>
                    <div className="text-xs opacity-75">{option.month}</div>
                  </div>
                  {isSelected && status === 'available' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2" />
                    </div>
                  )}
                  {isSelected && status === 'unavailable' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-2 h-2" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Date Picker Toggle */}
      {isAuthenticated && (
        <div className="mb-6">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-left transition-all duration-200 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">View Calendar</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>

          {showDatePicker && (
            <div className="mt-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-600">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newMonth = new Date(selectedMonth);
                    newMonth.setMonth(selectedMonth.getMonth() - 1);
                    if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
                      setSelectedMonth(newMonth);
                    }
                  }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
                </h4>
                
                <button
                  onClick={() => {
                    const newMonth = new Date(selectedMonth);
                    newMonth.setMonth(selectedMonth.getMonth() + 1);
                    if (newMonth <= oneYearFromNow) {
                      setSelectedMonth(newMonth);
                    }
                  }}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((dayData, index) => {
                  if (!dayData) {
                    return <div key={index} className="h-8"></div>;
                  }

                  const { day, dateString, isSelectable } = dayData;
                  const isSelected = selectedDates.includes(dateString);
                  const status = getAvailabilityStatus(dateString);
                  
                  return (
                    <button
                      key={dateString}
                      onClick={() => isSelectable && handleDateToggle(dateString)}
                      disabled={!isSelectable}
                      className={`h-8 rounded-md text-xs font-semibold transition-all duration-200 relative border ${
                        !isSelectable
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed border-transparent'
                          : isSelected
                          ? status === 'unavailable'
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                            : 'bg-red-600 text-white border-red-600'
                          : 'text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      {checking && isSelected && (
                        <Loader className="absolute inset-0 m-auto w-3 h-3 animate-spin text-white dark:text-red-400" />
                      )}
                      <span className={checking && isSelected ? 'opacity-0' : 'opacity-100'}>
                        {day}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Dates Summary */}
      {selectedDates.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Selected Dates ({selectedDates.length})</span>
            </h3>
            {checking && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Loader className="w-3 h-3 animate-spin" />
                <span className="text-xs font-medium">Checking availability...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedDates.map(date => {
              const status = getAvailabilityStatus(date);
              return (
                <div key={date} className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                  status === 'available' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                  status === 'unavailable' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      status === 'available' ? 'bg-green-500' :
                      status === 'unavailable' ? 'bg-red-500' :
                      'bg-gray-400 dark:bg-gray-300'
                    }`} />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{formatDate(date)}</span>
                    {status === 'available' && (
                      <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">Available</span>
                    )}
                    {status === 'unavailable' && (
                      <span className="text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">Unavailable</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDateToggle(date)}
                    className="w-6 h-6 bg-white dark:bg-gray-500 border border-gray-300 dark:border-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-500 rounded-full flex items-center justify-center transition-all duration-200 group"
                  >
                    <X className="w-3 h-3 text-gray-500 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-300" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {hasUnavailableDates && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1 text-sm">Some Dates Unavailable</h3>
              <p className="text-red-800 dark:text-red-300 text-sm">Please select different dates or remove the unavailable ones to proceed with your booking.</p>
            </div>
          </div>
        </div>
      )}

      {/* Booking Info */}
      <div className="text-center py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 text-xs">
          <Calendar className="w-3 h-3" />
          <span>Available booking period: Today - {oneYearFromNow.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityChecker;