package com.hotel.booking.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class ReviewDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ReviewRequest {
        @NotNull(message = "Hotel ID is required")
        private Long hotelId;

        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private int rating;

        @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
        private String comment;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReviewResponse {
        private Long          id;
        private Long          hotelId;
        private String        hotelName;
        private Long          userId;
        private String        userName;
        private int           rating;
        private String        comment;
        private LocalDateTime createdAt;
    }
}
