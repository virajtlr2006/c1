export interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  eventTime: Date;
  duration: number;
  organizerEmail: string;
  category: string;
  availableSeats: number;
  totalSeats: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type EventStatus = 'published' | 'cancelled' | 'completed';

export interface CreateEventDto {
  name: string;
  description: string;
  location: string;
  eventTime: string; // ISO date string
  duration: number;
  category: string;
  totalSeats: number;
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
  status?: EventStatus;
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