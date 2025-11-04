// import React, { useState, useEffect } from 'react';
// import {
//   Wine,
//   Calendar,
//   Clock,
//   Eye,
//   Crown,
//   Sparkles,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Star,
//   MapPin,
//   Phone,
//   Coffee,
//   Utensils,
//   PartyPopper,
//   AlertCircle,
//   Loader
// } from 'lucide-react';
// import { loungeAPI, Lounge } from '../../services/lounge';

// const LoungePage: React.FC = () => {
//   const [selectedGallery, setSelectedGallery] = useState<{
//     images: string[];
//     labels: string[];
//     title?: string;
//     description?: string;
//     details?: { [key: string]: any };
//   } | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
//   // API state management
//   const [upcomingEvents, setUpcomingEvents] = useState<Lounge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Fetch upcoming events from API
//   useEffect(() => {
//     const fetchUpcomingEvents = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         // Fetch lounges sorted by date (newest first) - you can adjust sorting as needed
//         const response = await loungeAPI.getAll({ 
//           sortBy: 'date', 
//           sortOrder: 'desc' 
//         });
        
//         if (response.success) {
//           const events = Array.isArray(response.data) ? response.data : [response.data];
          
//           // Filter events that are in the future or today
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
          
//           const futureEvents = events.filter(event => {
//             const eventDate = new Date(event.date);
//             eventDate.setHours(0, 0, 0, 0);
//             return eventDate >= today;
//           });
          
//           setUpcomingEvents(futureEvents);
//         } else {
//           setError('Failed to fetch upcoming events');
//         }
//       } catch (err) {
//         console.error('Error fetching upcoming events:', err);
//         setError('Unable to load upcoming events. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUpcomingEvents();
//   }, []);

//   // Helper function to format date
//   const formatDate = (dateString: string): string => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric'
//       });
//     } catch {
//       return dateString;
//     }
//   };

//   // Helper function to format time
//   const formatTime = (timeString: string): string => {
//     try {
//       // If time includes AM/PM, return as is
//       if (timeString.includes('AM') || timeString.includes('PM')) {
//         return timeString;
//       }
      
//       // If time is in 24-hour format (HH:MM), convert to 12-hour format
//       const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
//       const date = new Date();
//       date.setHours(hours, minutes);
      
//       return date.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: true
//       });
//     } catch {
//       return timeString;
//     }
//   };

//   const loungeData = {
//     name: 'Circle Lounge',
//     location: 'Dome, Akure',
//     rating: 4.9,
//     reviews: 8,
//     description:
//       'Experience the nightlife at akure',
//     operatingDays: [
//       'Monday',
//       'Tuesday',
//       'Wednesday',
//       'Thursday',
//       'Friday',
//       'Saturday',
//       'Sunday'
//     ],
//     operatingTime: '4:00 PM - Dawn',
//     images: [
//       'https://res.cloudinary.com/drixel4wv/image/upload/v1760697631/image_1_t27pex.jpg',
//       'https://res.cloudinary.com/drixel4wv/image/upload/v1760698822/image_2_f6fqpz.jpg',
//       'https://res.cloudinary.com/drixel4wv/image/upload/v1760699570/image_jvmv5c.jpg'
//     ],
//     imageLabels: ['Main Lounge', 'Vip Area', 'Modern Toilet'],
//     features: [
//       'Premium cocktail bar',
//       'Comfortable seating areas',
//       'Live music setup',
//       'Air conditioning',
//       'Free Wi-Fi',
//       'Private dining areas',
//       'Outdoor terrace',
//       'Professional sound system',
//       'Ambient lighting',
//       'Valet parking'
//     ]
//   };

//   // Drinks Categories
//   const drinkCategories = [
//     {
//       id: 'beers',
//       name: 'Beers',
//       description: 'Refreshing selection of local and international beers',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760622374/FB_IMG_1760620994314_tpdigx.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760622373/FB_IMG_1760621147121_qlxuhn.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760622373/FB_IMG_1760621252643_wxxvsl.jpg'
//       ],
//       labels: ['Heineken', 'Gulder', 'Star Beer', 'Trophy'], 
//       items: ['Heineken', 'Gulder', 'Star', 'Trophy', 'Budweiser', 'Corona']
//     },
//     {
//       id: 'spirits',
//       name: 'Spirits & Gin',
//       description: 'Finest selection of whiskeys, vodkas, and premium spirits',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760613507/Captain_Morgan_rum_shoot_by_Timothy_Hogan_sp4oyk.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760613506/Smirnoff_Vodka_-_Dion_Albers_whfsps.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760613517/FB_IMG_1760613385386_mq17n9.jpg'
//       ],
//       labels: ['Captain Morgan', 'Smirnoff Vodka', 'Action Bitters'],
//       items: ['Captain Morgan', 'Smirnoff Vodka', 'Action Bitters', 'Bacardi', 'Campari', '8PM Etc']
//     },
//     {
//       id: 'cocktails',
//       name: 'Cocktails',
//       description: 'Expertly crafted cocktails and mixed drinks',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612238840_szer2r.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612240873_hfnkox.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612235518_vinf1b.jpg'
//       ],
//       labels: ['Chapman NG', 'Mojito', 'Zobo Coctail'],
//       items: ['Chapman NG', 'Palm Royal', 'Zobo Coctail', 'Mojito', 'Martini Etc']
//     },
//     {
//       id: 'non-alcoholic',
//       name: 'Non-Alcoholic',
//       description: 'Fresh juices, soft drinks, and premium non-alcoholic beverages',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760540034/FB_IMG_1760539800082_ighmho.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760542371/d6405ef4-5f9f-483c-81c0-8d173cbb5eed_zdseml.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760371032/Malta_Guinness_product_ads_h7uywf.jpg',
//       ],
//       labels: ['Fresh Juice', 'Soft Drinks', 'Malt'],
//       items: ['Fresh Juice', 'Malt', 'Coca-Cola', 'Sprite', 'Smoothies Etc']
//     }
//   ];

//   // Food Categories
//   const foodCategories = [
//     {
//       id: 'local',
//       name: 'Local Delicacies',
//       description: 'Authentic Nigerian cuisine with modern presentation',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/Indulge_in_xxdwqh.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/Goat_meat_pepper_soup_jqlff9.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/download_rln3cr.jpg'
//       ],
//       labels: ['Amara & Ewedu', 'Pepper Soup', 'Ofada Rice'],
//       items: ['Amara & Ewedu', 'Pepper Soup', 'Ofada Rice', 'Brokoto', 'Snails Etc']
//     },
//     {
//       id: 'fast',
//       name: 'Fast Bites',
//       description: 'Perfect bites to start your dining experience',
//       images: [
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760626144/Mood_a8wi1l.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760626145/download_1_fxkws1.jpg',
//         'https://res.cloudinary.com/drixel4wv/image/upload/v1760626145/Yaji_Spice_pronounced_yaa-gee_also_known_as_suya_yaji_or_suya_seasoning_is_a_flavor-packed_blend_that_s_nutty_spicy_and_smoky_with_delightful_undertones_of_onion_and_garlic__This_uniq_euuv28.jpg'
//       ],
//       labels: ['Shawarma', 'Chips', 'Suya'],
//       items: ['Shawarma', 'Chips', 'Suya', 'Grilled Fish Etc']
//     },
//   ];

//   const openGallery = (galleryData: {
//     images: string[];
//     labels: string[];
//     title?: string;
//     description?: string;
//     details?: { [key: string]: any };
//   }) => {
//     setSelectedGallery(galleryData);
//     setCurrentImageIndex(0);
//   };

//   const closeGallery = () => {
//     setSelectedGallery(null);
//     setCurrentImageIndex(0);
//   };

//   const nextImage = () => {
//     if (selectedGallery) {
//       setCurrentImageIndex(prev =>
//         prev === selectedGallery.images.length - 1 ? 0 : prev + 1
//       );
//     }
//   };

//   const prevImage = () => {
//     if (selectedGallery) {
//       setCurrentImageIndex(prev =>
//         prev === 0 ? selectedGallery.images.length - 1 : prev - 1
//       );
//     }
//   };

//   const ImageGallery = ({
//     images,
//     labels,
//     onGalleryClick,
//     type = 'default',
//     height = 'h-96'
//   }: {
//     images: string[];
//     labels: string[];
//     onGalleryClick: () => void;
//     type?: 'default' | 'drinks' | 'food' | 'event';
//     height?: string;
//   }) => {
//     const [localCurrentIndex, setLocalCurrentIndex] = useState(0);

//     return (
//       <div className={`relative ${height} overflow-hidden group rounded-2xl`}>
//         <img
//           src={images[localCurrentIndex]}
//           alt={labels[localCurrentIndex]}
//           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//         />

//         {/* Dark overlay for better text visibility */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

//         {/* Navigation Buttons */}
//         {images.length > 1 && (
//           <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
//             <button
//               onClick={e => {
//                 e.preventDefault();
//                 setLocalCurrentIndex(prev =>
//                   prev === 0 ? images.length - 1 : prev - 1
//                 );
//               }}
//               className="ml-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <button
//               onClick={e => {
//                 e.preventDefault();
//                 setLocalCurrentIndex(prev => (prev + 1) % images.length);
//               }}
//               className="mr-4 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         )}

//         {/* Image Indicators */}
//         {images.length > 1 && (
//           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
//             {images.map((_, index) => (
//               <button
//                 key={index}
//                 onClick={e => {
//                   e.preventDefault();
//                   setLocalCurrentIndex(index);
//                 }}
//                 className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
//                   index === localCurrentIndex
//                     ? 'bg-red-400 scale-125'
//                     : 'bg-white/70 hover:bg-white/90'
//                 }`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Image Label */}
//         <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
//           {labels[localCurrentIndex]}
//         </div>

//         {/* View Gallery Button */}
//         {images.length > 1 && (
//           <button
//             onClick={e => {
//               e.preventDefault();
//               onGalleryClick();
//             }}
//             className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
//           >
//             <Eye className="w-4 h-4" />
//             <span>Gallery</span>
//           </button>
//         )}

//         {/* Photo Count */}
//         <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10">
//           {localCurrentIndex + 1}/{images.length}
//         </div>
//       </div>
//     );
//   };

//   // Loading Component
//   const LoadingEvents = () => (
//     <div className="flex items-center justify-center py-12">
//       <div className="text-center">
//         <Loader className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
//         <p className="text-gray-600 dark:text-gray-300">Loading upcoming events...</p>
//       </div>
//     </div>
//   );

//   // Error Component
//   const ErrorEvents = () => (
//     <div className="flex items-center justify-center py-12">
//       <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
//         <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
//         <p className="text-red-700 dark:text-red-300 font-semibold mb-2">
//           Unable to Load Events
//         </p>
//         <p className="text-red-600 dark:text-red-400 text-sm">
//           {error}
//         </p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
//         >
//           Retry
//         </button>
//       </div>
//     </div>
//   );

//   // No Events Component
//   const NoEvents = () => (
//     <div className="text-center py-12">
//       <PartyPopper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//       <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
//         No Upcoming Events
//       </h3>
//       <p className="text-gray-500 dark:text-gray-400">
//         Check back soon for exciting new events!
//       </p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
//       {/* Hero Section */}
//       <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-blue-900 text-white py-32 overflow-hidden">
//         {/* Background Image */}
//         <div className="absolute inset-0">
//           <img
//             src="https://res.cloudinary.com/drixel4wv/image/upload/v1760626144/Mood_a8wi1l.jpg"
//             alt="Circle Lounge"
//             className="w-full h-full object-cover opacity-30"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
//         </div>

//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <div className="mb-8">
//               <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-blue-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
//                 Circle
//               </div>
//               <div className="text-3xl md:text-4xl font-semibold text-red-200 mt-4">
//                 Lounge
//               </div>
//             </div>
//             <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
//               {loungeData.description}
//             </p>
//             <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
//               <div className="flex items-center space-x-2">
//                 <MapPin className="w-5 h-5 text-red-400" />
//                 <span className="font-medium">{loungeData.location}</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Star className="w-5 h-5 text-red-400 fill-current" />
//                 <span className="font-medium">
//                   {loungeData.rating} ({loungeData.reviews} reviews)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Lounge Overview */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <section className="mb-16">
//           <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
//             <ImageGallery
//               images={loungeData.images}
//               labels={loungeData.imageLabels}
//               onGalleryClick={() =>
//                 openGallery({
//                   images: loungeData.images,
//                   labels: loungeData.imageLabels,
//                   title: loungeData.name
//                 })
//               }
//               height="h-[600px]"
//             />

//             {/* Opening Hours + Days (under image, centered) */}
//             <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 mb-4">
//                 <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
//                 <span className="font-semibold">{loungeData.operatingTime}</span>
//               </div>
//               <div className="flex flex-wrap justify-center gap-2">
//                 {loungeData.operatingDays.map(day => (
//                   <span
//                     key={day}
//                     className="bg-red-600 dark:bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
//                   >
//                     {day}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Drinks Menu */}
//         <section className="mb-16">
//           <div className="text-center mb-8">
//             <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Premium Drinks Menu
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               Carefully curated selection of beverages
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//             {drinkCategories.map(category => (
//               <div
//                 key={category.id}
//                 className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
//                 onClick={() =>
//                   openGallery({
//                     images: category.images,
//                     labels: category.labels,
//                     title: category.name,
//                     description: category.description,
//                     details: {
//                       available: category.items.join(', '),
//                       pricing: 'Call for current pricing and availability'
//                     }
//                   })
//                 }
//               >
//                 <ImageGallery
//                   images={category.images}
//                   labels={category.labels}
//                   onGalleryClick={() =>
//                     openGallery({
//                       images: category.images,
//                       labels: category.labels,
//                       title: category.name,
//                       description: category.description,
//                       details: {
//                         available: category.items.join(', '),
//                         pricing: 'Call for current pricing and availability'
//                       }
//                     })
//                   }
//                   type="drinks"
//                   height="h-[400px]"
//                 />

//                 <div className="p-6">
//                   <div className="flex items-center space-x-3 mb-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
//                       <Wine className="w-5 h-5 text-white" />
//                     </div>
//                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {category.name}
//                     </h3>
//                   </div>

//                   <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
//                     {category.description}
//                   </p>

