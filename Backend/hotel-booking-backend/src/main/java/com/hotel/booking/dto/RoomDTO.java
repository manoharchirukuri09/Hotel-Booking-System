package com.hotel.booking.dto;

import com.hotel.booking.model.Room.RoomType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class RoomDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomRequest {
        @NotNull(message = "Hotel ID is required")
        private Long hotelId;

        @NotBlank(message = "Room number is required")
        private String roomNumber;

        @NotNull(message = "Room type is required")
        private RoomType roomType;

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be positive")
        private BigDecimal pricePerNight;

        @Min(1) @Max(20)
        private int maxCapacity;

        private String description;
        private String facilities;
        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoomResponse {
        private Long id;
        private Long hotelId;
        private String hotelName;
        private String roomNumber;
        private RoomType roomType;
        private BigDecimal pricePerNight;
        private int maxCapacity;
        private String description;
        private List<String> facilities;
        private String imageUrl;
        private boolean available;
    }
}
