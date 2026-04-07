export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventTime: string;
  duration: number;
  organizerEmail: string;
  category: string;
  availableSeats: number;
  totalSeats: number;
  status: 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  id: number;
  eventId: number;
  userEmail: string;
  registeredAt: string;
  status: 'registered' | 'cancelled' | 'attended';
  eventName?: string;
  eventTime?: string;
  eventLocation?: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface CreateEventDto {
  name: string;
  description: string;
  location: string;
  eventTime: string;
  duration: number;
  category: string;
  totalSeats: number;
  organizerEmail?: string;
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  location?: string;
  eventTime?: string;
  duration?: number;
  organizerEmail?: string;
  category?: string;
  totalSeats?: number;
  status?: 'published' | 'cancelled' | 'completed';
}

export interface EventFilters {
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  organizer?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}