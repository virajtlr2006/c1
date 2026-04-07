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
              <span style={{ color: 'white', fontSize: '1.25rem' }}>🎯</span>
            </div>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
              Loading your events...
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
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎯</div>
          <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-md)' }}>
            My <span className="gradient-text">Events</span>
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto var(--space-xl)' }}>
            Manage your events, track registrations, and create amazing experiences.
          </p>
          <button onClick={onCreateEvent} className="btn btn-primary btn-lg">
            <span>✨</span>
            Create New Event
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
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
            {events.length}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Total Events
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
            {events.filter(e => e.status === 'published').length}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Active Events
          </div>
        </div>

        <div className="card card-elevated" style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)',
            fontSize: '1.25rem'
          }}>
            👥
          </div>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--accent)' }}>
            {events.reduce((sum, event) => sum + (event.totalSeats - event.availableSeats), 0)}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Total Attendees
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
            🪑
          </div>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--secondary)' }}>
            {events.reduce((sum, event) => sum + event.availableSeats, 0)}
          </div>
          <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>
            Available Seats
          </div>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎭</div>
            <h3 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
              Ready to create your first event?
            </h3>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Start building your community by creating memorable events that bring people together.
            </p>
            <button onClick={onCreateEvent} className="btn btn-primary">
              <span>🚀</span>
              Create Your First Event
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-cards animate-fade-in">
          {events.map((event, index) => (
            <div
              key={event.id}
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
                <span className={`text-caption`} style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  background: event.status === 'published' ?
                    'var(--success-light)' :
                    event.status === 'cancelled' ?
                      'var(--error-light)' :
                      'var(--warning-light)',
                  color: event.status === 'published' ?
                    'var(--success)' :
                    event.status === 'cancelled' ?
                      'var(--error)' :
                      'var(--warning)'
                }}>
                  {event.status.toUpperCase()}
                </span>
              </div>

              {/* Event Header */}
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
                  {getCategoryEmoji(event.category)}
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
                    onClick={() => onEventSelect(event)}
                  >
                    {event.name}
                  </h3>
                  <p className="text-body-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {event.description}
                  </p>
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
                    {formatDate(event.eventTime)}
                  </div>
                  <div className="text-body-sm" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    {event.location}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    <div className="text-body-sm" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span>👥 Registered</span>
                      <span>{event.totalSeats - event.availableSeats}/{event.totalSeats}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
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
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  paddingTop: 'var(--space-md)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => onEventSelect(event)}
                    className="text-body-sm"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    👁️ View
                  </button>
                  <button
                    onClick={() => onEditEvent(event)}
                    className="text-body-sm"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id, event.name)}
                    disabled={deleting === event.id}
                    className="text-body-sm"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: deleting === event.id ? 'var(--text-disabled)' : 'var(--error)',
                      cursor: deleting === event.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {deleting === event.id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </button>
                </div>

                {/* Category Tag */}
                <div style={{ marginTop: 'var(--space-sm)' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {event.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper function for category emojis (reuse from EventList)
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

export default MyEvents;