package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.ReviewDTO;
import com.hotel.booking.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Hotel reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    // GET /api/reviews/hotel/{hotelId} — public
    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "Get all reviews for a hotel (public)")
    public ResponseEntity<ApiResponse<List<ReviewDTO.ReviewResponse>>> getHotelReviews(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsByHotel(hotelId)));
    }

    // GET /api/reviews/my — authenticated
    @GetMapping("/my")
    @Operation(summary = "Get my submitted reviews",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<ReviewDTO.ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.getMyReviews(userDetails.getUsername())));
    }

    // POST /api/reviews — authenticated (only for hotels user stayed at)
    @PostMapping
    @Operation(summary = "Submit a review for a hotel you stayed at",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<ReviewDTO.ReviewResponse>> addReview(
            @Valid @RequestBody ReviewDTO.ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        ReviewDTO.ReviewResponse response =
                reviewService.addReview(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", response));
    }

    // DELETE /api/reviews/{id} — authenticated (own reviews only)
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete your own review",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }
}
