import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loungeAPI } from '../../../services/lounge';
import toast from 'react-hot-toast';
import { Calendar, Clock, Plus, X, Tag, ArrowLeft } from 'lucide-react';

interface Props {
  mode: 'create' | 'edit';
}

const LoungeEventForm: React.FC<Props> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    description: '',
    labels: [] as string[],
    images: [] as File[],
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      if (isEdit && id) {
        try {
          const response = await loungeAPI.getById(id);
          const event = response.data as any;
          setFormData({
            name: event.name || '',
            date: event.date || '',
            time: event.time || '',
            description: event.description || '',
            labels: event.labels || [],
            images: [],
          });
          setPreviewImages(event.images || []);
        } catch (error) {
          console.error('Failed to load event:', error);
          toast.error('Failed to load event');
        }
      }
    };

    fetchEvent();
  }, [id, isEdit]);

  const convertTo12Hour = (time24: string): string => {
    if (!time24) return '';
    
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  const convertTo24Hour = (time12: string): string => {
    if (!time12) return '';
    
    const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = time12.match(timeRegex);
    
    if (!match) return '';
    
    let [, hours, minutes, ampm] = match;
    let hour = parseInt(hours, 10);
    
    if (ampm.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'images' && files) {
      const filesArray = Array.from(files);
      setFormData((prev) => ({ ...prev, images: filesArray }));
      
      const urls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages(urls);
    } else if (name === 'time') {
      const time12Hour = convertTo12Hour(value);
      setFormData((prev) => ({ ...prev, [name]: time12Hour }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addLabel = () => {
    if (newLabel.trim()) {
      setFormData((prev) => ({ ...prev, labels: [...prev.labels, newLabel.trim()] }));
      setNewLabel('');
    }
  };

  const removeLabel = (index: number) => {
    setFormData((prev) => ({ 
      ...prev, 
      labels: prev.labels.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.date || !formData.time || !formData.description) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    if (formData.labels.length === 0) {
      toast.error('Please add at least one label');
      setLoading(false);
      return;
    }

    if (!isEdit && formData.images.length === 0) {
      toast.error('Please upload at least one image');
      setLoading(false);
      return;
    }

    try {
      if (isEdit && id) {
        await loungeAPI.update(id, {
          ...formData,
          keepExistingImages: formData.images.length === 0,
        });
        toast.success('Event updated successfully');
      } else {
        await loungeAPI.create(formData);
        toast.success('Event created successfully');
      }
      navigate('/admin/lounge/events');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/lounge/events')}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Event' : 'Create Event'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="e.g. Birthday Celebration Package"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={convertTo24Hour(formData.time)}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Make your special day unforgettable with our premium celebration package..."
              />
            </div>

            {/* Labels Section */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Labels *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add label"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLabel())}
                />
                <button
                  type="button"
                  onClick={addLabel}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Event Images *</label>
              <input
                type="file"
                name="images"
                onChange={handleChange}
                accept="image/*"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {isEdit && formData.images.length === 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to keep existing images
                </p>
              )}
            </div>

            {/* Image Preview */}
            {previewImages.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Image Preview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((url, index) => (
                    <div key={index}>
                      <img
                        src={url}
                        alt={`preview-${index}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/lounge/events')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoungeEventForm;