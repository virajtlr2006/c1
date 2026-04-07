import React, { useState, useEffect } from 'react';
import { useUser, useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { setAuthTokenGetter, setUserEmailGetter } from './api/client';
import EventList from './components/events/EventList';
import EventDetail from './components/events/EventDetail';
import EventForm from './components/events/EventForm';
import MyRegistrations from './components/registrations/MyRegistrations';
import MyEvents from './components/events/MyEvents';
import { Event } from './api/types';

type ViewType = 'events' | 'event-detail' | 'event-form' | 'registrations' | 'my-events';

interface AppState {
  view: ViewType;
  selectedEventId?: number;
  editingEvent?: Event;
}

const Navigation: React.FC<{
  userEmail: string;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}> = ({ userEmail, currentView, onViewChange }) => {
  return (
    <nav className="nav-modern">
      <div className="container">
        <div className="flex-between" style={{ height: '4rem' }}>
          {/* Logo and Brand */}
          <div className="flex" style={{ alignItems: 'center', gap: '2rem' }}>
            <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  background: 'var(--primary-gradient)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 'bold'
                }}
              >
                E
              </div>
              <h1 className="text-display-sm gradient-text" style={{ margin: 0 }}>
                EventFlow
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="flex" style={{ gap: '0.5rem' }}>
              <button
                onClick={() => onViewChange('events')}
                className={`nav-link ${
                  currentView === 'events' || currentView === 'event-detail' || currentView === 'event-form'
                    ? 'active'
                    : ''
                }`}
              >
                🌟 Discover
              </button>
              <button
                onClick={() => onViewChange('my-events')}
                className={`nav-link ${currentView === 'my-events' ? 'active' : ''}`}
              >
                🎯 My Events
              </button>
              <button
                onClick={() => onViewChange('registrations')}
                className={`nav-link ${currentView === 'registrations' ? 'active' : ''}`}
              >
                🎫 Registered
              </button>
            </div>
          </div>

          {/* User Section */}
          <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
            <div
              className="text-body-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span style={{ marginRight: '0.5rem' }}>👋</span>
              {userEmail.split('@')[0]}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const SignInPage: React.FC = () => {
  return (
    <div
      className="flex-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative'
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        }}
      />

      <div className="container">
        <div
          className="card-glass animate-scale-in"
          style={{
            maxWidth: '28rem',
            margin: '0 auto',
            padding: '3rem',
            textAlign: 'center'
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                background: 'var(--primary-gradient)',
                borderRadius: 'var(--radius-2xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              ✨
            </div>
            <div>
              <h2 className="text-display-md" style={{ margin: 0, marginBottom: '0.5rem' }}>
                Welcome to <span className="gradient-text">EventFlow</span>
              </h2>
              <p className="text-body-md" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Discover amazing events and create memorable experiences
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'var(--surface-hover)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎪</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Discover</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎯</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Create</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🤝</div>
              <div className="text-caption" style={{ color: 'var(--text-secondary)' }}>Connect</div>
            </div>
          </div>

          {/* Sign In Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SignInButton mode="modal">
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                <span>🚀</span>
                Sign In
              </button>
            </SignInButton>

            <div
              className="text-body-sm"
              style={{
                color: 'var(--text-muted)',
                position: 'relative',
                margin: '0.5rem 0'
              }}
            >
              <span
                style={{
                  background: 'var(--surface)',
                  padding: '0 1rem',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                or
              </span>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'var(--border)',
                  zIndex: 0
                }}
              />
            </div>

            <SignUpButton mode="modal">
              <button className="btn btn-secondary btn-lg" style={{ width: '100%' }}>
                <span>✨</span>
                Create Account
              </button>
            </SignUpButton>
          </div>

          {/* Footer Text */}
          <div
            className="text-body-sm"
            style={{
              color: 'var(--text-tertiary)',
              marginTop: '2rem',
              lineHeight: 1.5
            }}
          >
            Join our community to create events, discover new experiences, and connect with others.
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [appState, setAppState] = useState<AppState>({ view: 'events' });
  const [authSetup, setAuthSetup] = useState(false);

  // Set up authentication token getter for API client
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const userEmail = user.emailAddresses[0]?.emailAddress || user.id;
      console.log('🔧 Setting up auth token getter for user:', userEmail);

      const tokenGetter = async () => {
        try {
          console.log('🔑 Attempting to get Clerk token...');
          const token = await getToken();
          console.log('✅ Token obtained:', token ? 'Token received' : 'No token');
          return token;
        } catch (error) {
          console.warn('❌ Failed to get Clerk token:', error);
          return null;
        }
      };

      const emailGetter = () => {
        return user.emailAddresses[0]?.emailAddress || null;
      };

      setAuthTokenGetter(tokenGetter);
      setUserEmailGetter(emailGetter);
      setAuthSetup(true);
    } else if (isLoaded && !isSignedIn) {
      // Clear auth setup when not signed in
      console.log('🔧 Clearing auth setup - user not signed in');
      setAuthTokenGetter(() => async () => null);
      setUserEmailGetter(() => () => null);
      setAuthSetup(false);
    }
  }, [isLoaded, isSignedIn, user]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div
        className="flex-center"
        style={{
          minHeight: '100vh',
          background: 'var(--background-secondary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="animate-scale-in"
            style={{
              width: '3rem',
              height: '3rem',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}
          >
            <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>E</div>
          </div>
          <p className="text-body-sm" style={{ color: 'var(--text-secondary)' }}>
            Loading your events...
          </p>
        </div>
      </div>
    );
  }

  // Show sign in page if not authenticated
  if (!isSignedIn) {
    return <SignInPage />;
  }

  const userEmail = user?.emailAddresses[0]?.emailAddress || user?.id || 'Unknown';

  const handleViewChange = (view: ViewType) => {
    setAppState({ view, selectedEventId: undefined, editingEvent: undefined });
  };

  const handleEventSelect = (event: Event) => {
    setAppState({ view: 'event-detail', selectedEventId: event.id });
  };

  const handleEventSelectById = (eventId: number) => {
    setAppState({ view: 'event-detail', selectedEventId: eventId });
  };

  const handleCreateEvent = () => {
    setAppState({ view: 'event-form', editingEvent: undefined });
  };

  const handleEditEvent = (event: Event) => {
    setAppState({ view: 'event-form', editingEvent: event });
  };

  const handleFormSuccess = (event: Event) => {
    setAppState({ view: 'event-detail', selectedEventId: event.id });
  };

  const handleFormCancel = () => {
    if (appState.editingEvent) {
      setAppState({ view: 'event-detail', selectedEventId: appState.editingEvent.id });
    } else {
      setAppState({ view: 'events' });
    }
  };

  const handleBackToEvents = () => {
    setAppState({ view: 'events' });
  };

  return (
    <>
      <Navigation
        userEmail={userEmail}
        currentView={appState.view}
        onViewChange={handleViewChange}
      />

      <main
        style={{
          minHeight: 'calc(100vh - 4rem)',
          background: 'var(--background)',
          paddingTop: 'var(--space-lg)'
        }}
      >
        {appState.view === 'events' && (
          <EventList
            onEventSelect={handleEventSelect}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
          />
        )}

        {appState.view === 'event-detail' && appState.selectedEventId && (
          <EventDetail
            eventId={appState.selectedEventId}
            onBack={handleBackToEvents}
            onEdit={handleEditEvent}
          />
        )}

        {appState.view === 'event-form' && (
          <EventForm
            event={appState.editingEvent}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {appState.view === 'registrations' && (
          <MyRegistrations
            onEventSelect={handleEventSelectById}
          />
        )}

        {appState.view === 'my-events' && (
          <MyEvents
            onEventSelect={handleEventSelect}
            onCreateEvent={handleCreateEvent}
            onEditEvent={handleEditEvent}
          />
        )}
      </main>
    </>
  );
};

export default App;