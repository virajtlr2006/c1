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
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">Event Manager</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => onViewChange('events')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'events' || currentView === 'event-detail' || currentView === 'event-form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => onViewChange('my-events')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'my-events'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Events
              </button>
              <button
                onClick={() => onViewChange('registrations')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'registrations'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Registrations
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              👤 {userEmail}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h2>
          <p className="text-gray-600 mb-8">Sign in to manage and discover events</p>
        </div>

        <div className="space-y-4">
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium">
              Sign In
            </button>
          </SignInButton>

          <div className="text-center text-gray-500">or</div>

          <SignUpButton mode="modal">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium">
              Create Account
            </button>
          </SignUpButton>
        </div>

        <div className="text-center text-sm text-gray-500">
          Sign in to create events, register for events, and manage your registrations.
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
  if (!isLoaded || (isSignedIn && !authSetup)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      <Navigation
        userEmail={userEmail}
        currentView={appState.view}
        onViewChange={handleViewChange}
      />

      <main className="py-6">
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
    </div>
  );
};

export default App;