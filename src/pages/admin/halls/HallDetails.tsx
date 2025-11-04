import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Users, MapPin, Ruler } from 'lucide-react';
import { Hall, hallAPI } from '../../../services/hall';

const HallDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHall = async () => {
      try {
        if (id) {
          const data = await hallAPI.getById(id);
          setHall(data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load hall details');
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center max-w-md w-full">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/admin/halls"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Halls
          </Link>
        </div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center max-w-md w-full">
          <p className="text-gray-600 mb-4">No hall found</p>
          <Link
            to="/admin/halls"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Halls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/halls"
            className="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Halls
          </Link>
        </div>

        {/* Hall Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-0">{hall.name}</h1>
            <div className="flex items-center gap-2 text-yellow-600">
              <Star className="w-5 h-5" />
              <span className="font-medium">{hall.rating || 'N/A'}</span>
              <span className="text-gray-500 text-sm">
                ({hall.reviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{hall.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Capacity: {hall.capacity} people</span>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              <span>{hall.size}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hall Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">{hall.description}</p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-semibold text-red-600">₦{hall.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Hour:</span>
                  <span className="font-semibold text-red-600">₦{hall.additionalHourPrice}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Features</h2>
              <div className="flex flex-wrap gap-2">
                {hall.features?.map((feature, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hall.amenities?.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
            {hall.images && hall.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hall.images?.map((img, i) => (
                  <div key={i}>
                    <img
                      src={img.url}
                      alt={img.label || `Image ${i + 1}`}
                      className="w-full h-48 object-cover rounded border"
                    />
                    {img.label && (
                      <p className="text-sm text-gray-600 text-center mt-2">{img.label}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetails;