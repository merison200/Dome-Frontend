import React, { useState, useEffect } from 'react';
import {
  Music,
  Calendar,
  Users,
  Clock,
  Eye,
  Crown,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Loader2
} from 'lucide-react';
import { clubAPI, ClubEvent } from '../../services/club';

const NightclubPage: React.FC = () => {
  const [selectedGallery, setSelectedGallery] = useState<{
    images: string[];
    labels: string[];
    title?: string;
    description?: string;
    details?: { [key: string]: any };
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // State for events from backend
  const [upcomingEvents, setUpcomingEvents] = useState<ClubEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const clubData = {
    name: 'CodeD',
    capacity: 200,
    rating: 4.9,
    reviews: 50,
    operatingDays: ['Friday', 'Sunday'],
    operatingTime: '9:00 PM - Dawn',
    location: 'Dome, Akure',
    images: [
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760291012/FB_IMG_1760290736665_djbxf6.jpg',
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760294475/FB_IMG_1760294089762_iaxq2e.jpg',
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760294474/FB_IMG_1760294137947_p0dafy.jpg',
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760291007/FB_IMG_1760290728239_gxuyyi.jpg',
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760294474/FB_IMG_1760290814757_ix9lel.jpg'
    ],
    imageLabels: ['Main Floor', 'Main Floor']
  };

  // VIP Sections Data
  const vipSections = [
    {
      id: 'vip',
      name: 'VIP Section',
      description: 'Elevated experience with premium seating, dedicated service, and exclusive bar access',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760295819/FB_IMG_1760295622392_tz1gzo.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760295819/FB_IMG_1760295642176_uzjsgl.jpg'
      ],
      labels: ['VIP Room', 'VIP Room'],
      capacity: '10-15 people',
      features: ['Priority entry', 'Dedicated server', 'Premium drinks menu', 'Reserved seating', 'Dance floor access']
    },
    {
      id: 'vvip',
      name: 'VVIP Section',
      description: 'Ultimate luxury with private rooms, personal butler service, and exclusive amenities',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760295821/FB_IMG_1760295533913_da3k5a.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760295820/FB_IMG_1760295531966_h0ba2z.jpg'

      ],
      labels: ['VVIP Private Room', 'VVIP Private Room'],
      capacity: '5-8 people',
      features: ['Private room', 'Personal butler', 'Premium champagne service', 'Private entrance', 'Exclusive terrace access']
    }
  ];

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        setEventsError(null);
        
        // Get current date to filter upcoming events
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split('T')[0];
        
        // Fetch all events and filter for upcoming ones
        const response = await clubAPI.getAll({
          page: 1,
          limit: 20, // Adjust as needed
          sortBy: 'date',
          sortOrder: 'asc'
        });

        if (response.success && Array.isArray(response.data)) {
          // Filter for upcoming events only
          const upcoming = response.data.filter((event: ClubEvent) => 
            event.date >= currentDateString
          );
          setUpcomingEvents(upcoming);
        } else {
          setEventsError('Failed to load events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEventsError('Failed to load events');
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openGallery = (galleryData: {
    images: string[];
    labels: string[];
    title?: string;
    description?: string;
    details?: { [key: string]: any };
  }) => {
    setSelectedGallery(galleryData);
    setCurrentImageIndex(0);
  };

  const closeGallery = () => {
    setSelectedGallery(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedGallery.images.length - 1 : prev - 1
      );
    }
  };

  const ImageGallery = ({ images, labels, onGalleryClick, type = 'default', height = 'h-80' }: { 
    images: string[]; 
    labels: string[]; 
    onGalleryClick: () => void;
    type?: 'default' | 'vip' | 'event';
    height?: string;
  }) => {
    const [localCurrentIndex, setLocalCurrentIndex] = useState(0);
    
    return (
      <div className={`relative ${height} overflow-hidden group rounded-2xl`}>
        <img
          src={images[localCurrentIndex]}
          alt={labels[localCurrentIndex]}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                setLocalCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
              }}
              className="ml-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setLocalCurrentIndex(prev => (prev + 1) % images.length);
              }}
              className="mr-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  setLocalCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === localCurrentIndex ? 'bg-yellow-400 scale-125' : 'bg-white/70 hover:bg-white/90'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image Label */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
          {labels[localCurrentIndex]}
        </div>

        {/* View Gallery Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onGalleryClick();
            }}
            className="absolute top-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
          >
            <Eye className="w-4 h-4" />
            <span>Gallery</span>
          </button>
        )}

        {/* Photo Count */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10">
          {localCurrentIndex + 1}/{images.length}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://res.cloudinary.com/drixel4wv/image/upload/v1760294474/FB_IMG_1760290814757_ix9lel.jpg" 
            alt="CodeD Nightclub" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                CodeD
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              Akure’s favorite spot for unforgettable nights and nonstop entertainment.
            </p>
            <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span className="font-medium">{clubData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{clubData.rating} ({clubData.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-900">
      {/* Club Overview - Image Focused */}
        <section className="mb-16"> 
          <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700"> 
            <ImageGallery images={clubData.images} labels={clubData.imageLabels} onGalleryClick={() => openGallery({ images: clubData.images, labels: clubData.imageLabels, title: clubData.name })} height="h-[600px]" /> 
              {/* Minimal Info Section - Only 10% */} 
              <div className="p-4"> <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4"> 
                  <div className="flex items-center space-x-2 text-gray-300"> 
                    <Users className="w-4 h-4 text-yellow-400" /> 
                    <span className="font-semibold">{clubData.capacity} Capacity</span> 
                    </div> <div className="flex items-center space-x-2 text-gray-300"> 
                      <Clock className="w-4 h-4 text-yellow-400" /> 
                      <span className="font-semibold">{clubData.operatingTime}</span> 
                      </div> 
                    </div> 
                  <div className="flex items-center space-x-4"> 
                <div className="flex items-center space-x-2"> 
              <Star className="w-4 h-4 text-yellow-400 fill-current" /> 
              <span className="font-semibold text-white">{clubData.rating}</span> 
              <span className="text-sm text-gray-400">({clubData.reviews} reviews)</span> 
            </div> 
            <div className="flex space-x-2"> {clubData.operatingDays.map(day => ( 
            <span key={day} className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold"> {day} </span> ))} 
            </div> 
          </div> 
          </div> 
        </div> 
        </div> 
      </section>
      
      {/* VIP Sections */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">VIP Experience</h2>
            <p className="text-xl text-gray-300">Complimentary access to luxury sections</p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-6 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {vipSections.map(section => (
              <div 
                key={section.id} 
                className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700 hover:border-yellow-500/50"
                onClick={() => openGallery({
                  images: section.images,
                  labels: section.labels,
                  title: section.name,
                  description: section.description,
                  details: {
                    capacity: section.capacity,
                    features: section.features.join(', '),
                    access: 'Complimentary (Premium drinks available)'
                  }
                })}
              >
                <ImageGallery 
                  images={section.images}
                  labels={section.labels}
                  onGalleryClick={() => openGallery({
                    images: section.images,
                    labels: section.labels,
                    title: section.name,
                    description: section.description,
                    details: {
                      capacity: section.capacity,
                      features: section.features.join(', '),
                      access: 'Complimentary (Premium drinks available)'
                    }
                  })}
                  type="vip"
                  height="h-[500px]"
                />
                
                {/* Minimal Info Section - Only 5-10% */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{section.name}</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                        FREE ACCESS
                      </span>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Users className="w-3 h-3 text-yellow-400" />
                        <span className="text-sm font-semibold">{section.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events - Now using backend data */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-300">Don't miss these electrifying nights</p>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto mt-6 rounded-full"></div>
          </div>
          
          {eventsLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
              <span className="ml-3 text-gray-300">Loading events...</span>
            </div>
          )}

          {eventsError && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{eventsError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!eventsLoading && !eventsError && upcomingEvents.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Upcoming Events</h3>
                <p className="text-gray-400">Check back soon for exciting new events!</p>
              </div>
            </div>
          )}

          {!eventsLoading && !eventsError && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {upcomingEvents.map(event => (
                <div 
                  key={event._id} 
                  className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-700 hover:border-yellow-500/50"
                  onClick={() => openGallery({
                    images: event.images,
                    labels: event.labels,
                    title: event.name,
                    description: event.description,
                    details: {
                      date: formatDate(event.date),
                      time: event.time,
                      dj: event.dj.join(', '),
                      hypeman: event.hypeman.join(', ')
                    }
                  })}
                >
                  <ImageGallery 
                    images={event.images}
                    labels={event.labels}
                    onGalleryClick={() => openGallery({
                      images: event.images,
                      labels: event.labels,
                      title: event.name,
                      description: event.description,
                      details: {
                        date: formatDate(event.date),
                        time: event.time,
                        dj: event.dj.join(', '),
                        hypeman: event.hypeman.join(', ')
                      }
                    })}
                    type="event"
                    height="h-[350px]"
                  />
                  
                  {/* Minimal Info Section - Only 5% */}
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{event.name}</h3>
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center space-x-1 text-gray-300">
                            <Calendar className="w-3 h-3 text-yellow-400" />
                            <span className="font-semibold">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-300">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            <span className="font-semibold">{event.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-300">
                        <Music className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-semibold">{event.dj.slice(0, 1).join('')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About CodeD - Static Content */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">About CodeD</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="bg-gray-800 rounded-3xl shadow-2xl p-12 border border-gray-700">
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-300 mb-8 leading-relaxed text-center">
                At Club Coded, every night is a vibe. Feel the beat, enjoy the lights, and make memories in Akure’s finest nightlife spot.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Features & Amenities</h3>
                  <div className="space-y-4">
                    {[
                      'Good sound system',
                      'LED wall & ceiling displays',
                      'Top DJs & hypemen on deck',
                      'Premium spirits & cocktails',
                      'Exclusive VIP zones',
                      '24/7 professional security',
                      'Spacious & secure parking'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 text-gray-300">
                        <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">The Experience</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Step into Club CodeD and feel the energy come alive. From the sound to the lights, every detail is crafted to thrill your senses and keep the vibe going all night.
                  </p>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Every moment at CodeD hits different. The music, the lights, and the atmosphere all blend to create an unforgettable experience.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    With top DJs, Hypemen, premium drinks, and a crowd that knows how to party, CodeD is more than a club it’s the heartbeat of Akure nightlife.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Enhanced Image Gallery Modal */}
      {selectedGallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-3xl max-w-7xl w-full min-h-[95vh] max-h-fit shadow-2xl border border-gray-700 my-4">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-3 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="text-xl font-bold text-white">{selectedGallery.title}</h2>
              <button
                onClick={closeGallery}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 pb-6">
              {/* Main Image Gallery - 95% of modal */}
              <div className="relative mb-4">
                <div className="relative h-[80vh] rounded-2xl overflow-hidden">
                  <img
                    src={selectedGallery.images[currentImageIndex]}
                    alt={selectedGallery.labels[currentImageIndex]}
                    className="w-full h-full object-cover"
                  />
                  
                  {selectedGallery.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-3 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
                        {currentImageIndex + 1} / {selectedGallery.images.length}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {selectedGallery.labels[currentImageIndex]}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {selectedGallery.images.length > 1 && (
                  <div className="flex space-x-3 mt-3 overflow-x-auto pb-2">
                    {selectedGallery.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-yellow-500 scale-105' : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimal Details - 5% */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  {selectedGallery.description && (
                    <p className="text-gray-300 mb-3 leading-relaxed text-sm">{selectedGallery.description}</p>
                  )}
                  
                  {selectedGallery.details && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(selectedGallery.details).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-1 text-xs">
                          <span className="font-semibold text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-semibold text-gray-300 text-right max-w-xs">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-xl p-3 border border-yellow-500/30">
                  <h4 className="text-sm font-bold text-white mb-2">Ready to Experience CodeD?</h4>
                  
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold">{clubData.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Clock className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold">{clubData.operatingTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <Calendar className="w-3 h-3 text-yellow-400" />
                      <span className="font-semibold">{clubData.operatingDays.join(', ')}</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black py-2 rounded-lg font-bold hover:from-yellow-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-xs">
                    <Phone className="w-3 h-3" />
                    <span>Call for Reservations</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightclubPage;