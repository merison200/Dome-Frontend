import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowRight, 
  Users, 
  Calendar, 
  Award, 
  Star,
  Building2,
  Music,
  Coffee,
  Trees,
  Briefcase,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Play,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react';
import { inquiryAPI } from '../services/inquiry';

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter your message');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await inquiryAPI.create(
        formData.name.trim(),
        formData.email.trim(),
        formData.message.trim()
      );

      if (response.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        toast.error(response.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compound/Venue Images with descriptions
  const compoundImages = [
    {
      url: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760902416/image_3_va2lxk.jpg',
      title: 'Main Entrance & Reception',
      description: 'International Culture and Event Centre'
    },
    {
      url: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760907005/217b_c59c1n.jpg',
      title: 'Main Entrance & Reception',
      description: 'International Culture and Event Centre'
    },
    {
      url: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760907551/c598_ordzqh.jpg',
      title: 'Main Entrance & Reception',
      description: 'International Culture and Event Centre'
    },
  ];

  const venues = [
    {
      id: 'halls',
      name: 'Event Halls',
      description: 'Event halls for weddings, burial & others',
      icon: Building2,
      image: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760362412/enhanced_hd_realistic_u7761w.jpg',
      features: ['3+ Event Halls', 'Up to 1000 guests', 'Full setup'],
      color: 'from-red-600 to-blue-600'
    },
    {
      id: 'nightclub',
      name: 'Club Coded',
      description: 'Nightclub with world-class DJs & Hypemen',
      icon: Music,
      image: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760291012/FB_IMG_1760290736665_djbxf6.jpg',
      features: ['Live performances', 'Excellent night life experience'],
      color: 'from-purple-600 to-red-600'
    },
    {
      id: 'lounge',
      name: 'Circle Lounge',
      description: 'Relaxed spot for drinks, food, and great vibes',
      icon: Coffee,
      image: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760697631/image_1_t27pex.jpg',
      features: ['Beers and gins', 'Soft drinks and meals', 'Regular fun events'],
      color: 'from-blue-600 to-purple-600'
    },
    {
      id: 'offices',
      name: 'Office Spaces',
      description: 'Modern office spaces for businesses of all sizes',
      icon: Briefcase,
      image: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760627014/Dijual_Ruko_Tendean_Square_Jakarta_Selatan____Alamat_Lengkap_Kota___Ruko_tendean_square_no_27_Jalan_Kapten_Tendean_Jakarta_Selatan____Luas_Tanah_todd1j.jpg',
      features: ['Modern amenities', 'Flexible terms'],
      color: 'from-red-600 to-purple-600'
    },
    {
      id: 'fields',
      name: 'Green Fields',
      description: 'Open spaces for photo & video shoots, trade fairs and outdoor events',
      icon: Trees,
      image: 'https://res.cloudinary.com/drixel4wv/image/upload/v1760362987/476839062_651267830745678_2971274900428639346_n_ssg02w.jpg',
      features: ['Trade fair ready', 'Photo & Video Shoots', 'Flexible layout'],
      color: 'from-green-600 to-blue-600'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % compoundImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + compoundImages.length) % compoundImages.length);
  };

  const testimonials = [
    {
      name: 'Olukayode Dami',
      role: 'Event Planner',
      content: 'The Dome made our wedding absolutely magical',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Hero Section with Image Slider */}
      <section className="relative w-full overflow-hidden">
        {/* Image Slider */}
        <div className="relative w-full">
          <div className="relative w-full h-[60vh] md:h-[80vh]">
            <img
              src={compoundImages[currentSlide].url}
              alt={compoundImages[currentSlide].title}
              className="w-full h-full object-cover object-center transition-all duration-1000"
            />
            
            {/* Navigation Arrows - Fixed with proper z-index and pointer events */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 group z-20 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-300 group z-20 cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
              {compoundImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-red-500 scale-125' : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gradient-to-r from-red-50 via-purple-50 to-blue-50 dark:from-red-900/10 dark:via-purple-900/10 dark:to-blue-900/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '4+', label: 'Premium Venues', color: 'text-red-600' },
              { number: '2K+', label: 'Events Hosted', color: 'text-blue-600' },
              { number: '98%', label: 'Client Satisfaction', color: 'text-purple-600' },
              { number: '24/7', label: 'Support Available', color: 'text-green-600' }
            ].map((stat, index) => (
              <div key={index} className="group hover:scale-105 transition-transform duration-300">
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Venues - Image-Focused Cards */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              Our Venues
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover our collection of world-class venues, each designed to create extraordinary experiences
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => {
              const IconComponent = venue.icon;
              return (
                <div key={venue.id} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 dark:border-gray-700">
                  {/* Image Section - 90% of card */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Icon Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                      <IconComponent className="w-6 h-6 text-red-600" />
                    </div>

                    {/* Explore Button - CHANGED TO Link */}
                    <Link
                      to={`/${venue.id}`}
                      className={`absolute top-4 right-4 bg-gradient-to-r ${venue.color} text-white px-4 py-2 rounded-2xl text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                      <Eye className="w-4 h-4" />
                      <span>Explore</span>
                    </Link>
                    
                    {/* Bottom Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                        {venue.name}
                      </h3>
                      <p className="text-gray-200 text-sm mb-4 leading-relaxed">{venue.description}</p>
                      
                      {/* Features */}
                      <div className="space-y-1">
                        {venue.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Small bottom section with CTA - CHANGED TO Link */}
                  <div className="p-4">
                    <Link
                      to={`/${venue.id}`}
                      className={`block w-full text-center bg-gradient-to-r ${venue.color} text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      View Page
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Why Choose The Dome?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the difference with our world-class facilities and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: Calendar,
                title: 'Easy Booking',
                description: 'Seamless booking experience with real-time availability and instant confirmations.',
                color: 'from-red-500 to-red-600'
              },
              {
                icon: Award,
                title: 'Premium Quality',
                description: 'Award-winning venues maintained to the highest international standards.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: Users,
                title: 'Expert Support',
                description: 'Dedicated event specialists available 24/7 to ensure your success.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed text-lg">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Let's Create Something
                <span className="block bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                  Extraordinary
                </span>
              </h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Ready to host your next unforgettable event? Our team is here to help you create magical moments at The Dome.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: MapPin, text: 'Dome, Akure, Ondo State', color: 'text-red-400' },
                  { icon: Phone, text: '+234 810 198 8988', color: 'text-blue-400' },
                  { icon: Mail, text: 'officialdomeakure@gmail.com', color: 'text-purple-400' }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center space-x-4 text-lg">
                    <div className={`w-12 h-12 ${contact.color} bg-white/10 rounded-2xl flex items-center justify-center`}>
                      <contact.icon className="w-6 h-6" />
                    </div>
                    <span className="text-gray-200">{contact.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
              <h3 className="text-2xl font-bold mb-6 text-center">Quick Inquiry</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    className={`w-full px-6 py-4 bg-white/10 border rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 transition-all ${
                      formData.email && !isValidEmail(formData.email)
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/20 focus:ring-red-500'
                    }`}
                    disabled={isSubmitting}
                  />
                  {formData.email && !isValidEmail(formData.email) && (
                    <p className="text-red-400 text-sm mt-2 ml-2">Please enter a valid email address</p>
                  )}
                </div>
                <div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us about your dream event"
                    rows={4}
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                    disabled={isSubmitting}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 transform shadow-xl flex items-center justify-center space-x-2 ${
                    isSubmitting 
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-2xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;