//                   <div className="space-y-3">
//                     {category.items.slice(0, 3).map((item, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
//                       >
//                         <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded flex items-center justify-center">
//                           <Crown className="w-3 h-3 text-red-600 dark:text-red-400" />
//                         </div>
//                         <span className="font-medium">{item}</span>
//                       </div>
//                     ))}
//                     {category.items.length > 3 && (
//                       <div className="text-sm text-gray-500 dark:text-gray-400 italic">
//                         +{category.items.length - 3} more varieties available
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Food Menu */}
//         <section className="mb-16">
//           <div className="text-center mb-8">
//             <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Delicious Food Menu
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               From appetizers to desserts, we've got you covered
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-red-600 mx-auto mt-6 rounded-full" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//             {foodCategories.map(category => (
//               <div
//                 key={category.id}
//                 className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
//                 onClick={() =>
//                   openGallery({
//                     images: category.images,
//                     labels: category.labels,
//                     title: category.name,
//                     description: category.description,
//                     details: {
//                       available: category.items.join(', '),
//                       pricing: 'Call for current pricing and availability'
//                     }
//                   })
//                 }
//               >
//                 <ImageGallery
//                   images={category.images}
//                   labels={category.labels}
//                   onGalleryClick={() =>
//                     openGallery({
//                       images: category.images,
//                       labels: category.labels,
//                       title: category.name,
//                       description: category.description,
//                       details: {
//                         available: category.items.join(', '),
//                         pricing: 'Call for current pricing and availability'
//                       }
//                     })
//                   }
//                   type="food"
//                   height="h-[400px]"
//                 />

//                 <div className="p-6">
//                   <div className="flex items-center space-x-3 mb-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
//                       <Utensils className="w-5 h-5 text-white" />
//                     </div>
//                     <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {category.name}
//                     </h3>
//                   </div>

//                   <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
//                     {category.description}
//                   </p>

//                   <div className="space-y-3">
//                     {category.items.slice(0, 3).map((item, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
//                       >
//                         <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
//                           <Coffee className="w-3 h-3 text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <span className="font-medium">{item}</span>
//                       </div>
//                     ))}
//                     {category.items.length > 3 && (
//                       <div className="text-sm text-gray-500 dark:text-gray-400 italic">
//                         +{category.items.length - 3} more dishes available
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Updated Upcoming Events Section - Now using API data */}
//         <section className="mb-16">
//           <div className="text-center mb-8">
//             <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               Upcoming Events
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               Special celebrations and private events
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
//           </div>

//           {/* Loading State */}
//           {loading && <LoadingEvents />}

//           {/* Error State */}
//           {error && !loading && <ErrorEvents />}

//           {/* No Events State */}
//           {!loading && !error && upcomingEvents.length === 0 && <NoEvents />}

//           {/* Events Grid */}
//           {!loading && !error && upcomingEvents.length > 0 && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {upcomingEvents.map(event => (
//                 <div
//                   key={event._id}
//                   className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
//                   onClick={() =>
//                     openGallery({
//                       images: event.images,
//                       labels: event.labels || event.images.map((_, index) => `Image ${index + 1}`),
//                       title: event.name,
//                       description: event.description,
//                       details: {
//                         date: formatDate(event.date),
//                         time: formatTime(event.time),
//                         created: formatDate(event.createdAt || ''),
//                         booking: 'Call to book your celebration',
//                         eventId: event._id
//                       }
//                     })
//                   }
//                 >
//                   <ImageGallery
//                     images={event.images}
//                     labels={event.labels || event.images.map((_, index) => `Image ${index + 1}`)}
//                     onGalleryClick={() =>
//                       openGallery({
//                         images: event.images,
//                         labels: event.labels || event.images.map((_, index) => `Image ${index + 1}`),
//                         title: event.name,
//                         description: event.description,
//                         details: {
//                           date: formatDate(event.date),
//                           time: formatTime(event.time),
//                           created: formatDate(event.createdAt || ''),
//                           booking: 'Call to book your celebration',
//                           eventId: event._id
//                         }
//                       })
//                     }
//                     type="event"
//                     height="h-[350px]"
//                   />

//                   <div className="p-6">
//                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
//                       {event.name}
//                     </h3>
//                     <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
//                       {event.description}
//                     </p>

//                     <div className="space-y-3 text-sm">
//                       <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                         <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
//                         <span className="font-semibold">{formatDate(event.date)}</span>
//                       </div>
//                       <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                         <Clock className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
//                         <span className="font-semibold">{formatTime(event.time)}</span>
//                       </div>
//                       <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                         <PartyPopper className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
//                         <span className="font-semibold">Special Event</span>
//                       </div>
//                       {/* Show number of images */}
//                       {event.images.length > 1 && (
//                         <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 text-xs">
//                           <Eye className="w-3 h-3 flex-shrink-0" />
//                           <span>{event.images.length} photos available</span>
//                         </div>
//                       )}
//                     </div>

