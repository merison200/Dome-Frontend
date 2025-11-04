import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Star, MapPin, Calendar, Filter,
         Search, Loader,ChevronLeft, ChevronRight, Eye, 
         X, Crown, Sparkles } from 'lucide-react';
import { hallAPI, Hall } from '../../services/hall';

const HallsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [filteredHalls, setFilteredHalls] = useState<Hall[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch halls from backend
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await hallAPI.getAll();
        setHalls(data);
        setFilteredHalls(data);
        
        // Initialize image indices
        const initialIndices: { [key: string]: number } = {};
        data.forEach(hall => {
          if (hall._id) {
            initialIndices[hall._id] = 0;
          }
        });
        setCurrentImageIndex(initialIndices);
      } catch (err) {
        console.error('Error fetching halls:', err);
        setError('Failed to load halls. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  // Filter halls based on search and filters
  useEffect(() => {
    let filtered = halls;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(hall => 
        hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hall.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Capacity filter
    if (selectedCapacity) {
      filtered = filtered.filter(hall => {
        switch (selectedCapacity) {
          case 'small': return hall.capacity <= 200;
          case 'medium': return hall.capacity > 200 && hall.capacity <= 350;
          case 'large': return hall.capacity > 350;
          default: return true;
        }
      });
    }

    // Price filter
    if (selectedPrice) {
      filtered = filtered.filter(hall => {
        switch (selectedPrice) {
          case 'budget': return hall.basePrice < 1000000; // 1M Naira
          case 'mid': return hall.basePrice >= 1000000 && hall.basePrice <= 3000000; // 1M-3M
          case 'premium': return hall.basePrice > 3000000; // 3M+
          default: return true;
        }
      });
    }

    setFilteredHalls(filtered);
  }, [searchTerm, selectedCapacity, selectedPrice, halls]);

  const handleFilterChange = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const nextImage = (hallId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: (prev[hallId] + 1) % totalImages
    }));
  };

  const prevImage = (hallId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hallId]: prev[hallId] === 0 ? totalImages - 1 : prev[hallId] - 1
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const openHallDetails = (hall: Hall) => {
    setSelectedHall(hall);
    setModalImageIndex(0);
  };

  const closeHallDetails = () => {
    setSelectedHall(null);
    setModalImageIndex(0);
  };

  const nextModalImage = () => {
    if (selectedHall) {
      setModalImageIndex((prev) => 
        prev === selectedHall.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevModalImage = () => {
    if (selectedHall) {
      setModalImageIndex((prev) => 
        prev === 0 ? selectedHall.images.length - 1 : prev - 1
      );
    }
  };

  const HallImageGallery = ({ hall }: { hall: Hall }) => {
    const hallId = hall._id || '';
    const currentIndex = currentImageIndex[hallId] || 0;
    
    return (
      <div className="relative h-96 overflow-hidden group rounded-t-2xl">
        <img
          src={hall.images[currentIndex]?.url || '/placeholder-hall.jpg'}
          alt={`${hall.name} - ${hall.images[currentIndex]?.label || 'Hall view'}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Navigation Buttons */}
        {hall.images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                prevImage(hallId, hall.images.length);
              }}
              className="ml-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                nextImage(hallId, hall.images.length);
              }}
              className="mr-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Image Indicators */}
        {hall.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {hall.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentImageIndex(prev => ({ ...prev, [hallId]: index }));
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-red-400 scale-125' : 'bg-white/70 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{hall.rating}</span>
          </div>
        </div>

        {/* View Gallery Button */}
        {hall.images.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              openHallDetails(hall);
            }}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
          >
            <Eye className="w-4 h-4" />
            <span>Gallery</span>
          </button>
        )}

        {/* Photo Count */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10">
          {currentIndex + 1}/{hall.images.length}
        </div>
      </div>
    );
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="flex justify-center items-center py-12">
      <Loader className="w-8 h-8 animate-spin text-red-600" />
      <span className="ml-3 text-gray-600 dark:text-gray-300">Loading halls...</span>
    </div>
  );

  // Error Component
  const ErrorComponent = () => (
    <div className="text-center py-12">
      <p className="text-red-400 mb-4">{error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        Retry
      </button>
    </div>
  );

  // No Results Component
  const NoResultsComponent = () => (
    <div className="text-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Halls Found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria to find more options</p>
      </div>
    </div>
  );

  if (loading && halls.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading halls...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to Load Halls</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-blue-900 text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/drixel4wv/image/upload/v1760362412/enhanced_hd_realistic_u7761w.jpg"
            alt="Premium Event Halls"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-blue-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                Dome
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-red-200 mt-4">
                Event Halls
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              Discover our beautiful event halls, thoughtfully designed to make every occasion unforgettable
            </p>

            <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-400" />
                <span className="font-medium">Dome, Akure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-red-400 fill-current" />
                <span className="font-medium">4.9 (200 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filters */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search event halls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                />
              </div>
              
              <select
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
              >
                <option value="">All Capacities</option>
                <option value="small">Up to 200 guests</option>
                <option value="medium">200-350 guests</option>
                <option value="large">350+ guests</option>
              </select>
              
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
              >
                <option value="">All Price Ranges</option>
                <option value="budget">Under ₦1,000,000</option>
                <option value="mid">₦1,000,000-₦3,000,000</option>
                <option value="premium">₦3,000,000+</option>
              </select>
              
              <button 
                onClick={handleFilterChange}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Filter className="w-5 h-5" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </section>

        {/* Loading indicator */}
        {loading && <LoadingComponent />}

        {/* Results */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Event Halls Collection
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose from our collection of premium venues
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredHalls.map((hall) => (
              <div 
                key={hall._id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
                onClick={() => openHallDetails(hall)}
              >
                <HallImageGallery hall={hall} />
                
                {/* Content Section - Reduced height */}
                <div className="p-6">
                  {/* Header with Title and Price */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{hall.name}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatPrice(hall.basePrice)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">base</div>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm line-clamp-1">{hall.location}</span>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{hall.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                      <span>{hall.rating}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      to={`/book/halls/${hall._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-gradient-to-r from-red-600 to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-red-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 text-sm shadow-lg hover:shadow-xl"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Now</span>
                    </Link>
                    
                    {hall.images.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openHallDetails(hall);
                        }}
                        className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {filteredHalls.length === 0 && !loading && <NoResultsComponent />}

        {/* About Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Dome Event Halls
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover what makes us special
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span>Our Story</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
                Located in the heart of Akure, our event halls have become the premier
                destination for those seeking exceptional venues for their special occasions.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Our commitment to quality, service, and ambiance has made us a favorite among
                locals and visitors alike for weddings, corporate events, and celebrations.
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span>Features & Amenities</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                    'Largest parking space in Akure',
                    'Steady power and water supply',
                    'Vip and VVip Rooms for special guests',
                    'Fully air-conditioned halls',
                    'Strong security presence',
                    'Bright lighting and party effects',
                    'Clean and modern restrooms',
                    'Flexible seating arrangements',
                    'Professional event support team',
                    'Excellent customer service'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Image Gallery Modal */}
      {selectedHall && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedHall.name}</h2>
              <button
                onClick={closeHallDetails}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>
            </div>

            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Main Image Gallery */}
              <div className="relative mb-8">
                <div className="relative h-96 rounded-3xl overflow-hidden">
                  <img
                    src={selectedHall.images[modalImageIndex]?.url}
                    alt={`${selectedHall.name} - ${selectedHall.images[modalImageIndex]?.label}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {selectedHall.images.length > 1 && (
                    <>
                      <button
                        onClick={prevModalImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={nextModalImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                        {modalImageIndex + 1} / {selectedHall.images.length}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {selectedHall.images[modalImageIndex]?.label}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {selectedHall.images.length > 1 && (
                  <div className="flex space-x-4 mt-6 overflow-x-auto pb-2">
                    {selectedHall.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setModalImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          index === modalImageIndex 
                            ? 'border-red-500 scale-105' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hall Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hall Details</h3>
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Capacity</div>
                        <div className="text-gray-600 dark:text-gray-400">{selectedHall.capacity} guests</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Size & Location</div>
                        <div className="text-gray-600 dark:text-gray-400">{selectedHall.size} • {selectedHall.location}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400 fill-current" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Rating</div>
                        <div className="text-gray-600 dark:text-gray-400">{selectedHall.rating}/5 ({selectedHall.reviews} reviews)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                      {formatPrice(selectedHall.basePrice)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mb-4">Base package (includes setup & cleanup)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Additional hours: {formatPrice(selectedHall.additionalHourPrice)} per hour
                    </div>
                    <Link
                      to={`/book/halls/${selectedHall._id}`}
                      className="w-full bg-gradient-to-r from-red-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book This Hall</span>
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">{selectedHall.description}</p>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Features & Amenities</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Hall Features</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedHall.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedHall.amenities && selectedHall.amenities.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Included Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedHall.amenities.map((amenity, index) => (
                            <span key={index} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallsPage;