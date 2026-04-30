package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.model.User;
import com.hotel.booking.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/loyalty")
@RequiredArgsConstructor
@Tag(name = "Loyalty", description = "Loyalty points and rewards management")
@SecurityRequirement(name = "bearerAuth")
public class LoyaltyController {

    private final UserRepository userRepository;

    /**
     * GET /api/loyalty/me
     * Returns current user's loyalty summary.
     */
    @GetMapping("/me")
    @Operation(summary = "Get my loyalty points, tier and discount info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyLoyalty(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();

        Map<String, Object> data = Map.of(
                "loyaltyPoints", user.getLoyaltyPoints(),
                "loyaltyTier", user.getLoyaltyTier().name(),
                "tierDiscountPercent", user.getLoyaltyTier().discountPercent(),
                "nextTier", nextTierInfo(user),
                "pointsToNextTier", pointsToNextTier(user),
                "redeemValue", (user.getLoyaltyPoints() / 100) * 50 // ₹50 per 100 pts
        );
        return ResponseEntity.ok(ApiResponse.success("Loyalty details fetched", data));
    }

    /**
     * GET /api/loyalty/tiers
     * Public info on all tiers and their benefits.
     */
    @GetMapping("/tiers")
    @Operation(summary = "Get all loyalty tier benefits")
    public ResponseEntity<ApiResponse<Object>> getTierInfo() {
        var tiers = java.util.List.of(
                Map.of("tier", "BRONZE", "minPoints", 0, "maxPoints", 499, "discount", "0%", "perks",
                        "Basic member benefits"),
                Map.of("tier", "SILVER", "minPoints", 500, "maxPoints", 1999, "discount", "5%", "perks",
                        "5% off on every booking"),
                Map.of("tier", "GOLD", "minPoints", 2000, "maxPoints", 4999, "discount", "10%", "perks",
                        "10% off + priority support"),
                Map.of("tier", "PLATINUM", "minPoints", 5000, "maxPoints", -1, "discount", "15%", "perks",
                        "15% off + exclusive offers + free upgrade"));
        return ResponseEntity.ok(ApiResponse.success(tiers));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String nextTierInfo(User user) {
        return switch (user.getLoyaltyTier()) {
            case BRONZE -> "SILVER";
            case SILVER -> "GOLD";
            case GOLD -> "PLATINUM";
            case PLATINUM -> "You are at the highest tier!";
        };
    }

    private int pointsToNextTier(User user) {
        return switch (user.getLoyaltyTier()) {
            case BRONZE -> 500 - user.getLoyaltyPoints();
            case SILVER -> 2000 - user.getLoyaltyPoints();
            case GOLD -> 5000 - user.getLoyaltyPoints();
            case PLATINUM -> 0;
        };
    }
}
