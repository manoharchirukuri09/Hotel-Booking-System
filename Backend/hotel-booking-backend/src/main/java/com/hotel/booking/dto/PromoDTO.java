package com.hotel.booking.dto;

import com.hotel.booking.model.Promo.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PromoDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PromoRequest {
        @NotBlank(message = "Promo code is required")
        private String code;

        @NotBlank
        private String description;

        @NotNull
        private DiscountType discountType;

        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        private BigDecimal discountValue;

        private BigDecimal minimumBookingAmount;
        private BigDecimal maximumDiscountCap;

        @NotNull
        private LocalDate validFrom;

        @NotNull
        private LocalDate validTo;

        private Integer maxUsageCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PromoResponse {
        private Long id;
        private String code;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minimumBookingAmount;
        private BigDecimal maximumDiscountCap;
        private LocalDate validFrom;
        private LocalDate validTo;
        private Integer maxUsageCount;
        private int usedCount;
        private boolean active;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromoValidateRequest {
        @NotBlank
        private String code;

        @NotNull
        private BigDecimal bookingAmount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PromoValidateResponse {
        private boolean valid;
        private String code;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal discountAmount;
        private BigDecimal finalAmount;
        private String message;
    }
}
