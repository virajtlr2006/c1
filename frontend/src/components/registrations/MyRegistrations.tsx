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

  const isEventInFuture = (eventTime?: string) => {
    if (!eventTime) return false;
    return new Date(eventTime) > new Date();
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
              <span style={{ color: 'white', fontSize: '1.25rem' }}>🎫</span>
            </div>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
              Loading your registrations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
        <div className="animate-fade-in">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎫</div>
          <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-md)' }}>
            My <span className="gradient-text">Registrations</span>
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto var(--space-xl)' }}>
            Track your event registrations and manage your upcoming experiences.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-3xl)'
        }}
        className="animate-slide-up"
      >
        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            fontSize: '1.25rem'
          }}>
            📊
          </div>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--primary)' }}>
            {registrations.length}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Total Registrations
          </div>
        </div>

        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            fontSize: '1.25rem'
          }}>
            ✅
          </div>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--success)' }}>
            {registrations.filter(r => r.status === 'registered').length}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Active Registrations
          </div>
        </div>

        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            fontSize: '1.25rem'
          }}>
            🎭
          </div>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--secondary)' }}>
            {registrations.filter(r => r.status === 'attended').length}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Events Attended
          </div>
        </div>
      </div>

      {/* Registrations List */}
      {registrations.length === 0 ? (
        <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎪</div>
            <h3 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
              No registrations yet
            </h3>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Start exploring and register for amazing events to see them here.
            </p>
            <div className="card" style={{ padding: 'var(--space-lg)', background: 'var(--primary-light)' }}>
              <p className="text-body-sm" style={{ color: 'var(--primary)' }}>
                💡 Tip: Visit the Discover page to find events that interest you!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid-cards animate-fade-in">
          {registrations.map((registration, index) => (
            <div
              key={registration.id}
              className="card card-elevated"
              style={{
                animationDelay: `${index * 0.1}s`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: 'var(--space-md)',
                right: 'var(--space-md)',
                zIndex: 2
              }}>
                <span className="text-caption" style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  background: registration.status === 'registered' ?
                    'var(--success-light)' :
                    registration.status === 'cancelled' ?
                      'var(--error-light)' :
                      registration.status === 'attended' ?
                        'var(--info-light)' :
                        'var(--warning-light)',
                  color: registration.status === 'registered' ?
                    'var(--success)' :
                    registration.status === 'cancelled' ?
                      'var(--error)' :
                      registration.status === 'attended' ?
                        'var(--info)' :
                        'var(--warning)'
                }}>
                  {registration.status.toUpperCase()}
                </span>
              </div>

              {/* Registration Header */}
              <div style={{
                height: '6rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-lg)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  {getRegistrationEmoji(registration.status)}
                </div>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg,
                    rgba(99, 102, 241, 0.8) 0%,
                    rgba(139, 92, 246, 0.6) 50%,
                    rgba(249, 115, 22, 0.4) 100%)`
                }} />
              </div>

              {/* Event Content */}
              <div>
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <h3
                    className="text-heading-md line-clamp-2"
                    style={{ marginBottom: '0.5rem', cursor: 'pointer' }}
                    onClick={() => onEventSelect(registration.eventId)}
                  >
                    {registration.eventName || `Event #${registration.eventId}`}
                  </h3>
                </div>

                {/* Event Details */}
                <div style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="text-body-sm" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>📅</span>
                    {registration.eventTime ? formatDate(registration.eventTime) : 'Date TBD'}
                  </div>
                  <div className="text-body-sm" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    {registration.eventLocation || 'Location TBD'}
                  </div>
                  <div className="text-body-sm" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>🎫</span>
                    Registered on {formatDate(registration.registeredAt)}
                  </div>
                </div>

                {/* Status Message */}
                {registration.status === 'cancelled' && (
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--error-light)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <p className="text-body-sm" style={{ color: 'var(--error)' }}>
                      ⚠️ This registration has been cancelled
                    </p>
                  </div>
                )}

                {registration.status === 'attended' && (
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--info-light)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <p className="text-body-sm" style={{ color: 'var(--info)' }}>
                      🎉 You attended this event!
                    </p>
                  </div>
                )}

                {registration.status === 'registered' &&
                 registration.eventTime &&
                 !isEventInFuture(registration.eventTime) && (
                  <div style={{
                    padding: 'var(--space-md)',
                    background: 'var(--warning-light)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <p className="text-body-sm" style={{ color: 'var(--warning)' }}>
                      📅 This event has already occurred
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{
                  paddingTop: 'var(--space-md)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => onEventSelect(registration.eventId)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: '1' }}
                  >
                    👁️ View Event
                  </button>

                  {registration.status === 'registered' &&
                   registration.eventTime &&
                   isEventInFuture(registration.eventTime) && (
                    <button
                      onClick={() => handleCancelRegistration(registration.id)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        color: 'var(--error)',
                        border: '1px solid var(--error)',
                        flex: '1'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {registrations.length > 0 && (
        <div
          className="card animate-fade-in"
          style={{
            marginTop: 'var(--space-3xl)',
            textAlign: 'center',
            background: 'var(--primary-light)'
          }}
        >
          <p className="text-body-md" style={{ color: 'var(--primary)', marginBottom: 'var(--space-sm)' }}>
            📈 Registration Summary
          </p>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            You've registered for {registrations.length} events total.
            {registrations.filter(r => r.status === 'attended').length > 0 &&
              ` Great job attending ${registrations.filter(r => r.status === 'attended').length} events!`
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function for registration status emojis
const getRegistrationEmoji = (status: string): string => {
  const statusEmojis: { [key: string]: string } = {
    'registered': '🎫',
    'cancelled': '❌',
    'attended': '🎉',
    'missed': '😔'
  };

  return statusEmojis[status] || '🎫';
};

export default MyRegistrations;