import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Edit3, XCircle, Users, MapPin } from 'lucide-react';
import { hallAPI, Hall } from '../../../services/hall';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const HallList: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const data = await hallAPI.getAll();
        setHalls(data);
      } catch (err) {
        setError('Failed to load halls');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;

    try {
      await hallAPI.delete(confirmId);
      setHalls((prev) => prev.filter((hall) => hall._id !== confirmId));
    } catch (err) {
      alert('Failed to delete hall');
    } finally {
      setConfirmId(null);
    }
  };

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
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Halls</h1>
              <p className="text-gray-600 text-sm mt-1">Manage venue listings</p>
            </div>
            <Link
              to="/admin/halls/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Hall
            </Link>
          </div>
        </div>

        {/* Halls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div
              key={hall._id}
              className="bg-white rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
            >
              {/* Hall Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={hall.images?.[0]?.url || '/placeholder.jpg'}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hall Content */}
              <div className="p-4">
                <Link
                  to={`/admin/halls/${hall._id}`}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {hall.name}
                  </h3>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{hall.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {hall.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{hall.rating || 'N/A'} ({hall.reviews || 0} reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-red-600">₦{hall.basePrice}</span>
                    <span className="text-gray-600">₦{hall.additionalHourPrice}/hr extra</span>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/admin/halls/${hall._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setConfirmId(hall._id!)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-sm hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {halls.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">No halls found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first hall.</p>
              <Link
                to="/admin/halls/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Hall
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Hall"
        message="Are you sure you want to delete this hall? This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default HallList;