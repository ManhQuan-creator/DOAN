export interface Booking {
  id: number;
  bookingCode: string;
  type: string;
  departure: string;
  destination: string;
  dateStart: string;
  startTime: string;
  endTime: string;
  travelTime: string;
  seatLayout: string;
  offDay: string;
  ticketFacilities: string[];
  totalPrice: number;
  status: number;
  statusName: string;
  paymentMethod: string | null;
  paymentStatus: number;
  paymentStatusName: string;
  paymentDeadlineInfo: string;
  seats: BookingSeat[];
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  passengerCccd: string;
  passengerType: number | null;
  createdAt: string;
}

export interface BookingSeat {
  id: number;
  seatId: number;
  seatName: string;
  price: number;
}

export interface BookingRequest {
  ticketId: number;
  dateStart: string;
  seatIds: number[];
  paymentMethod?: string;
}

export interface StatusInfo {
  id: number;
  name: string;
  colors: string;
  bg: string;
}