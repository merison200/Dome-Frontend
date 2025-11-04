// import React, { useState, useEffect } from 'react';
// import { 
//   Building2, 
//   MapPin, 
//   Star, 
//   TrendingUp, 
//   TrendingDown,
//   Eye,
//   MoreVertical,
//   Calendar,
//   DollarSign,
//   AlertTriangle,
//   Loader2,
//   RefreshCw
// } from 'lucide-react';
// import { analyticsAPI, type HallPerformance } from '../../../services/hallAnalytics';

// interface HallPerformanceTableProps {
//   onViewDetails?: (hall: HallPerformance) => void;
//   refreshInterval?: number; // Optional auto-refresh interval in ms
// }

// const HallPerformanceTable: React.FC<HallPerformanceTableProps> = ({ 
//   onViewDetails,
//   refreshInterval 
// }) => {
//   const [data, setData] = useState<HallPerformance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortBy, setSortBy] = useState<keyof HallPerformance>('totalRevenue');
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [selectedHall, setSelectedHall] = useState<HallPerformance | null>(null);
//   const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

//   // Fetch hall performance data
//   const fetchHallPerformance = async () => {
//     try {
//       setError(null);
//       const hallData = await analyticsAPI.getHallPerformance();
//       setData(hallData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch hall performance data');
//       console.error('Error fetching hall performance:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Manual refresh handler
//   const handleRefresh = async () => {
//     setLoading(true);
//     await fetchHallPerformance();
//   };

//   // Initial data fetch
//   useEffect(() => {
//     fetchHallPerformance();
//   }, []);

//   // Auto-refresh setup
//   useEffect(() => {
//     if (!refreshInterval) return;

//     const interval = setInterval(fetchHallPerformance, refreshInterval);
//     return () => clearInterval(interval);
//   }, [refreshInterval]);

//   // Sort data
//   const sortedData = [...data].sort((a, b) => {
//     const aValue = a[sortBy];
//     const bValue = b[sortBy];
    
//     if (typeof aValue === 'number' && typeof bValue === 'number') {
//       return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
//     }
    
//     if (typeof aValue === 'string' && typeof bValue === 'string') {
//       return sortOrder === 'asc' 
//         ? aValue.localeCompare(bValue)
//         : bValue.localeCompare(aValue);
//     }
    
//     return 0;
//   });

//   const handleSort = (column: keyof HallPerformance) => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortBy(column);
//       setSortOrder('desc');
//     }
//   };

//   const getPerformanceStatus = (hall: HallPerformance) => {
//     const bookingRate = hall.totalBookings;
//     const revenueRate = hall.totalRevenue;
    
//     if (bookingRate >= 20 && revenueRate >= 500000) {
//       return { status: 'Excellent', color: 'bg-green-100 text-green-800', icon: TrendingUp };
//     } else if (bookingRate >= 10 && revenueRate >= 200000) {
//       return { status: 'Good', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
//     } else if (bookingRate >= 5 && revenueRate >= 100000) {
//       return { status: 'Average', color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp };
//     } else {
//       return { status: 'Needs Attention', color: 'bg-red-100 text-red-800', icon: TrendingDown };
//     }
//   };

//   const getConfirmationRate = (hall: HallPerformance) => {
//     if (hall.totalBookings === 0) return 0;
//     return (hall.confirmedBookings / hall.totalBookings) * 100;
//   };

//   const getRatingLabel = (rating: number) => {
//     if (rating >= 4.5) return 'Excellent';
//     if (rating >= 4.0) return 'Very Good';
//     if (rating >= 3.5) return 'Good';
//     if (rating >= 3.0) return 'Fair';
//     return 'Poor';
//   };

//   const SortButton = ({ column, children }: { column: keyof HallPerformance; children: React.ReactNode }) => (
//     <button
//       onClick={() => handleSort(column)}
//       className="flex items-center space-x-1 text-left hover:text-blue-600 transition-colors group"
//     >
//       <span>{children}</span>
//       {sortBy === column && (
//         <div className="flex flex-col">
//           <div className={`w-0 h-0 border-l-2 border-r-2 border-transparent ${
//             sortOrder === 'asc' ? 'border-b-2 border-b-blue-600' : 'border-b-2 border-b-gray-300'
//           }`} />
//           <div className={`w-0 h-0 border-l-2 border-r-2 border-transparent ${
//             sortOrder === 'desc' ? 'border-t-2 border-t-blue-600' : 'border-t-2 border-t-gray-300'
//           }`} />
//         </div>
//       )}
//     </button>
//   );

