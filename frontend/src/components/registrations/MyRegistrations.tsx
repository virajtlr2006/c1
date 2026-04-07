import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Registration } from '../../api/types';
import { registrationsApi } from '../../api/client';

interface MyRegistrationsProps {
  onEventSelect: (eventId: number) => void;
}

const MyRegistrations: React.FC<MyRegistrationsProps> = ({ onEventSelect }) => {
  const { isSignedIn, isLoaded } = useUser();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load registrations if user is authenticated and Clerk has loaded
    if (isLoaded && isSignedIn) {
      loadRegistrations();
    } else if (isLoaded && !isSignedIn) {
      // If not signed in, clear loading state
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationsApi.getUserRegistrations();
      if (response.success) {
        setRegistrations(response.data || []);
      }
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: number) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;

    try {
      const response = await registrationsApi.cancel(registrationId);
      if (response.success) {
        setRegistrations(prev => prev.filter(reg => reg.id !== registrationId));
        alert('Registration cancelled successfully');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to cancel registration');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isEventInFuture = (eventTime?: string) => {
    if (!eventTime) return false;
    return new Date(eventTime) > new Date();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">Loading your registrations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Registrations</h1>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-lg text-gray-500">No registrations yet</p>
          <p className="text-sm text-gray-400 mt-2">Register for events to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3
                      className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => onEventSelect(registration.eventId)}
                    >
                      {registration.eventName || `Event #${registration.eventId}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(registration.status)}`}>
                      {registration.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium text-gray-500">Event Date</p>
                      <p>{registration.eventTime ? formatDate(registration.eventTime) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Location</p>
                      <p>{registration.eventLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Registered On</p>
                      <p>{formatDate(registration.registeredAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => onEventSelect(registration.eventId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    View Event
                  </button>

                  {registration.status === 'registered' &&
                   registration.eventTime &&
                   isEventInFuture(registration.eventTime) && (
                    <button
                      onClick={() => handleCancelRegistration(registration.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Registration Status Info */}
              {registration.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    ⚠️ This registration has been cancelled
                  </p>
                </div>
              )}

              {registration.status === 'attended' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    ✅ You attended this event
                  </p>
                </div>
              )}

              {registration.status === 'registered' &&
               registration.eventTime &&
               !isEventInFuture(registration.eventTime) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    📅 This event has already occurred
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Total registrations: {registrations.length}
        </p>
      </div>
    </div>
  );
};

export default MyRegistrations;