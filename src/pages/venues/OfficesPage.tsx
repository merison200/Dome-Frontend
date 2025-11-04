import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Users,
  Car,
  Eye,
  Crown,
  Wifi,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Phone,
  Zap,
  Droplets,
  TreePine,
  Shield,
  Coffee,
  Printer,
  AirVent,
  Clock,
  Sparkles,
  Loader,
  AlertCircle,
  PartyPopper
} from 'lucide-react';

const OfficesPage: React.FC = () => {
  const [selectedGallery, setSelectedGallery] = useState<{
    images: string[];
    labels: string[];
    title?: string;
    description?: string;
    details?: { [key: string]: any };
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const officeData = {
    name: 'The Dome Office Spaces',
    location: 'Dome, Akure',
    rating: 4.9,
    reviews: 50,
    description: 'We provide neat and comfortable office spaces designed to meet your business needs',
    features: [
      'Spacious work areas',
      'Private entrances',
      'Reliable power and water supply',
      'Modern restrooms',
      'Big parking space', 
      'Great views'
    ]
  };

  // Office Types Data
  const officeTypes = [
    {
      id: 'private',
      name: 'Private Offices',
      description: 'Private offices perfect for small teams and individual professionals',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760627014/Dijual_Ruko_Tendean_Square_Jakarta_Selatan____Alamat_Lengkap_Kota___Ruko_tendean_square_no_27_Jalan_Kapten_Tendean_Jakarta_Selatan____Luas_Tanah_todd1j.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760627014/Eridan_Cowork_space_Private_Office_hxh59s.jpg',
      ],
      labels: ['Private Office 1', 'Private Office 2', 'Executive Office', 'Corner Office'],
      capacity: '2 - 10 people',
      features: [  
        'Spacious work areas',
        'Private entrances',
        'Reliable power and water supply',
        'Modern restrooms',
        'Big parking space', 
        'Great views'
      ]
    },
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
    type?: 'default' | 'office';
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
                    ? 'bg-red-400 scale-125'
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
            className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
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
      <div className="relative bg-gradient-to-br from-blue-900 via-red-800 to-blue-900 text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/drixel4wv/image/upload/v1760627014/Dijual_Ruko_Tendean_Square_Jakarta_Selatan____Alamat_Lengkap_Kota___Ruko_tendean_square_no_27_Jalan_Kapten_Tendean_Jakarta_Selatan____Luas_Tanah_todd1j.jpg"
            alt="The Dome Business Center"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-400 via-red-500 to-blue-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                Dome
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-blue-200 mt-4">
                Office Spaces
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              {officeData.description}
            </p>
            <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-400" />
                <span className="font-medium">{officeData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-red-400 fill-current" />
                <span className="font-medium">{officeData.rating} ({officeData.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Office Types - Image Focused Cards */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Office Space Options
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">Choose the perfect workspace for your business needs</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-red-600 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {officeTypes.map((office) => (
              <div 
                key={office.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 group"
                onClick={() => openGallery({
                  images: office.images,
                  labels: office.labels,
                  title: office.name,
                  description: office.description,
                  details: {
                    capacity: office.capacity,
                    features: office.features.join(', '),
                    availability: 'Visit for availability and pricing'
                  }
                })}
              >
                <ImageGallery
                  images={office.images}
                  labels={office.labels}
                  onGalleryClick={() => openGallery({
                    images: office.images,
                    labels: office.labels,
                    title: office.name,
                    description: office.description,
                    details: {
                      capacity: office.capacity,
                      features: office.features.join(', '),
                      availability: 'Visit for availability and pricing'
                    }
                  })}
                  type="office"
                  height="h-[400px]"
                />
                
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {office.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {office.description}
                  </p>

                  <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 mb-4">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">{office.capacity}</span>
                  </div>

                  <div className="space-y-3">
                    {office.features.slice(0, 3).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                    {office.features.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        +{office.features.length - 3} more features
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        Visit For Inspection
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Flexible terms
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
              About The Dome Office Spaces
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Discover what makes us the premier choice for businesses
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-red-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span>Our Vision</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
                {officeData.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                The Dome Office Spaces is a great place for businesses looking for a modern and professional workspace. 
                We focus on giving you quality spaces, good service, and a convenient environment to work and grow.
              </p>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span>Features & Amenities</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {officeData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                            ? 'border-red-500 scale-105'
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

                <div className="bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ready for an Inspection?</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Visit us and see why The Dome Office Spaces is the perfect choice for your business.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">{officeData.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <Building2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-semibold">Premium Business Center</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <Star className="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
                      <span className="font-semibold">{officeData.rating} Rating</span>
                    </div>
                  </div>

                  {/* <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-red-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
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

export default OfficesPage;