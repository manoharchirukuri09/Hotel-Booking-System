package com.hotel.booking.dto;

import com.hotel.booking.model.Booking.BookingStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class BookingRequest {
        @NotNull(message = "Hotel ID is required")
        private Long hotelId;

        @NotNull(message = "Room ID is required")
        private Long roomId;

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in must be today or in the future")
        private LocalDate checkInDate;

        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out must be in the future")
        private LocalDate checkOutDate;

        @Min(value = 1, message = "At least 1 guest required")
        @Max(value = 10, message = "Maximum 10 guests allowed")
        private int numberOfGuests;

        private String promoCode;

        /** Loyalty points user wants to redeem (must be multiple of 100). */
        @Min(value = 0, message = "Redeem points cannot be negative")
        private Integer redeemLoyaltyPoints = 0;

        private String specialRequests;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingResponse {
        private Long          id;
        private String        reservationNumber;
        private Long          userId;
        private String        userFullName;
        private String        userEmail;
        private Long          hotelId;
        private String        hotelName;
        private String        hotelCity;
        private Long          roomId;
        private String        roomNumber;
        private String        roomType;
        private LocalDate     checkInDate;
        private LocalDate     checkOutDate;
        private int           numberOfNights;
        private int           numberOfGuests;
        private BigDecimal    pricePerNight;
        private BigDecimal    discountAmount;          // promo discount
        private BigDecimal    loyaltyDiscountAmount;   // tier auto-discount
        private int           loyaltyPointsEarned;     // earned on this booking
        private int           loyaltyPointsRedeemed;   // redeemed on this booking
        private BigDecimal    totalAmount;
        private String        promoCode;
        private BookingStatus status;
        private String        specialRequests;
        private LocalDateTime createdAt;
    }
}
