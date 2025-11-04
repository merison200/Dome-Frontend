import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { hallAPI, HallImage } from '../../../services/hall';
import { ArrowLeft } from 'lucide-react';

interface Props {
  mode: 'create' | 'edit';
}

interface FormState {
  name: string;
  description: string;
  capacity: string;
  basePrice: string;
  additionalHourPrice: string;
  features: string;
  amenities: string;
  location: string;
  size: string;
  images: File[];
  imageLabels: string[];
  rating: string;
  reviews: string;
}

const HallForm: React.FC<Props> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    capacity: '',
    basePrice: '',
    additionalHourPrice: '',
    features: '',
    amenities: '',
    location: '',
    size: '',
    images: [],
    imageLabels: [],
    rating: '',
    reviews: '',
  });

  const [previewImages, setPreviewImages] = useState<HallImage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHall = async () => {
      if (isEdit && id) {
        try {
          const hall = await hallAPI.getById(id);
          setFormData({
            name: hall.name || '',
            description: hall.description || '',
            capacity: hall.capacity?.toString() || '',
            basePrice: hall.basePrice?.toString() || '',
            additionalHourPrice: hall.additionalHourPrice?.toString() || '',
            features: hall.features?.join(', ') || '',
            amenities: hall.amenities?.join(', ') || '',
            location: hall.location || '',
            size: hall.size || '',
            images: [],
            imageLabels: hall.images?.map((img) => img.label || '') || [],
            rating: hall.rating?.toString() || '',
            reviews: hall.reviews?.toString() || '',
          });

          setPreviewImages(hall.images || []);
        } catch (error) {
          console.error(error);
          toast.error('Failed to load hall');
        }
      }
    };

    fetchHall();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === 'images' && files) {
      const filesArray = Array.from(files);
      setFormData((prev) => ({ ...prev, images: filesArray }));
      setPreviewImages(filesArray.map((file) => ({ url: URL.createObjectURL(file), publicId: '', label: '' })));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'features' || key === 'amenities') {
        (value as string)
          .split(',')
          .forEach((item) => payload.append(key, item.trim()));
      } else if (key === 'images') {
        (value as File[]).forEach((file) => payload.append('images', file));
      } else if (key === 'imageLabels') {
        (value as string[]).forEach((label) => payload.append('imageLabels', label));
      } else if (key === 'rating' || key === 'reviews') {
        payload.append(key, String(Number(value)));
      } else {
        payload.append(key, value.toString());
      }
    });

    try {
      if (isEdit && id) {
        await hallAPI.update(id, payload);
        toast.success('Hall updated successfully!');
      } else {
        await hallAPI.create(payload);
        toast.success('Hall created successfully!');
      }
      navigate('/admin/halls');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save hall');
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
            onClick={() => navigate('/admin/halls')}
            className="flex items-center text-red-600 hover:text-red-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Halls
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Hall' : 'Create Hall'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Hall name"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Hall description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Capacity"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Base Price *</label>
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Base price in Naira"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Additional Hour Price *</label>
                <input
                  type="number"
                  name="additionalHourPrice"
                  value={formData.additionalHourPrice}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Additional hour price in Naira"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Size"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Location"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Features</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Features (comma-separated)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Amenities</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Amenities (comma-separated)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Rating</label>
                <input
                  type="number"
                  step="0.1"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Rating (e.g. 4.8)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Reviews</label>
                <input
                  type="number"
                  name="reviews"
                  value={formData.reviews}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Number of reviews"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Images</label>
              <input
                type="file"
                name="images"
                onChange={handleChange}
                accept="image/*"
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {previewImages.length > 0 && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Image Previews</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewImages.map((img, index) => (
                    <div key={index}>
                      <img
                        src={typeof img === 'string' ? img : img.url}
                        alt="preview"
                        className="w-full h-24 object-cover rounded border"
                      />
                      <input
                        type="text"
                        value={formData.imageLabels[index] || ''}
                        onChange={(e) => {
                          const newLabels = [...formData.imageLabels];
                          newLabels[index] = e.target.value;
                          setFormData((prev) => ({ ...prev, imageLabels: newLabels }));
                        }}
                        placeholder={`Image ${index + 1} label`}
                        className="w-full border mt-2 p-2 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/halls')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : isEdit ? 'Update Hall' : 'Create Hall'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HallForm;