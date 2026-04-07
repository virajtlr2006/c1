export interface Registration {
  id: number;
  eventId: number;
  userEmail: string;
  registeredAt: Date;
  status: RegistrationStatus;
}

export type RegistrationStatus = 'registered' | 'cancelled' | 'attended';

export interface CreateRegistrationDto {
  eventId: number;
  userEmail: string;
}

export interface UpdateRegistrationDto {
  status?: RegistrationStatus;
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