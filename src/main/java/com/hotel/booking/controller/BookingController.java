package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Create and manage hotel bookings")
@SecurityRequirement(name = "bearerAuth")
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings  — authenticated customer
    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> createBooking(
            @Valid @RequestBody BookingDTO.BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDTO.BookingResponse response =
                bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking confirmed successfully", response));
    }

    // GET /api/bookings/my  — view own booking history
    @GetMapping("/my")
    @Operation(summary = "Get current user's booking history")
    public ResponseEntity<ApiResponse<List<BookingDTO.BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getMyBookings(userDetails.getUsername())));
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> getBookingById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    // GET /api/bookings/reservation/{reservationNumber}
    @GetMapping("/reservation/{reservationNumber}")
    @Operation(summary = "Get booking by reservation number")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> getByReservation(
            @PathVariable String reservationNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getBookingByReservationNumber(reservationNumber)));
    }

    // PUT /api/bookings/{id}/cancel  — customer cancels their own booking
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled",
                bookingService.cancelBooking(id, userDetails.getUsername())));
    }

    // GET /api/bookings  — Admin: view all bookings
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all bookings [ADMIN]")
    public ResponseEntity<ApiResponse<List<BookingDTO.BookingResponse>>> getAllBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings()));
    }

    // PUT /api/bookings/{id}/confirm  — Admin: manually confirm a booking
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm a booking [ADMIN]")
    public ResponseEntity<ApiResponse<BookingDTO.BookingResponse>> confirmBooking(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed",
                bookingService.confirmBooking(id)));
    }
}
