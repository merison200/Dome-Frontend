import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Users,
  Building2,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Eye,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  CreditCard,
  Banknote
} from 'lucide-react';
import {
  analyticsAPI,
  type DashboardOverview,
  type RevenueAnalytics,
  type BookingAnalytics,
  type HallUtilization,
  type HallPerformance,
  type EventTypeAnalytics
} from '../../../services/hallAnalytics';

// Compact Chart Component
const CompactChart = ({ data, title, color = '#EF4444', type = 'revenue' }: { 
  data: any[], 
  title: string, 
  color?: string,
  type?: 'revenue' | 'booking'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-48 flex items-end justify-between space-x-1">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex-1 flex flex-col items-center relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Tooltip */}
            {hoveredIndex === index && (
              <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                <div className="font-medium">{item.label}</div>
                <div>
                  {type === 'revenue' 
                    ? `Revenue: ${analyticsAPI.formatCurrency(item.value)}`
                    : `Bookings: ${item.value}`
                  }
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
              </div>
            )}
            
            <div 
              className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
              style={{ 
                backgroundColor: color,
                height: `${Math.max((item.value / maxValue) * 120, 4)}px`
              }}
            />
            <div className="text-xs text-gray-600 mt-1 text-center font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal Bar Chart for better space utilization
const HorizontalChart = ({ data, title, color = '#EF4444', type = 'revenue' }: { 
  data: any[], 
  title: string, 
  color?: string,
  type?: 'revenue' | 'booking'
}) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-12 text-xs font-medium text-gray-600 text-right">
              {item.label}
            </div>
            <div className="flex-1 relative">
              <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ 
                    backgroundColor: color,
                    width: `${(item.value / maxValue) * 100}%`
                  }}
                >
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DonutChart = ({ data, title }: { data: any[], title: string }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4'];
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="35"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="6"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={-data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0)}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {data.map((item, index) => {
          const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#06B6D4'];
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-gray-700 text-xs">{item.label}</span>
              </div>
              <span className="font-medium text-gray-900 text-xs">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Data states
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueAnalytics[]>([]);
  const [bookingData, setBookingData] = useState<BookingAnalytics[]>([]);
  const [hallUtilization, setHallUtilization] = useState<HallUtilization[]>([]);
  const [hallPerformance, setHallPerformance] = useState<HallPerformance[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeAnalytics[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod, selectedYear]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        overviewRes,
        revenueRes,
        bookingRes,
        utilizationRes,
        performanceRes,
        eventTypesRes
      ] = await Promise.all([
        analyticsAPI.getDashboardOverview(),
        analyticsAPI.getRevenueAnalytics({ period: selectedPeriod, year: selectedYear }),
        analyticsAPI.getBookingAnalytics({ period: selectedPeriod, year: selectedYear }),
        analyticsAPI.getHallUtilization(),
        analyticsAPI.getHallPerformance(),
        analyticsAPI.getEventTypeAnalytics()
      ]);

      setOverview(overviewRes);
      setRevenueData(revenueRes);
      setBookingData(bookingRes);
      setHallUtilization(utilizationRes);
      setHallPerformance(performanceRes);
      setEventTypes(eventTypesRes);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  // Helper function to get short month names
  const getShortMonthName = (monthNumber: number): string => {
    const shortMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return shortMonths[monthNumber - 1] || '';
  };

  // Prepare chart data with shortened month names
  const revenueChartData = revenueData.map(item => ({
    label: selectedPeriod === 'monthly' 
      ? getShortMonthName(item._id.month || 1)
      : item._id.year.toString(),
    value: item.revenue
  }));

  const bookingChartData = bookingData.map(item => ({
    label: selectedPeriod === 'monthly' 
      ? getShortMonthName(item._id.month || 1)
      : item._id.year.toString(),
    value: item.totalBookings
  }));

  const paymentMethodData = overview?.paymentMethods.map(method => ({
    label: method._id === 'card' ? 'Card Payments' : 'Bank Transfer',
    value: method.count
  })) || [];

  const bookingTypeData = overview?.bookingTypes.map(type => ({
    label: type._id === 'online' ? 'Online Bookings' : 'Offline Bookings',
    value: type.count
  })) || [];

  // Calculate totals for display
  const totalRevenueFromChart = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookingsFromChart = bookingData.reduce((sum, item) => sum + item.totalBookings, 0);

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
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'yearly')}
              className="px-4 py-2 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="monthly">Monthly View</option>
              <option value="yearly">Yearly View</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Section - No Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Revenue</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {analyticsAPI.formatCurrency(overview?.totalRevenue || 0)}
              </p>
              <p className="text-red-600 text-xs mt-2">
                This month: {analyticsAPI.formatCurrency(overview?.monthlyRevenue || 0)}
              </p>
            </div>

            <div className="border-b sm:border-b-0 lg:border-r border-gray-100 pb-6 sm:pb-0 lg:pr-6">
              <p className="text-gray-500 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {overview?.totalBookings || 0}
              </p>
              <p className="text-red-600 text-xs mt-2">
                This month: {overview?.monthlyBookings || 0}
              </p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6">
              <p className="text-gray-500 text-sm mb-2">Active Halls</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {hallPerformance.length}
              </p>
              <p className="text-red-600 text-xs mt-2">
                Avg Utilization: {hallUtilization.length > 0 ? (hallUtilization.reduce((sum, hall) => sum + hall.utilizationRate, 0) / hallUtilization.length).toFixed(1) : 0}%
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Event Types</p>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 break-words">
                {eventTypes.length}
              </p>
              <p className="text-red-600 text-xs mt-2">
                Most Popular: {eventTypes[0]?._id || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <CompactChart 
              data={revenueChartData} 
              title={`Revenue Trends (${selectedPeriod === 'monthly' ? selectedYear : 'Last 5 Years'})`}
              color="#EF4444"
              type="revenue"
            />
            <div className="bg-white rounded-3xl shadow-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Period Total Revenue:</span>
                <span className="font-bold text-red-600">{analyticsAPI.formatCurrency(totalRevenueFromChart)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <CompactChart 
              data={bookingChartData} 
              title={`Booking Trends (${selectedPeriod === 'monthly' ? selectedYear : 'Last 5 Years'})`}
              color="#10B981"
              type="booking"
            />
            <div className="bg-white rounded-3xl shadow-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Period Total Bookings:</span>
                <span className="font-bold text-green-600">{totalBookingsFromChart}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DonutChart 
            data={paymentMethodData} 
            title="Payment Methods Distribution"
          />
          <DonutChart 
            data={bookingTypeData} 
            title="Booking Types Distribution"
          />
        </div>

        {/* Hall Performance Table */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                Hall Performance Analysis
              </h3>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hallPerformance.slice(0, 10).map((hall) => (
                  <tr key={hall._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hall.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hall.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{hall.totalBookings}</div>
                      <div className="text-xs text-gray-500">{hall.confirmedBookings} confirmed</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {analyticsAPI.formatCurrency(hall.totalRevenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {analyticsAPI.formatCurrency(hall.averageBookingValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-900">{hall.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hall.totalBookings > 10 
                          ? 'bg-green-100 text-green-800' 
                          : hall.totalBookings > 5 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hall.totalBookings > 10 ? 'High Demand' : hall.totalBookings > 5 ? 'Moderate' : 'Low Demand'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Types Analysis */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-600" />
              Event Types Analysis
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTypes.map((event, index) => {
              const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-indigo-500'];
              return (
                <div key={event._id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-xs text-gray-500">{((event.count / eventTypes.reduce((sum, e) => sum + e.count, 0)) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 capitalize mb-1">{event._id}</div>
                  <div className="text-xs text-gray-600">{event.count} bookings</div>
                  <div className="text-xs text-gray-600">{analyticsAPI.formatCurrency(event.revenue)} revenue</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hall Utilization */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600" />
              Hall Utilization Rates
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {hallUtilization.slice(0, 8).map((hall) => (
                <div key={hall._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{hall.hallName}</span>
                      <span className="text-sm text-gray-600">{analyticsAPI.formatPercentage(hall.utilizationRate)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(hall.utilizationRate, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{hall.bookings} bookings</span>
                      <span>{analyticsAPI.formatCurrency(hall.revenue)} revenue</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;