//                     {/* Event Labels/Tags */}
//                     {event.labels && event.labels.length > 0 && (
//                       <div className="mt-4 flex flex-wrap gap-2">
//                         {event.labels.slice(0, 3).map((label, index) => (
//                           <span
//                             key={index}
//                             className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium"
//                           >
//                             {label}
//                           </span>
//                         ))}
//                         {event.labels.length > 3 && (
//                           <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
//                             +{event.labels.length - 3} more
//                           </span>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//         {/* Refresh Button */}
//           {!loading && (error || upcomingEvents.length === 0) && (
//             <div className="text-center mt-8">
//               <button
//                 onClick={() => window.location.reload()}
//                 className="bg-gradient-to-r from-red-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
//               >
//                 <Sparkles className="w-5 h-5" />
//                 <span>Refresh Events</span>
//               </button>
//             </div>
//           )}
//         </section>

//         {/* About Section */}
//         <section className="mb-16">
//           <div className="text-center mb-8">
//             <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
//               About Circle Lounge
//             </h2>
//             <p className="text-xl text-gray-600 dark:text-gray-300">
//               Discover what makes us special
//             </p>
//             <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//             {/* Description */}
//             <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
//                   <Sparkles className="w-5 h-5 text-white" />
//                 </div>
//                 <span>Our Story</span>
//               </h3>
//               <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg mb-6">
//                 {loungeData.description}
//               </p>
//               <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
//                 Located in the heart of Dome, Akure, Circle Lounge has become the premier
//                 destination for those seeking an exceptional dining and social experience. Our
//                 commitment to quality, service, and ambiance has made us a favorite among locals and
//                 visitors alike.
//               </p>
//             </div>

//             {/* Features */}
//             <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
//               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
//                   <Crown className="w-5 h-5 text-white" />
//                 </div>
//                 <span>Features & Amenities</span>
//               </h3>
//               <div className="grid grid-cols-1 gap-4">
//                 {loungeData.features.map((feature, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center space-x-4 text-gray-700 dark:text-gray-300"
//                   >
//                     <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
//                     </div>
//                     <span className="font-medium text-lg">{feature}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Call to Action */}
//         <section className="mb-16">
//           <div className="bg-gradient-to-r from-red-600 to-blue-700 rounded-3xl shadow-2xl p-12 text-center text-white">
//             <h2 className="text-4xl font-bold mb-6">Ready to Experience Circle Lounge?</h2>
//             <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
//               Join us for an exceptional dining and lounge experience. Contact us for reservations,
//               event bookings, or to learn more about our menu and services.
//             </p>

//             <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
//               <button className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2">
//                 <Phone className="w-5 h-5" />
//                 <span>Call for Reservations</span>
//               </button>
//               <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
//                 <MapPin className="w-5 h-5" />
//                 <span>Visit Us Today</span>
//               </button>
//             </div>

//             <div className="mt-8 text-red-200">
//               <p>Contact information available in the footer below</p>
//             </div>
//           </div>
//         </section>
//       </div>

//       {/* Enhanced Image Gallery Modal */}
//       {selectedGallery && (
//         <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
//             <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-3xl">
//               <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
//                 {selectedGallery.title}
//               </h2>
//               <button
//                 onClick={closeGallery}
//                 className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
//               >
//                 <X className="w-6 h-6 text-gray-900 dark:text-white" />
//               </button>
//             </div>

//             <div className="p-6 max-h-[80vh] overflow-y-auto">
//               {/* Main Image Gallery */}
//               <div className="relative mb-8">
//                 <div className="relative h-96 rounded-3xl overflow-hidden">
//                   <img
//                     src={selectedGallery.images[currentImageIndex]}
//                     alt={selectedGallery.labels[currentImageIndex]}
//                     className="w-full h-full object-cover"
//                   />

//                   {selectedGallery.images.length > 1 && (
//                     <>
//                       <button
//                         onClick={prevImage}
//                         className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
//                       >
//                         <ChevronLeft className="w-6 h-6 text-white" />
//                       </button>
//                       <button
//                         onClick={nextImage}
//                         className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 p-4 rounded-full shadow-lg transition-all hover:scale-110 backdrop-blur-sm"
//                       >
//                         <ChevronRight className="w-6 h-6 text-white" />
//                       </button>

//                       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
//                         {currentImageIndex + 1} / {selectedGallery.images.length}
//                       </div>
//                     </>
//                   )}

//                   <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
//                     {selectedGallery.labels[currentImageIndex]}
//                   </div>
//                 </div>

//                 {/* Thumbnail Gallery */}
//                 {selectedGallery.images.length > 1 && (
//                   <div className="flex space-x-4 mt-6 overflow-x-auto pb-2">
//                     {selectedGallery.images.map((image, index) => (
//                       <button
//                         key={index}
//                         onClick={() => setCurrentImageIndex(index)}
//                         className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
//                           index === currentImageIndex
//                             ? 'border-red-500 scale-105'
//                             : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
//                         }`}
//                       >
//                         <img
//                           src={image}
//                           alt={`Thumbnail ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Details */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//                     Details
//                   </h3>
//                   {selectedGallery.description && (
//                     <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
//                       {selectedGallery.description}
//                     </p>
//                   )}

//                   {selectedGallery.details && (
//                     <div className="space-y-4">
//                       {Object.entries(selectedGallery.details).map(([key, value]) => (
//                         <div
//                           key={key}
//                           className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-600"
//                         >
//                           <span className="font-semibold text-gray-900 dark:text-white capitalize">
//                             {key.replace(/([A-Z])/g, ' $1')}
//                           </span>
//                           <span className="font-semibold text-gray-700 dark:text-gray-300 text-right max-w-xs">
//                             {Array.isArray(value) ? (value as string[]).join(', ') : (value as string)}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <div className="bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
//                   <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
//                     Ready to Visit Circle Lounge?
//                   </h4>
//                   <p className="text-gray-600 dark:text-gray-300 mb-6">
//                     Contact us for reservations, menu details, or to plan your special event with us.
//                   </p>

//                   <div className="space-y-4 mb-6">
//                     <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                       <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
//                       <span className="font-semibold">{loungeData.location}</span>
//                     </div>
//                     <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                       <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
//                       <span className="font-semibold">{loungeData.operatingTime}</span>
//                     </div>
//                     <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
//                       <Star className="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
//                       <span className="font-semibold">{loungeData.rating} Rating</span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <button className="w-full bg-gradient-to-r from-red-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
//                       <Phone className="w-5 h-5" />
//                       <span>Call for Reservations</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoungePage;




import React, { useState, useEffect } from 'react';
import {
  Wine,
  Calendar,
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
  Coffee,
  Utensils,
  PartyPopper,
  AlertCircle,
  Loader
} from 'lucide-react';
import { loungeAPI, Lounge } from '../../services/lounge';

