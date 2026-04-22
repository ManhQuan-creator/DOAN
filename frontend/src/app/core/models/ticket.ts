export interface Ticket {
  id: number;
  departure: string;
  destination: string;
  seatLayout: string;
  type: string;
  startTime: string;
  endTime: string;
  travelTime: string;
  offDay: string;
  facilities: string[];
  totalSeats: number;
  seats?: Seat[];
}

export interface Seat {
  id: number;
  name: string;
  price: number;
  seatOrder: number;
  booked: boolean;
}

export interface TicketFilters {
  departure?: string;
  destination?: string;
  type?: string;
  date?: string;
}

export interface CreateTicketRequest {
  departure: string;
  destination: string;
  seatLayout?: string;
  type?: string;
  startTime: string;
  endTime: string;
  travelTime?: string;
  offDay?: string;
  facilities?: string[];
  seatsCount: number;
}

export interface UpdateTicketRequest {
  departure?: string;
  destination?: string;
  seatLayout?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  travelTime?: string;
  offDay?: string;
  facilities?: string[];
}