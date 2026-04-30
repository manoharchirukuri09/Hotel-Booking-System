package com.hotel.booking.service;

import com.hotel.booking.dto.BookingDTO;
import java.util.List;

public interface BookingService {
    BookingDTO.BookingResponse createBooking(BookingDTO.BookingRequest request, String userEmail);
    BookingDTO.BookingResponse getBookingByReservationNumber(String reservationNumber);
    BookingDTO.BookingResponse getBookingById(Long id);
    List<BookingDTO.BookingResponse> getMyBookings(String userEmail);
    List<BookingDTO.BookingResponse> getAllBookings();
    BookingDTO.BookingResponse cancelBooking(Long id, String userEmail);
    BookingDTO.BookingResponse confirmBooking(Long id);
}