const LoungePage: React.FC = () => {
  const [selectedGallery, setSelectedGallery] = useState<{
    images: string[];
    labels: string[];
    title?: string;
    description?: string;
    details?: { [key: string]: any };
  } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // API state management
  const [upcomingEvents, setUpcomingEvents] = useState<Lounge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch upcoming events from API
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch lounges sorted by date (newest first) - you can adjust sorting as needed
        const response = await loungeAPI.getAll({ 
          sortBy: 'date', 
          sortOrder: 'desc' 
        });
        
        if (response.success) {
          const events = Array.isArray(response.data) ? response.data : [response.data];
          
          // Filter events that are in the future or today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const futureEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
          });
          
          setUpcomingEvents(futureEvents);
        } else {
          setError('Failed to fetch upcoming events');
        }
      } catch (err) {
        console.error('Error fetching upcoming events:', err);
        setError('Unable to load upcoming events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (timeString: string): string => {
    try {
      // If time includes AM/PM, return as is
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // If time is in 24-hour format (HH:MM), convert to 12-hour format
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const date = new Date();
      date.setHours(hours, minutes);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const loungeData = {
    name: 'Circle Lounge',
    location: 'Dome, Akure',
    rating: 4.9,
    reviews: 50,
    description:
      'Relax, unwind and enjoy the best lounge experience in Akure',
    operatingDays: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    ],
    operatingTime: '4:00 PM - Dawn',
    images: [
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760698822/image_2_f6fqpz.jpg',
      'https://res.cloudinary.com/drixel4wv/image/upload/v1760699570/image_jvmv5c.jpg'
    ],
    imageLabels: ['Vip Area', 'Modern Toilet'],
    features: [
        'Cold drinks and cocktails',
        'Tasty meals and snacks',
        'Cool and comfortable seating',
        'Good music and sound system',
        'Neat restrooms',
        'Outdoor sitting area',
        'Friendly staff and quick service',
        'Secure parking space'
    ]
  };

  // Drinks Categories
  const drinkCategories = [
    {
      id: 'beers',
      name: 'Beers',
      description: 'Refreshing selection of local and international beers',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760622374/FB_IMG_1760620994314_tpdigx.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760622373/FB_IMG_1760621147121_qlxuhn.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760622373/FB_IMG_1760621252643_wxxvsl.jpg'
      ],
      labels: ['Heineken', 'Gulder', 'Star Beer', 'Trophy'], 
      items: ['Heineken', 'Gulder', 'Star', 'Trophy', 'Budweiser', 'Corona']
    },
    {
      id: 'spirits',
      name: 'Spirits & Gin',
      description: 'Finest selection of whiskeys, vodkas, and premium spirits',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760613507/Captain_Morgan_rum_shoot_by_Timothy_Hogan_sp4oyk.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760613506/Smirnoff_Vodka_-_Dion_Albers_whfsps.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760613517/FB_IMG_1760613385386_mq17n9.jpg'
      ],
      labels: ['Captain Morgan', 'Smirnoff Vodka', 'Action Bitters'],
      items: ['Captain Morgan', 'Smirnoff Vodka', 'Action Bitters', 'Bacardi', 'Campari', '8PM Etc']
    },
    {
      id: 'cocktails',
      name: 'Cocktails',
      description: 'Expertly crafted cocktails and mixed drinks',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612238840_szer2r.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612240873_hfnkox.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760612466/FB_IMG_1760612235518_vinf1b.jpg'
      ],
      labels: ['Chapman NG', 'Mojito', 'Zobo Coctail'],
      items: ['Chapman NG', 'Palm Royal', 'Zobo Coctail', 'Mojito', 'Martini Etc']
    },
    {
      id: 'non-alcoholic',
      name: 'Non-Alcoholic',
      description: 'Fresh juices, soft drinks, and premium non-alcoholic beverages',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760540034/FB_IMG_1760539800082_ighmho.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760542371/d6405ef4-5f9f-483c-81c0-8d173cbb5eed_zdseml.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760371032/Malta_Guinness_product_ads_h7uywf.jpg',
      ],
      labels: ['Fresh Juice', 'Soft Drinks', 'Malt'],
      items: ['Fresh Juice', 'Malt', 'Coca-Cola', 'Sprite', 'Smoothies Etc']
    }
  ];

  // Food Categories
  const foodCategories = [
    {
      id: 'local',
      name: 'Local Delicacies',
      description: 'Authentic Nigerian cuisine with modern presentation',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/Indulge_in_xxdwqh.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/Goat_meat_pepper_soup_jqlff9.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760625381/download_rln3cr.jpg'
      ],
      labels: ['Amara & Ewedu', 'Pepper Soup', 'Ofada Rice'],
      items: ['Amara & Ewedu', 'Pepper Soup', 'Ofada Rice', 'Brokoto', 'Snails Etc']
    },
    {
      id: 'fast',
      name: 'Fast Bites',
      description: 'Perfect bites to start your dining experience',
      images: [
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760626144/Mood_a8wi1l.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760626145/download_1_fxkws1.jpg',
        'https://res.cloudinary.com/drixel4wv/image/upload/v1760626145/Yaji_Spice_pronounced_yaa-gee_also_known_as_suya_yaji_or_suya_seasoning_is_a_flavor-packed_blend_that_s_nutty_spicy_and_smoky_with_delightful_undertones_of_onion_and_garlic__This_uniq_euuv28.jpg'
      ],
      labels: ['Shawarma', 'Chips', 'Suya'],
      items: ['Shawarma', 'Chips', 'Suya', 'Grilled Fish Etc']
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
      setCurrentImageIndex(prev =>
        prev === selectedGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedGallery) {
      setCurrentImageIndex(prev =>
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
    type?: 'default' | 'drinks' | 'food' | 'event';
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
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl z-10"
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

  // Loading Component
  const LoadingEvents = () => (
    <div className="flex justify-center items-center py-12">
      <Loader className="w-8 h-8 animate-spin text-red-600" />
      <span className="ml-3 text-gray-600 dark:text-gray-300">Loading events...</span>
    </div>
  );

  // Error Component
  const ErrorEvents = () => (
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

  // No Events Component - Updated to match NightclubPage style
  const NoEvents = () => (
    <div className="text-center py-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Upcoming Events</h3>
        <p className="text-gray-500 dark:text-gray-400">Check back soon for exciting new events!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-blue-900 text-white py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/drixel4wv/image/upload/v1760626144/Mood_a8wi1l.jpg"
            alt="Circle Lounge"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-blue-600 bg-clip-text text-transparent tracking-wider drop-shadow-2xl">
                Circle
              </div>
              <div className="text-3xl md:text-4xl font-semibold text-red-200 mt-4">
                Lounge
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              {loungeData.description}
            </p>
            <div className="flex items-center justify-center space-x-8 mt-10 text-gray-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-400" />
                <span className="font-medium">{loungeData.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-red-400 fill-current" />
                <span className="font-medium">
                  {loungeData.rating} ({loungeData.reviews} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lounge Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <ImageGallery
              images={loungeData.images}
              labels={loungeData.imageLabels}
              onGalleryClick={() =>
                openGallery({
                  images: loungeData.images,
                  labels: loungeData.imageLabels,
                  title: loungeData.name
                })
              }
              height="h-[600px]"
            />

            {/* Opening Hours + Days (under image, centered) */}
            <div className="p-6 text-center border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-gray-700 dark:text-gray-300 mb-4">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold">{loungeData.operatingTime}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {loungeData.operatingDays.map(day => (
                  <span
                    key={day}
                    className="bg-red-600 dark:bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Drinks Menu */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Premium Drinks Menu
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Carefully curated selection of beverages
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {drinkCategories.map(category => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
                onClick={() =>
                  openGallery({
                    images: category.images,
                    labels: category.labels,
                    title: category.name,
                    description: category.description,
                    details: {
                      available: category.items.join(', '),
                      pricing: 'Call for current pricing and availability'
                    }
                  })
                }
              >
                <ImageGallery
                  images={category.images}
                  labels={category.labels}
                  onGalleryClick={() =>
                    openGallery({
                      images: category.images,
                      labels: category.labels,
                      title: category.name,
                      description: category.description,
                      details: {
                        available: category.items.join(', '),
                        pricing: 'Call for current pricing and availability'
                      }
                    })
                  }
                  type="drinks"
                  height="h-[400px]"
                />

                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Wine className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {category.description}
                  </p>

                  <div className="space-y-3">
                    {category.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-5 h-5 bg-red-100 dark:bg-red-900/50 rounded flex items-center justify-center">
                          <Crown className="w-3 h-3 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                    {category.items.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        +{category.items.length - 3} more varieties available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Food Menu */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Delicious Food Menu
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              From appetizers to desserts, we've got you covered
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-red-600 mx-auto mt-6 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {foodCategories.map(category => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                onClick={() =>
                  openGallery({
                    images: category.images,
                    labels: category.labels,
                    title: category.name,
                    description: category.description,
                    details: {
                      available: category.items.join(', '),
                      pricing: 'Call for current pricing and availability'
                    }
                  })
                }
              >
                <ImageGallery
                  images={category.images}
                  labels={category.labels}
                  onGalleryClick={() =>
                    openGallery({
                      images: category.images,
                      labels: category.labels,
                      title: category.name,
                      description: category.description,
                      details: {
                        available: category.items.join(', '),
                        pricing: 'Call for current pricing and availability'
                      }
                    })
                  }
                  type="food"
                  height="h-[400px]"
                />

                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    {category.description}
                  </p>

                  <div className="space-y-3">
                    {category.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 text-gray-600 dark:text-gray-300"
                      >
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                          <Coffee className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                    {category.items.length > 3 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        +{category.items.length - 3} more dishes available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Updated Upcoming Events Section - Now using API data */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Special celebrations and private events
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-600 mx-auto mt-6 rounded-full" />
          </div>

          {/* Loading State */}
          {loading && <LoadingEvents />}

          {/* Error State */}
          {error && !loading && <ErrorEvents />}

          {/* No Events State */}
          {!loading && !error && upcomingEvents.length === 0 && <NoEvents />}

          {/* Events Grid */}
          {!loading && !error && upcomingEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <div
                  key={event._id}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600"
                  onClick={() =>
                    openGallery({
                      images: event.images,
                      labels: event.labels || event.images.map((_, index) => `Image ${index + 1}`),
                      title: event.name,
                      description: event.description,
                      details: {
                        date: formatDate(event.date),
                        time: formatTime(event.time),
                        created: formatDate(event.createdAt || ''),
                        booking: 'Call to book your celebration',
                        eventId: event._id
                      }
                    })
                  }
                >
                  <ImageGallery
                    images={event.images}
                    labels={event.labels || event.images.map((_, index) => `Image ${index + 1}`)}
                    onGalleryClick={() =>
                      openGallery({
                        images: event.images,
                        labels: event.labels || event.images.map((_, index) => `Image ${index + 1}`),
                        title: event.name,
                        description: event.description,
                        details: {
                          date: formatDate(event.date),
                          time: formatTime(event.time),
                          created: formatDate(event.createdAt || ''),
                          booking: 'Call to book your celebration',
                          eventId: event._id
                        }
                      })
                    }
                    type="event"
                    height="h-[350px]"
                  />

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="font-semibold">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="font-semibold">{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <PartyPopper className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <span className="font-semibold">Special Event</span>
                      </div>
                      {/* Show number of images */}
                      {event.images.length > 1 && (
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 text-xs">
                          <Eye className="w-3 h-3 flex-shrink-0" />
                          <span>{event.images.length} photos available</span>
                        </div>
                      )}
                    </div>

                    {/* Event Labels/Tags */}
                    {event.labels && event.labels.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.labels.slice(0, 3).map((label, index) => (
                          <span
                            key={index}
                            className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {label}
                          </span>
                        ))}
                        {event.labels.length > 3 && (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
                            +{event.labels.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Circle Lounge
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
                {loungeData.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Circle Lounge is the perfect place to eat, drink and connect.
                We offer a cozy atmosphere, great service and a mix of good music and good vibes, 
                making us a top choice for locals and visitors looking to have a great time.
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
                {loungeData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 text-gray-700 dark:text-gray-300"
                  >
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
                            {Array.isArray(value) ? (value as string[]).join(', ') : (value as string)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Visit Circle Lounge?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Contact us for reservations, menu details, or to plan your special event with us.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-semibold">{loungeData.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="font-semibold">{loungeData.operatingTime}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                      <Star className="w-5 h-5 text-red-600 dark:text-red-400 fill-current" />
                      <span className="font-semibold">{loungeData.rating} Rating</span>
                    </div>
                  </div>

                  {/* <div className="space-y-4">
                    <button className="w-full bg-gradient-to-r from-red-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                      <Phone className="w-5 h-5" />
                      <span>Call for Reservations</span>
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

export default LoungePage;