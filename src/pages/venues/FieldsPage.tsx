import React, { useState } from 'react';
import {
  TreePine,
  Camera,
  Calendar,
  Users,
  Car,
  Eye,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Droplets,
  Shield,
  Tent,
  Music,
  AirVent,
  Clock,
  Video,
  ImageIcon,
  Utensils,
  Gift,
  Sparkles,
  Crown
} from 'lucide-react';

const FieldsPage: React.FC = () => {
  const [selectedGallery, setSelectedGallery] = useState<{
    images: string[];
    labels: string[];
    title?: string;
    description?: string;
    details?: { [key: string]: any };
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fieldsData = {
    name: 'The Dome Green Fields',
    location: 'Dome, Akure',
    rating: 4.9,
    reviews: 28,
    description: 'Spacious green fields ideal for photo & video shoots, trade fairs & exhibitions, picnics and all kinds of outdoor events.',
    features: [
      'Wide open spaces for all kinds of events',
      'Perfect natural light for photos and videos',
      'Secure environment',
      'Reliable electricity and water supply',
      'Spacious parking area',
      'Clean and accessible restrooms',
      'Event setup assistance',
      'Drone-friendly location',
      'Peaceful and beautiful surroundings'
    ]
  };

  // Field Types Data
  const fieldTypes = [
    {
      id: 'photo-shoots',
      name: 'Photo & Video Shoots',
      description: 'Perfect spot for outdoor photo and video shoots with a natural background',
      images: [
        'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      ],
      labels: ['photo & video shoots'],
      capacity: '5-50 people',
      features: [
        'Good natural light',
        'Different background spots',
        'Space for your equipment',
        'Changing rooms available',
        'Help and support on site'
      ]
    },
    {
      id: 'trade-fairs',
      name: 'Trade Fairs & Exhibitions',
      description: 'Spacious outdoor venue perfect for trade shows, exhibitions and business events',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1761494194/Dordrecht_is_%C3%A9%C3%A9n_van_de_steden_met_de_meeste_gfopt6.jpg'
      ],
      labels: ['Trade Fairs & Exhibitions'],
      capacity: '100-2000 people',
      features: [
        'Spacious open compound',
        'Booths and display areas for vendors',
        'Big parking space',
        'Constant power and water supply',
        'Clean restrooms',
        'Easy setup and loading access',
        'Convenient location in town'
      ]
    },
    {
      id: 'picnics',
      name: 'Picnics & Family Gatherings',
      description: 'Perfect green spaces for family picnics, corporate retreats and intimate outdoor gatherings',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1761494992/Me_enamore_del_diablo_PAUSADA_ctheci.jpg'
      ],
      labels: ['Family Picnic'],
      capacity: '20-200 people',
      features: [
        'Cool shaded spots',
        'Seating areas',
        'Play area for kids',
        'Food and catering support',
        'Clean restrooms nearby',
        'Big parking space',
        'Safe and secure environment'
      ]
    },
    {
      id: 'festivals',
      name: 'Festivals & Large Events',
      description: 'Expansive fields suitable for music festivals, cultural events, and large-scale celebrations',
      images: [
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
      ],
      labels: ['Music Festival', 'Cultural Events', 'Food Festival', 'Outdoor Concert'],
      capacity: '500-2000 people',
      features: [
        'Spacious event grounds',
        'Stage and performance areas',
        'Sound and lighting support',
        'Multiple entry and exit points',
        'Ample parking space',
        'Security and crowd control',
        'Emergency access routes'
      ]
    }
  ];

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

  const ImageGallery = ({
    images,
    labels,
    onGalleryClick,
    type = 'default',
    height = 'h-96'
  }: {
    images: string[];
    labels: string[];
    onGalleryClick: () => void;
    type?: 'default' | 'field';
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
              onClick={e => {
                e.preventDefault();
                setLocalCurrentIndex(prev =>
                  prev === 0 ? images.length - 1 : prev - 1
                );
              }}
              className="ml-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={e => {
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={e => {
                  e.preventDefault();
                  setLocalCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === localCurrentIndex
                    ? 'bg-green-400 scale-125'
                    : 'bg-white/70 hover:bg-white/90'
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
            onClick={e => {
              e.preventDefault();
              onGalleryClick();
            }}
            className="absolute top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/drixel4wv/image/upload/v1760362987/476839062_651267830745678_2971274900428639346_n_ssg02w.jpg"
            alt="The Dome Green Fields"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                Dome
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-green-200 mt-4">
                Green Fields
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              {fieldsData.description}
            </p>
            <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">{fieldsData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-emerald-400 fill-current" />
                <span className="font-medium">{fieldsData.rating} ({fieldsData.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Field Types - Image Focused Cards */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Field Usage Options
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Discover the perfect outdoor space for your next event or project</p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {fieldTypes.map((field) => (
              <div 
                key={field.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 group"
                onClick={() => openGallery({
                  images: field.images,
                  labels: field.labels,
                  title: field.name,
                  description: field.description,
                  details: {
                    capacity: field.capacity,
                    features: field.features.join(', '),
                    availability: 'Visit for availability and pricing'
                  }
                })}
              >
                <ImageGallery
                  images={field.images}
                  labels={field.labels}
                  onGalleryClick={() => openGallery({
                    images: field.images,
                    labels: field.labels,
                    title: field.name,
                    description: field.description,
                    details: {
                      capacity: field.capacity,
                      features: field.features.join(', '),
                      availability: 'Visit for availability and pricing'
                    }
                  })}
                  type="field"
                  height="h-[400px]"
                />
                
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <TreePine className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {field.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {field.description}
                  </p>

                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 mb-4">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold">{field.capacity}</span>
                  </div>

                  <div className="space-y-3">
                    {field.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/50 rounded flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                    {field.features.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        +{field.features.length - 3} more features
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        Visit For Inspection
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Flexible booking
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About The Dome Green Fields
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover what makes us the premier choice for outdoor events
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span>Our Vision</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
                {fieldsData.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                The Dome Green Fields is the go-to place for outdoor activities and memorable gatherings.
                We take pride in keeping our environment clean and natural while offering modern amenities for your comfort and convenience.
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span>Features & Amenities</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {fieldsData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
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
      {selectedGallery && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedGallery.title}
              </h2>
              <button
                onClick={closeGallery}
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
                    src={selectedGallery.images[currentImageIndex]}
                    alt={selectedGallery.labels[currentImageIndex]}
                    className="w-full h-full object-cover"
                  />
                  
                  {selectedGallery.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                        {currentImageIndex + 1} / {selectedGallery.images.length}
                      </div>
                    </>
                  )}

                  <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                    {selectedGallery.labels[currentImageIndex]}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {selectedGallery.images.length > 1 && (
                  <div className="flex space-x-4 mt-6 overflow-x-auto pb-2">
                    {selectedGallery.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          index === currentImageIndex
                            ? 'border-green-500 scale-105'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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

              {/* Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Details
                  </h3>
                  {selectedGallery.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                      {selectedGallery.description}
                    </p>
                  )}
                  
                  {selectedGallery.details && (
                    <div className="space-y-4">
                      {Object.entries(selectedGallery.details).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-600"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-right max-w-xs">
                            {Array.isArray(value) ? value.join(', ') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ready to Book Your Field?</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Visit us and see why The Dome Green Fields is the perfect choice for your outdoor event or shoot.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">{fieldsData.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <TreePine className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Premium Green Fields</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-current" />
                      <span className="font-semibold">{fieldsData.rating} Rating</span>
                    </div>
                  </div>

                  {/* <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-emerald-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                      <Phone className="w-5 h-5" />
                      <span>Schedule Inspection</span>
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldsPage;