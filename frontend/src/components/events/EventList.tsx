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
    <div className="container section">
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
        <div className="animate-fade-in">
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎪</div>
          <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-md)' }}>
            Discover Amazing <span className="gradient-text">Events</span>
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '32rem', margin: '0 auto var(--space-xl)' }}>
            Find events that inspire you, connect with your community, and create unforgettable memories.
          </p>
          <button onClick={onCreateEvent} className="btn btn-primary btn-lg">
            <span>✨</span>
            Create Your Event
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div
        className="card animate-slide-up"
        style={{ marginBottom: 'var(--space-2xl)', background: 'var(--surface)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search events..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <div style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1rem',
              color: 'var(--text-muted)'
            }}>
              🔍
            </div>
          </div>

          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input"
            style={{ cursor: 'pointer' }}
          >
            <option value="">🏷️ All Categories</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="📍 Location"
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <div style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1rem',
              color: 'var(--text-muted)'
            }}>
              📍
            </div>
          </div>

          <button
            onClick={() => setFilters({})}
            className="btn btn-ghost"
            style={{ whiteSpace: 'nowrap' }}
          >
            ✖️ Clear Filters
          </button>
        </div>

        {/* Filter Summary */}
        {Object.keys(filters).length > 0 && (
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
            <div className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>Active filters: </span>
              {filters.search && <span style={{ color: 'var(--primary)' }}>"{filters.search}" </span>}
              {filters.category && <span style={{ color: 'var(--primary)' }}>{filters.category} </span>}
              {filters.location && <span style={{ color: 'var(--primary)' }}>{filters.location}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
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
              <span style={{ color: 'white', fontSize: '1.25rem' }}>🎪</span>
            </div>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)' }}>
              Loading amazing events...
            </p>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex-center" style={{ padding: 'var(--space-3xl)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🎭</div>
            <h3 className="text-heading-lg" style={{ marginBottom: 'var(--space-md)' }}>
              {Object.keys(filters).length > 0 ? 'No events match your search' : 'No events yet'}
            </h3>
            <p className="text-body-md" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              {Object.keys(filters).length > 0 ?
                'Try adjusting your filters to discover more events.' :
                'Be the first to create an amazing event!'
              }
            </p>
            {Object.keys(filters).length === 0 && (
              <button onClick={onCreateEvent} className="btn btn-primary">
                <span>✨</span>
                Create First Event
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-cards animate-fade-in">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="card card-elevated"
              onClick={() => onEventSelect(event)}
              style={{
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Event Status Badge */}
              <div style={{
                position: 'absolute',
                top: 'var(--space-md)',
                right: 'var(--space-md)',
                zIndex: 2
              }}>
                <span className={`text-caption ${
                  event.status === 'published' ?
                    '' : event.status === 'cancelled' ? '' : ''
                }`} style={{
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

              {/* Event Illustration Header */}
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
                {/* Gradient overlay */}
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
                  <h3 className="text-heading-md line-clamp-2" style={{ marginBottom: '0.5rem' }}>
                    {event.name}
                  </h3>
                  <p className="text-body-sm line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
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
                  <div className="text-body-sm" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-tertiary)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>👥</span>
                    {event.availableSeats}/{event.totalSeats} seats available
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  paddingTop: 'var(--space-md)',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div className="text-caption" style={{ color: 'var(--text-muted)' }}>
                    BY {event.organizerEmail === currentUserEmail ? 'YOU' : event.organizerEmail.split('@')[0].toUpperCase()}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
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

                {/* Owner Controls */}
                {event.organizerEmail === currentUserEmail && (
                  <div style={{
                    marginTop: 'var(--space-md)',
                    paddingTop: 'var(--space-md)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: 'var(--space-sm)'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventSelect(event);
                      }}
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
                    {onEditEvent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
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
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id, event.name);
                      }}
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
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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

export default EventList;