import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Event, Registration } from '../../api/types';
import { eventsApi, registrationsApi } from '../../api/client';

interface EventDetailProps {
  eventId: number;
  onBack: () => void;
  onEdit: (event: Event) => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventId, onBack, onEdit }) => {
  const { user } = useUser();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const currentUserEmail = user?.emailAddresses[0]?.emailAddress || user?.id || '';

  useEffect(() => {
    loadEvent();
    checkUserRegistration();
    if (event?.organizerEmail === currentUserEmail) {
      loadEventRegistrations();
    }
  }, [eventId, currentUserEmail]);

  const loadEvent = async () => {
    try {
      const response = await eventsApi.getById(eventId);
      if (response.success) {
        setEvent(response.data!);
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRegistration = async () => {
    try {
      const response = await registrationsApi.getUserRegistrations();
      if (response.success) {
        const userReg = response.data?.find(reg => reg.eventId === eventId);
        setUserRegistration(userReg || null);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  const loadEventRegistrations = async () => {
    try {
      const response = await registrationsApi.getEventRegistrations(eventId);
      if (response.success) {
        setRegistrations(response.data || []);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    }
  };

  const handleRegister = async () => {
    if (!event) return;

    setRegistering(true);
    try {
      const response = await registrationsApi.register(eventId);
      if (response.success) {
        setUserRegistration(response.data!);
        // Refresh event to get updated available seats
        loadEvent();
        alert('Successfully registered for the event!');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to register');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!userRegistration) return;

    if (!confirm('Are you sure you want to cancel your registration?')) return;

    try {
      const response = await registrationsApi.cancel(userRegistration.id);
      if (response.success) {
        setUserRegistration(null);
        loadEvent();
        alert('Registration cancelled successfully');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel registration');
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    try {
      const response = await eventsApi.delete(eventId);
      if (response.success) {
        alert('Event deleted successfully');
        onBack();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${minutes} minutes`;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Event not found</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isOrganizer = event.organizerEmail === currentUserEmail;
  const canRegister = !isOrganizer && !userRegistration && event.availableSeats > 0 && event.status === 'published';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Events
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {event.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'published' ? 'bg-green-100 text-green-800' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </div>
          </div>
          {isOrganizer && (
            <div className="space-x-2">
              <button
                onClick={() => onEdit(event)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ✏️ Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🗑️ Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">About This Event</h2>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Registrations (Organizer Only) */}
          {isOrganizer && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">
                Registrations ({registrations.length})
              </h2>
              {registrations.length === 0 ? (
                <p className="text-gray-500">No registrations yet.</p>
              ) : (
                <div className="space-y-3">
                  {registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{registration.userEmail}</p>
                        <p className="text-sm text-gray-500">
                          Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        registration.status === 'registered' ? 'bg-green-100 text-green-800' :
                        registration.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {registration.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Event Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">{formatDate(event.eventTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{formatDuration(event.duration)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Organizer</p>
                <p className="font-medium">{event.organizerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="font-medium">
                  {event.availableSeats}/{event.totalSeats} seats available
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {userRegistration ? (
              <div>
                <div className="text-center mb-4">
                  <p className="text-green-600 font-medium">✓ You're registered!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleCancelRegistration}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium"
                >
                  Cancel Registration
                </button>
              </div>
            ) : canRegister ? (
              <button
                onClick={handleRegister}
                disabled={registering}
                className={`w-full py-3 px-4 rounded-lg font-medium ${
                  registering
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            ) : (
              <div className="text-center py-4">
                {isOrganizer ? (
                  <p className="text-gray-500">You're the organizer of this event</p>
                ) : event.availableSeats === 0 ? (
                  <p className="text-red-600">Event is full</p>
                ) : event.status !== 'published' ? (
                  <p className="text-gray-500">Event is not available for registration</p>
                ) : (
                  <p className="text-gray-500">Already registered</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;