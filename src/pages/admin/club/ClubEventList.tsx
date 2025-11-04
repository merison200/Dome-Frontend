import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, Edit3, XCircle, Users, Music } from 'lucide-react';
import { clubAPI, ClubEvent } from '../../../services/club';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

const ClubEventList: React.FC = () => {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await clubAPI.getAll();
        setEvents(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (err) {
        setError('Failed to load events');
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await clubAPI.delete(confirmId);
      setEvents((prev) => prev.filter((e) => e._id !== confirmId));
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error('Failed to delete event');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Club Events</h1>
              <p className="text-gray-600 text-sm mt-1">Manage club events and parties</p>
            </div>
            <Link
              to="/admin/club/events/new"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </Link>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
            >
              {/* Event Image */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={event.images?.[0] || '/placeholder-event.jpg'}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Event Content */}
              <div className="p-4">
                <Link
                  to={`/admin/club/events/${event._id}`}
                  className="block hover:opacity-90 transition-opacity"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {event.name}
                  </h3>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Music className="w-4 h-4" />
                      <span>{event.dj.length} DJ{event.dj.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{event.hypeman.length} Hype{event.hypeman.length > 1 ? 'men' : 'man'}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {event.description}
                  </p>

                  {/* Labels */}
                  <div className="flex flex-wrap gap-1">
                    {event.labels.slice(0, 3).map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded"
                      >
                        {label}
                      </span>
                    ))}
                    {event.labels.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{event.labels.length - 3}
                      </span>
                    )}
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to={`/admin/club/events/${event._id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => setConfirmId(event._id!)}
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
        {events.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first club event.</p>
              <Link
                to="/admin/club/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Event
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClubEventList;