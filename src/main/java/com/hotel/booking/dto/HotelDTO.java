package com.hotel.booking.dto;

import com.hotel.booking.model.Room.RoomType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class HotelDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HotelRequest {
        @NotBlank(message = "Hotel name is required")
        private String name;

        @NotBlank
        private String city;

        @NotBlank
        private String address;

        @NotBlank
        private String state;

        @NotBlank
        private String country;

        private String description;

        @Min(1) @Max(5)
        private Double starRating;

        private String imageUrl;
        private String amenities;
        private String contactEmail;
        private String contactPhone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HotelResponse {
        private Long id;
        private String name;
        private String city;
        private String address;
        private String state;
        private String country;
        private String description;
        private Double starRating;
        private Double averageRating;
        private String imageUrl;
        private List<String> amenities;
        private String contactEmail;
        private String contactPhone;
        private boolean active;
        private int totalRooms;
        private int availableRooms;
        private List<RoomDTO.RoomResponse> rooms;
    }
}