//   // Loading state
//   if (loading && data.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl border border-gray-200 p-8">
//         <div className="flex items-center justify-center space-x-3">
//           <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
//           <span className="text-gray-600">Loading hall performance data...</span>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error && data.length === 0) {
//     return (
//       <div className="bg-white rounded-2xl border border-gray-200 p-8">
//         <div className="text-center">
//           <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button
//             onClick={handleRefresh}
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <RefreshCw className="w-4 h-4 mr-2" />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Calculate summary statistics
//   const totalBookings = data.reduce((sum, hall) => sum + hall.totalBookings, 0);
//   const totalRevenue = data.reduce((sum, hall) => sum + hall.totalRevenue, 0);
//   const averageRating = data.length > 0 ? data.reduce((sum, hall) => sum + hall.rating, 0) / data.length : 0;
//   const totalConfirmedBookings = data.reduce((sum, hall) => sum + hall.confirmedBookings, 0);
//   const overallConfirmationRate = totalBookings > 0 ? (totalConfirmedBookings / totalBookings) * 100 : 0;

//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Building2 className="w-5 h-5 text-blue-600" />
//               Hall Performance Analysis
//             </h3>
//             <p className="text-sm text-gray-500 mt-1">
//               Last updated: {lastUpdated.toLocaleTimeString()}
//             </p>
//           </div>
//           <div className="flex items-center space-x-3">
//             <div className="text-sm text-gray-500">
//               {data.length} halls analyzed
//             </div>
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
//               title="Refresh data"
//             >
//               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Error banner for refresh errors */}
//       {error && data.length > 0 && (
//         <div className="px-6 py-3 bg-red-50 border-b border-red-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <AlertTriangle className="w-4 h-4 text-red-600" />
//               <span className="text-sm text-red-700">Failed to refresh data: {error}</span>
//             </div>
//             <button
//               onClick={() => setError(null)}
//               className="text-red-600 hover:text-red-800"
//             >
//               ×
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <SortButton column="name">Hall Details</SortButton>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <SortButton column="totalBookings">Bookings</SortButton>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <SortButton column="totalRevenue">Revenue</SortButton>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <SortButton column="averageBookingValue">Avg. Value</SortButton>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 <SortButton column="rating">Rating</SortButton>
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Performance
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {sortedData.map((hall) => {
//               const performance = getPerformanceStatus(hall);
//               const confirmationRate = getConfirmationRate(hall);
//               const StatusIcon = performance.icon;
              
//               return (
//                 <tr key={hall._id} className="hover:bg-gray-50 transition-colors">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
//                         <Building2 className="w-5 h-5 text-blue-600" />
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">{hall.name}</div>
//                         <div className="text-sm text-gray-500 flex items-center gap-1">
//                           <MapPin className="w-3 h-3" />
//                           {hall.location}
//                         </div>
//                         <div className="text-xs text-gray-400">
//                           {hall.capacity} capacity • {hall.type}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900 font-medium">{hall.totalBookings}</div>
//                     <div className="text-xs text-gray-500 flex items-center gap-1">
//                       <Calendar className="w-3 h-3" />
//                       {hall.confirmedBookings} confirmed
//                     </div>
//                     <div className="text-xs text-gray-400">
//                       {analyticsAPI.formatPercentage(confirmationRate)} rate
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-medium text-gray-900">
//                       {analyticsAPI.formatCurrency(hall.totalRevenue)}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       Base: {analyticsAPI.formatCurrency(hall.basePrice)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900 font-medium">
//                       {analyticsAPI.formatCurrency(hall.averageBookingValue)}
//                     </div>
//                     <div className="text-xs text-gray-500 flex items-center gap-1">
//                       <DollarSign className="w-3 h-3" />
//                       per booking
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                       <span className="text-sm font-medium text-gray-900">{hall.rating.toFixed(1)}</span>
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {getRatingLabel(hall.rating)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.color}`}>
//                       <StatusIcon className="w-3 h-3 mr-1" />
//                       {performance.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center space-x-2">
//                       <button
//                         onClick={() => onViewDetails?.(hall)}
//                         className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
//                         title="View Details"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => setSelectedHall(hall)}
//                         className="text-gray-600 hover:text-gray-800 transition-colors p-1 hover:bg-gray-50 rounded"
//                         title="More Options"
//                       >
//                         <MoreVertical className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Enhanced Summary Footer */}
//       <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
//           <div className="text-center">
//             <div className="text-gray-500">Total Halls</div>
//             <div className="font-semibold text-gray-900">{data.length}</div>
//           </div>
//           <div className="text-center">
//             <div className="text-gray-500">Total Bookings</div>
//             <div className="font-semibold text-gray-900">{totalBookings}</div>
//             <div className="text-xs text-gray-400">
//               {totalConfirmedBookings} confirmed
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-gray-500">Total Revenue</div>
//             <div className="font-semibold text-gray-900">
//               {analyticsAPI.formatCurrency(totalRevenue)}
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-gray-500">Confirmation Rate</div>
//             <div className="font-semibold text-gray-900">
//               {analyticsAPI.formatPercentage(overallConfirmationRate)}
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="text-gray-500">Avg. Rating</div>
//             <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
//               <Star className="w-4 h-4 text-yellow-400 fill-current" />
//               {averageRating.toFixed(1)}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HallPerformanceTable;




import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Users,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { analyticsAPI, type HallPerformance } from '../../../services/hallAnalytics';

interface HallPerformanceTableProps {
  refreshInterval?: number;
}

const HallPerformanceTable: React.FC<HallPerformanceTableProps> = ({ 
  refreshInterval 
}) => {
  const [data, setData] = useState<HallPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof HallPerformance>('totalRevenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch hall performance data
  const fetchHallPerformance = async () => {
    try {
      setError(null);
      const hallData = await analyticsAPI.getHallPerformance();
      setData(hallData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hall performance data');
      console.error('Error fetching hall performance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setLoading(true);
    await fetchHallPerformance();
  };

  // Initial data fetch
  useEffect(() => {
    fetchHallPerformance();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(fetchHallPerformance, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const handleSort = (column: keyof HallPerformance) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getPerformanceStatus = (hall: HallPerformance) => {
    const bookingRate = hall.totalBookings;
    const revenueRate = hall.totalRevenue;
    
    if (bookingRate >= 20 && revenueRate >= 500000) {
      return { status: 'Excellent', color: 'bg-green-50 text-green-700 border-green-200', icon: TrendingUp };
    } else if (bookingRate >= 10 && revenueRate >= 200000) {
      return { status: 'Good', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: TrendingUp };
    } else if (bookingRate >= 5 && revenueRate >= 100000) {
      return { status: 'Average', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: TrendingUp };
    } else {
      return { status: 'Needs Attention', color: 'bg-red-50 text-red-700 border-red-200', icon: TrendingDown };
    }
  };

  const getConfirmationRate = (hall: HallPerformance) => {
    if (hall.totalBookings === 0) return 0;
    return (hall.confirmedBookings / hall.totalBookings) * 100;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4.0) return 'Very Good';
    if (rating >= 3.5) return 'Good';
    if (rating >= 3.0) return 'Fair';
    return 'Poor';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading && data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Loading hall performance data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalBookings = data.reduce((sum, hall) => sum + hall.totalBookings, 0);
  const totalRevenue = data.reduce((sum, hall) => sum + hall.totalRevenue, 0);
  const averageRating = data.length > 0 ? data.reduce((sum, hall) => sum + hall.rating, 0) / data.length : 0;
  const totalConfirmedBookings = data.reduce((sum, hall) => sum + hall.confirmedBookings, 0);
  const overallConfirmationRate = totalBookings > 0 ? (totalConfirmedBookings / totalBookings) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hall Performance</h1>
              <p className="text-gray-600 mt-2">Comprehensive analysis of all venue performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
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
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/60 mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium">Total Halls</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{data.length}</div>
            </div>

            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium">Total Revenue</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(totalRevenue).replace('NGN', '₦').split('.')[0]}
              </div>
            </div>

            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium">Total Bookings</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</div>
              <div className="text-red-600 text-sm mt-1">{totalConfirmedBookings} confirmed</div>
            </div>

            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium">Avg. Rating</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{averageRating.toFixed(1)}</div>
              <div className="text-red-600 text-sm mt-1">{overallConfirmationRate.toFixed(1)}% confirmed</div>
            </div>
          </div>
        </div>

        {/* Hall Performance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50 to-red-50/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Hall Performance Analysis</h2>
                <p className="text-gray-500 text-sm">Detailed venue performance metrics</p>
              </div>
              <div className="text-sm text-gray-500">
                {sortedData.length} halls
              </div>
            </div>
          </div>

          {/* Error banner for refresh errors */}
          {error && data.length > 0 && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">Failed to refresh data: {error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 text-lg"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Table Content */}
          <div className="divide-y divide-gray-200/60">
            {sortedData.map((hall) => {
              const performance = getPerformanceStatus(hall);
              const confirmationRate = getConfirmationRate(hall);
              const StatusIcon = performance.icon;
              
              return (
                <div key={hall._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
                    {/* Hall Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{hall.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${performance.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {performance.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {hall.location}
                            </div>
                            <div className="mt-1">
                              {hall.capacity} capacity • {hall.type}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bookings */}
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">{hall.totalBookings}</div>
                      <div className="text-sm text-gray-500">
                        {hall.confirmedBookings} confirmed
                      </div>
                      <div className="text-xs text-gray-400">
                        {analyticsAPI.formatPercentage(confirmationRate)} rate
                      </div>
                    </div>

                    {/* Revenue */}
                    <div>
                      <div className="font-bold text-red-600 text-lg">
                        {formatCurrency(hall.totalRevenue).replace('NGN', '₦').split('.')[0]}
                      </div>
                      <div className="text-sm text-gray-500">
                        Avg: {formatCurrency(hall.averageBookingValue).replace('NGN', '₦').split('.')[0]}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{hall.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {getRatingLabel(hall.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallPerformanceTable;