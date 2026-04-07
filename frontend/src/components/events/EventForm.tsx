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
    <div className="container section">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
        <div className="animate-fade-in">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>
            {isEdit ? '✏️' : '✨'}
          </div>
          <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-md)' }}>
            {isEdit ? (
              <>Edit <span className="gradient-text">Event</span></>
            ) : (
              <>Create Amazing <span className="gradient-text">Event</span></>
            )}
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto' }}>
            {isEdit ?
              'Update your event details to keep your attendees informed.' :
              'Bring people together by creating memorable experiences that matter.'
            }
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="card animate-slide-up">
          <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
            {/* Event Name */}
            <div>
              <label className="text-heading-sm" style={{
                display: 'block',
                marginBottom: 'var(--space-sm)',
                color: 'var(--text-primary)'
              }}>
                🎪 Event Name *
              </label>
              <input
                {...register('name', {
                  required: 'Event name is required',
                  maxLength: { value: 255, message: 'Event name must be less than 255 characters' }
                })}
                type="text"
                className="input"
                placeholder="Enter an exciting event name"
                style={{
                  fontSize: '1rem',
                  padding: 'var(--space-md)',
                }}
              />
              {errors.name && (
                <p className="text-body-sm" style={{
                  color: 'var(--error)',
                  marginTop: 'var(--space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚠️ {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-heading-sm" style={{
                display: 'block',
                marginBottom: 'var(--space-sm)',
                color: 'var(--text-primary)'
              }}>
                📝 Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="input"
                placeholder="Describe what makes your event special..."
                style={{
                  fontSize: '1rem',
                  padding: 'var(--space-md)',
                  resize: 'vertical',
                  minHeight: '120px'
                }}
              />
              {errors.description && (
                <p className="text-body-sm" style={{
                  color: 'var(--error)',
                  marginTop: 'var(--space-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⚠️ {errors.description.message}
                </p>
              )}
            </div>

            {/* Location and Date Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--space-lg)'
            }}>
              {/* Location */}
              <div>
                <label className="text-heading-sm" style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-primary)'
                }}>
                  📍 Location *
                </label>
                <input
                  {...register('location', {
                    required: 'Location is required',
                    maxLength: { value: 500, message: 'Location must be less than 500 characters' }
                  })}
                  type="text"
                  className="input"
                  placeholder="Where will it happen?"
                  style={{
                    fontSize: '1rem',
                    padding: 'var(--space-md)',
                  }}
                />
                {errors.location && (
                  <p className="text-body-sm" style={{
                    color: 'var(--error)',
                    marginTop: 'var(--space-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ {errors.location.message}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div>
                <label className="text-heading-sm" style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-primary)'
                }}>
                  📅 Date & Time *
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
                  className="input"
                  style={{
                    fontSize: '1rem',
                    padding: 'var(--space-md)',
                  }}
                />
                {errors.eventTime && (
                  <p className="text-body-sm" style={{
                    color: 'var(--error)',
                    marginTop: 'var(--space-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ {errors.eventTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* Duration, Category, and Seats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-lg)'
            }}>
              {/* Duration */}
              <div>
                <label className="text-heading-sm" style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-primary)'
                }}>
                  ⏱️ Duration (minutes) *
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
                  className="input"
                  placeholder="120"
                  style={{
                    fontSize: '1rem',
                    padding: 'var(--space-md)',
                  }}
                />
                {errors.duration && (
                  <p className="text-body-sm" style={{
                    color: 'var(--error)',
                    marginTop: 'var(--space-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ {errors.duration.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="text-heading-sm" style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-primary)'
                }}>
                  🏷️ Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="input"
                  style={{
                    fontSize: '1rem',
                    padding: 'var(--space-md)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {getCategoryEmoji(category.name)} {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-body-sm" style={{
                    color: 'var(--error)',
                    marginTop: 'var(--space-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ {errors.category.message}
                  </p>
                )}
              </div>

              {/* Total Seats */}
              <div>
                <label className="text-heading-sm" style={{
                  display: 'block',
                  marginBottom: 'var(--space-sm)',
                  color: 'var(--text-primary)'
                }}>
                  🪑 Total Seats *
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
                  className="input"
                  placeholder="50"
                  style={{
                    fontSize: '1rem',
                    padding: 'var(--space-md)',
                  }}
                />
                {errors.totalSeats && (
                  <p className="text-body-sm" style={{
                    color: 'var(--error)',
                    marginTop: 'var(--space-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ {errors.totalSeats.message}
                  </p>
                )}
              </div>
            </div>

            {/* Helper Tips */}
            <div className="card" style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)'
            }}>
              <div className="text-body-sm" style={{ color: 'var(--primary)' }}>
                💡 <strong>Pro Tips:</strong>
              </div>
              <ul className="text-body-sm" style={{
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-sm)',
                paddingLeft: 'var(--space-md)'
              }}>
                <li>• Write a compelling description to attract more attendees</li>
                <li>• Choose a category that best represents your event</li>
                <li>• Set realistic seat limits based on your venue capacity</li>
                <li>• Double-check the date and time for accuracy</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-md)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '1rem',
                        height: '1rem',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}
                    />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  <>{isEdit ? '✅ Update Event' : '🚀 Create Event'}</>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary btn-lg"
                style={{ flex: 1 }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function for category emojis
const getCategoryEmoji = (category: string): string => {
  const categoryEmojis: { [key: string]: string } = {
    'Business': '💼',
    'Technology': '💻',
    'Education': '📚',
    'Entertainment': '🎭',
    'Sports': '⚽',
    'Health': '🏥',
    'Art': '🎨',
    'Arts & Culture': '🎨',
    'Music': '🎵',
    'Food': '🍽️',
    'Travel': '✈️',
    'Fashion': '👗',
    'Gaming': '🎮',
    'Science': '🔬',
    'Photography': '📸',
    'Writing': '✍️',
    'Finance': '💰',
    'Marketing': '📢',
    'Design': '🎯',
    'Networking': '🤝',
    'Workshop': '🛠️'
  };

  return categoryEmojis[category] || '🎪';
};

export default EventForm;