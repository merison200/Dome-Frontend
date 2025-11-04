import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Music, Users, Tag, Edit } from 'lucide-react';
import { clubAPI, ClubEvent } from '../../../services/club';

const ClubEventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const response = await clubAPI.getById(id);
          setEvent(response.data as ClubEvent);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
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
            to="/admin/club/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center max-w-md w-full">
          <p className="text-gray-600 mb-4">No event found</p>
          <Link
            to="/admin/club/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/admin/club/events"
            className="flex items-center text-red-600 hover:text-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
          
          <Link
            to={`/admin/club/events/${event._id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.name}</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {event.time}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* DJs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Music className="w-4 h-4 mr-2" />
                DJs
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.dj.map((dj, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded font-medium"
                  >
                    {dj}
                  </span>
                ))}
              </div>
            </div>

            {/* Hypemen */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Hypemen
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.hypeman.map((hypeman, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded font-medium"
                  >
                    {hypeman}
                  </span>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Labels
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Images</h2>
            {event.images && event.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {event.images.map((imageUrl, index) => (
                  <div key={index}>
                    <img
                      src={imageUrl}
                      alt={`Event image ${index + 1}`}
                      className="w-full h-48 object-cover rounded border"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        {(event.createdAt || event.updatedAt) && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500">
              {event.createdAt && (
                <p>Created: {new Date(event.createdAt).toLocaleString()}</p>
              )}
              {event.updatedAt && (
                <p>Updated: {new Date(event.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubEventDetails;