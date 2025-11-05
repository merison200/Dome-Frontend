import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import logo from '../../assests/320679750_490341296533363_5557851170066739253_n.jpg';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="The Dome Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">The Dome</span>
                <span className="text-xs text-gray-400 -mt-1">International Culture & Event Centre</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Event center featuring world-class venues for all your celebration and business needs. 
              Proudly managed by Cavudos Nigeria Limited.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/share/1b4zVm9Rvg/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="The Dome Facebook"
              >
                <Facebook className="w-5 h-5 text-gray-400 hover:text-dome-red cursor-pointer transition-colors" />
              </a>
              <a 
                href="https://www.instagram.com/thedomeakure" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="The Dome Instagram"
              >
                <Instagram className="w-5 h-5 text-gray-400 hover:text-dome-red cursor-pointer transition-colors" />
              </a>
              <a 
                href="https://www.linkedin.com/company/the-dome-akure/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="The Dome LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-dome-blue cursor-pointer transition-colors" />
              </a>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Club Coded</p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/share/16BXsfgBxf/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Club Coded Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-400 hover:text-dome-red cursor-pointer transition-colors" />
                </a>
                <a 
                  href="https://www.instagram.com/clubcodedakure" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Club Coded Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-dome-red cursor-pointer transition-colors" />
                </a>
              </div>
            </div>
          </div>

          {/* Venues */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Venues</h3>
            <ul className="space-y-2">
              <li><Link to="/halls" className="text-gray-400 hover:text-white transition-colors">Event Halls</Link></li>
              <li><Link to="/nightclub" className="text-gray-400 hover:text-white transition-colors">Club Coded</Link></li>
              <li><Link to="/lounge" className="text-gray-400 hover:text-white transition-colors">Circle Lounge</Link></li>
              <li><Link to="/offices" className="text-gray-400 hover:text-white transition-colors">Office Spaces</Link></li>
              <li><Link to="/fields" className="text-gray-400 hover:text-white transition-colors">Green Fields</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400">Hall Rentals for Events & Conferences</span></li>
              <li><span className="text-gray-400">Outdoor Venue Rentals</span></li>
              <li><span className="text-gray-400">Office Space Rentals</span></li>
              <li><span className="text-gray-400">Lounge & Nightclub Access</span></li>
              <li><span className="text-gray-400">Sound & Lighting Equipment</span></li>
              <li><span className="text-gray-400">Power Supply & Backup</span></li>
              <li><span className="text-gray-400">Security & Parking Services</span></li>
              <li><span className="text-gray-400">Cleaning & Maintenance Support</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">officialdomeakure@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">+234 810 198 8988</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Igbatoro Road, Akure, Ondo State</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} The Dome - International Culture and Event Centre. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;