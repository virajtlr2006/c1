import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Event } from '../../api/types';
import { eventsApi } from '../../api/client';

interface MyEventsProps {
  onEventSelect: (event: Event) => void;
  onCreateEvent: () => void;
  onEditEvent: (event: Event) => void;
}

const MyEvents: React.FC<MyEventsProps> = ({ onEventSelect, onCreateEvent, onEditEvent }) => {
  const { user } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const currentUserEmail = user?.emailAddresses[0]?.emailAddress || user?.id || '';

  useEffect(() => {
    loadMyEvents();
  }, [currentUserEmail]);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getAll({ organizer: currentUserEmail });
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error loading my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: number, eventName: string) => {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Manage events you've created</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center"
        >
          ➕ Create New Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              📅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-green-600">
                {events.filter(e => e.status === 'published').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-purple-600">
                {events.reduce((sum, event) => sum + (event.totalSeats - event.availableSeats), 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              👥
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Seats</p>
              <p className="text-2xl font-bold text-yellow-600">
                {events.reduce((sum, event) => sum + event.availableSeats, 0)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              🪑
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first event</p>
          <button
            onClick={onCreateEvent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendees
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <button
                          onClick={() => onEventSelect(event)}
                          className="text-left font-medium text-blue-600 hover:text-blue-800 mb-1"
                        >
                          {event.name}
                        </button>
                        <p className="text-sm text-gray-500 mb-2">{event.location}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full w-fit">
                          {event.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.eventTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {event.totalSeats - event.availableSeats}/{event.totalSeats}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button
                        onClick={() => onEventSelect(event)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                        title="View Event Details"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => onEditEvent(event)}
                        className="text-green-600 hover:text-green-800 font-medium flex items-center"
                        title="Edit Event"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event.id, event.name)}
                        disabled={deleting === event.id}
                        className={`font-medium flex items-center ${
                          deleting === event.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title="Delete Event"
                      >
                        {deleting === event.id ? '⏳ Deleting...' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;