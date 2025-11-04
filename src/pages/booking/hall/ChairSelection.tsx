import React from 'react';
import { Users, Plus, Minus, Info } from 'lucide-react';

interface ChairSelectionProps {
  banquetChairs: number;
  onBanquetChairsChange: (count: number) => void;
  selectedDates: string[];
}

const ChairSelection: React.FC<ChairSelectionProps> = ({
  banquetChairs,
  onBanquetChairsChange,
  selectedDates
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalCost = banquetChairs * 1000 * selectedDates.length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
        <span>Chair Selection</span>
      </h3>

      {/* Free Plastic Chairs Info */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center">
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">Free Plastic Chairs</h4>
            <p className="text-green-800 dark:text-green-300 mb-3">
              Standard plastic chairs are included at no extra cost for all events.
            </p>
            <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg inline-block font-semibold">
              FREE - Included
            </div>
          </div>
        </div>
      </div>

      {/* Banquet Chairs */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="grid grid-cols-2 gap-2">
              <img
                src="https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                alt="Banquet Chair 1"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <img
                src="https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                alt="Banquet Chair 2"
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Premium Banquet Chairs</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Elegant upholstered chairs perfect for weddings and formal events.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>₦1,000 per chair per day</span>
                <span>•</span>
                <span>Maximum: 1,200 chairs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Quantity</div>
            {selectedDates.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                For {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onBanquetChairsChange(Math.max(0, banquetChairs - 10))}
              className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
              disabled={banquetChairs === 0}
            >
              <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="w-20 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{banquetChairs}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">chairs</div>
            </div>
            <button
              onClick={() => onBanquetChairsChange(Math.min(1200, banquetChairs + 10))}
              className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
              disabled={banquetChairs >= 1200}
            >
              <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {banquetChairs > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-900 dark:text-blue-200">
                {banquetChairs} chairs × {selectedDates.length || 1} day{(selectedDates.length || 1) !== 1 ? 's' : ''}
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(totalCost)}
              </span>
            </div>
          </div>
        )}

        {banquetChairs >= 1200 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mt-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-300">
              <Info className="w-5 h-5" />
              <span className="font-medium">Maximum quantity reached</span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              You've selected the maximum available banquet chairs (1,200).
            </p>
          </div>
        )}
      </div>

      {/* Chair Comparison */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h5 className="font-bold text-gray-900 dark:text-white mb-2">Plastic Chairs</h5>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Standard comfort</li>
            <li>• Suitable for all events</li>
            <li>• Easy to clean</li>
            <li>• FREE included</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 text-center border-2 border-blue-200 dark:border-blue-700">
          <div className="w-16 h-16 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h5 className="font-bold text-gray-900 dark:text-white mb-2">Banquet Chairs</h5>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Premium comfort</li>
            <li>• Elegant upholstery</li>
            <li>• Perfect for weddings</li>
            <li>• ₦1,000 per chair/day</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChairSelection;