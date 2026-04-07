import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/nextjs';
import { Event, CreateEventDto, UpdateEventDto, Category } from '../../api/types';
import { eventsApi, categoriesApi } from '../../api/client';

interface EventFormProps {
  event?: Event;
  onSuccess: (event: Event) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSuccess, onCancel }) => {
  const { user } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!event;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventDto>({
    defaultValues: event ? {
      name: event.name,
      description: event.description,
      location: event.location,
      eventTime: event.eventTime.slice(0, 16), // Format for datetime-local input
      duration: event.duration,
      category: event.category,
      totalSeats: event.totalSeats,
    } : {}
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data: CreateEventDto) => {
    setLoading(true);
    try {
      // Convert datetime-local to ISO string and ensure numbers are parsed correctly
      const eventData = {
        ...data,
        eventTime: new Date(data.eventTime).toISOString(),
        duration: Number(data.duration), // Convert to number
        totalSeats: Number(data.totalSeats), // Convert to number
      };

      let response;
      if (isEdit) {
        response = await eventsApi.update(event.id, eventData as UpdateEventDto);
      } else {
        response = await eventsApi.create(eventData);
      }

      if (response.success) {
        onSuccess(response.data!);
      }
    } catch (error: any) {
      console.error('Event creation/update error:', error);
      const errorMessage = error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} event`;
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Event' : 'Create New Event'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Event Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              {...register('name', {
                required: 'Event name is required',
                maxLength: { value: 255, message: 'Event name must be less than 255 characters' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter event name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              {...register('location', {
                required: 'Location is required',
                maxLength: { value: 500, message: 'Location must be less than 500 characters' }
              })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Event location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div>
            <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              {...register('eventTime', {
                required: 'Event date and time is required',
                validate: (value) => {
                  const eventDate = new Date(value);
                  const now = new Date();
                  if (eventDate <= now) {
                    return 'Event must be in the future';
                  }
                  return true;
                }
              })}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.eventTime && (
              <p className="mt-1 text-sm text-red-600">{errors.eventTime.message}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 15, message: 'Duration must be at least 15 minutes' },
                max: { value: 1440, message: 'Duration cannot exceed 24 hours (1440 minutes)' },
                valueAsNumber: true
              })}
              type="number"
              min="15"
              max="1440"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Duration in minutes"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Total Seats */}
          <div>
            <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-2">
              Total Seats *
            </label>
            <input
              {...register('totalSeats', {
                required: 'Total seats is required',
                min: { value: 1, message: 'Must have at least 1 seat' },
                max: { value: 10000, message: 'Cannot exceed 10,000 seats' },
                valueAsNumber: true
              })}
              type="number"
              min="1"
              max="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of available seats"
            />
            {errors.totalSeats && (
              <p className="mt-1 text-sm text-red-600">{errors.totalSeats.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Event' : 'Create Event')
              }
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;