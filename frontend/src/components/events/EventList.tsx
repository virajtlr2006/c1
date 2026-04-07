import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Event, EventFilters, Category } from '../../api/types';
import { eventsApi, categoriesApi } from '../../api/client';

interface EventListProps {
  onEventSelect: (event: Event) => void;
  onCreateEvent: () => void;
  onEditEvent?: (event: Event) => void;
}

const EventList: React.FC<EventListProps> = ({ onEventSelect, onCreateEvent, onEditEvent }) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<EventFilters>({});
  const [deleting, setDeleting] = useState<number | null>(null);

  const currentUserEmail = user?.emailAddresses[0]?.emailAddress || user?.id || '';
  // Get current user email for ownership validation

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, [filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll(filters);
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleDeleteEvent = async (eventId: number, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(eventId);
    try {
      const response = await eventsApi.delete(eventId);
      if (response.success) {
        setEvents(events.filter(event => event.id !== eventId));
        alert('Event deleted successfully');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.response?.data?.error || 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <button
          onClick={onCreateEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => setFilters({})}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No events found. {Object.keys(filters).length > 0 ? 'Try adjusting your filters.' : 'Create the first event!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => onEventSelect(event)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {event.name}
                  </h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="font-medium">📅</span>
                    <span className="ml-2">{formatDate(event.eventTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">📍</span>
                    <span className="ml-2">{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">👥</span>
                    <span className="ml-2">
                      {event.availableSeats}/{event.totalSeats} seats available
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                      By: {event.organizerEmail === currentUserEmail ? 'You' : event.organizerEmail}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      event.status === 'published' ? 'bg-green-100 text-green-800' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Owner Controls */}
                  {event.organizerEmail === currentUserEmail && (
                    <div className="flex space-x-3 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventSelect(event);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        👁️ View
                      </button>
                      {onEditEvent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent(event);
                          }}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id, event.name);
                        }}
                        disabled={deleting === event.id}
                        className={`text-sm font-medium flex items-center ${
                          deleting === event.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        {deleting === event.id ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;