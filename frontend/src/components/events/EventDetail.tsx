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
      <div className="container section">
        <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                background: 'var(--primary-gradient)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-md)',
                animation: 'spin 1s linear infinite'
              }}
            >
              <span style={{ color: 'white', fontSize: '1.25rem' }}>🎭</span>
            </div>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
              Loading event details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container section">
        <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>😔</div>
            <h3 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
              Event not found
            </h3>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              The event you're looking for might have been deleted or doesn't exist.
            </p>
            <button onClick={onBack} className="btn btn-primary">
              ← Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOrganizer = event.organizerEmail === currentUserEmail;
  const canRegister = !isOrganizer && !userRegistration && event.availableSeats > 0 && event.status === 'published';

  return (
    <div className="container section">
      {/* Back Button */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <button
          onClick={onBack}
          className="btn btn-ghost"
          style={{ padding: '0.5rem 1rem' }}
        >
          ← Back to Events
        </button>
      </div>

      {/* Hero Section */}
      <div
        className="card animate-fade-in"
        style={{
          marginBottom: 'var(--space-3xl)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                     radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Status and Category Badges */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-lg)',
            flexWrap: 'wrap'
          }}>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {getCategoryEmoji(event.category)} {event.category}
            </span>
            <span style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: event.status === 'published' ?
                'rgba(16, 185, 129, 0.2)' :
                event.status === 'cancelled' ?
                  'rgba(239, 68, 68, 0.2)' :
                  'rgba(156, 163, 175, 0.2)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {event.status}
            </span>
          </div>

          {/* Event Title */}
          <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-lg)' }}>
            {event.name}
          </h1>

          {/* Key Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-lg)'
          }}>
            <div>
              <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '0.25rem' }}>📅 Date & Time</div>
              <div className="text-heading-sm">{formatDate(event.eventTime)}</div>
            </div>
            <div>
              <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '0.25rem' }}>📍 Location</div>
              <div className="text-heading-sm">{event.location}</div>
            </div>
            <div>
              <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '0.25rem' }}>⏱️ Duration</div>
              <div className="text-heading-sm">{formatDuration(event.duration)}</div>
            </div>
            <div>
              <div className="text-body-sm" style={{ opacity: 0.8, marginBottom: '0.25rem' }}>👥 Availability</div>
              <div className="text-heading-sm">{event.availableSeats}/{event.totalSeats} seats</div>
            </div>
          </div>

          {/* Organizer Actions */}
          {isOrganizer && (
            <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              <button
                onClick={() => onEdit(event)}
                className="btn btn-secondary"
                style={{ background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
              >
                ✏️ Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-ghost"
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'white', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                🗑️ Delete Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--space-2xl)',
        alignItems: 'start'
      }}>
        {/* Main Content */}
        <div className="animate-slide-up">
          {/* About Section */}
          <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-lg)' }}>
              About This Event
            </h2>
            <p className="text-body-md" style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              {event.description}
            </p>
          </div>

          {/* Organizer Details */}
          <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
            <h3 className="text-heading-md" style={{ marginBottom: 'var(--space-md)' }}>
              👤 Organized by
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'var(--primary-gradient)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {event.organizerEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-heading-sm">{event.organizerEmail.split('@')[0]}</div>
                <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                  {event.organizerEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Registrations (Organizer Only) */}
          {isOrganizer && (
            <div className="card">
              <h3 className="text-heading-md" style={{ marginBottom: 'var(--space-md)' }}>
                📝 Registrations ({registrations.length})
              </h3>
              {registrations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎪</div>
                  <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
                    No registrations yet. Share your event to get attendees!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {registrations.map((registration, index) => (
                    <div
                      key={registration.id}
                      className="card"
                      style={{
                        background: 'var(--surface-hover)',
                        padding: 'var(--space-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div>
                        <div className="text-heading-sm">{registration.userEmail}</div>
                        <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
                          Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        background: registration.status === 'registered' ?
                          'var(--success-light)' :
                          registration.status === 'cancelled' ?
                            'var(--error-light)' :
                            'var(--info-light)',
                        color: registration.status === 'registered' ?
                          'var(--success)' :
                          registration.status === 'cancelled' ?
                            'var(--error)' :
                            'var(--info)'
                      }}>
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
        <div className="animate-fade-in" style={{ position: 'sticky', top: 'var(--space-lg)' }}>
          {/* Registration Card */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            {userRegistration ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎉</div>
                <h3 className="text-heading-md" style={{ marginBottom: 'var(--space-sm)', color: 'var(--success)' }}>
                  You're registered!
                </h3>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                  Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                </p>
                <button
                  onClick={handleCancelRegistration}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    color: 'var(--error)',
                    border: '1px solid var(--error)'
                  }}
                >
                  ❌ Cancel Registration
                </button>
              </div>
            ) : canRegister ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎫</div>
                <h3 className="text-heading-md" style={{ marginBottom: 'var(--space-sm)' }}>
                  Join this event!
                </h3>
                <p className="text-body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                  {event.availableSeats} seats remaining
                </p>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  {registering ? (
                    <>
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
                      Registering...
                    </>
                  ) : (
                    <>🚀 Register Now</>
                  )}
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                {isOrganizer ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>👨‍💼</div>
                    <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
                      You're the organizer of this event
                    </p>
                  </>
                ) : event.availableSeats === 0 ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>😞</div>
                    <p className="text-body-md" style={{ color: 'var(--error)' }}>
                      Event is full
                    </p>
                  </>
                ) : event.status !== 'published' ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⏸️</div>
                    <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
                      Event is not available for registration
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>✅</div>
                    <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
                      Already registered
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="card">
            <h4 className="text-heading-sm" style={{ marginBottom: 'var(--space-md)' }}>
              Registration Progress
            </h4>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-sm)',
              color: 'var(--text-secondary)'
            }}>
              <span className="text-body-sm">Registered</span>
              <span className="text-body-sm">{event.totalSeats - event.availableSeats}/{event.totalSeats}</span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: 'var(--border-light)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  width: `${((event.totalSeats - event.availableSeats) / event.totalSeats) * 100}%`,
                  height: '100%',
                  background: 'var(--primary-gradient)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <div className="text-body-sm" style={{
              color: 'var(--text-muted)',
              marginTop: 'var(--space-sm)',
              textAlign: 'center'
            }}>
              {Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100)}% full
            </div>
          </div>
        </div>
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

export default EventDetail;