import React from 'react';
import { Check, Circle, ArrowRight } from 'lucide-react';

interface BookingProgressProps {
  currentStep: number;
}

const BookingProgress: React.FC<BookingProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Select Dates', description: 'Choose your event dates' },
    { id: 2, name: 'Choose Options', description: 'Chairs & additional hours' },
    { id: 3, name: 'Customer Info', description: 'Your details & preferences' },
    { id: 4, name: 'Review & Pay', description: 'Confirm booking & payment' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Booking Progress</h3>
      
      {/* Mobile Vertical Layout */}
      <div className="lg:hidden space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4">
            {/* Step Indicator */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 ${
              currentStep > step.id
                ? 'bg-green-500 border-green-500 text-white'
                : currentStep === step.id
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-400'
            }`}>
              {currentStep > step.id ? (
                <Check className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold text-base ${
                currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.name}
              </div>
              <div className={`text-sm mt-1 ${
                currentStep >= step.id ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step.description}
              </div>
              
              {/* Current Step Indicator */}
              {currentStep === step.id && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                  Current Step
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Horizontal Layout */}
      <div className="hidden lg:flex lg:items-center lg:justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                currentStep > step.id
                  ? 'bg-green-500 border-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>
              
              <div className="mt-4 text-center">
                <div className={`font-semibold text-sm ${
                  currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className={`text-xs mt-1 ${
                  currentStep >= step.id ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                currentStep > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                <ArrowRight className={`w-4 h-4 -mt-2 ml-auto mr-auto transition-all duration-300 ${
                  currentStep > step.id ? 'text-green-500' : 'text-gray-300 dark:text-gray-500'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BookingProgress;