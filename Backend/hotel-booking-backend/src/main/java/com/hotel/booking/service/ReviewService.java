package com.hotel.booking.service;

import com.hotel.booking.dto.ReviewDTO;
import java.util.List;

public interface ReviewService {
    ReviewDTO.ReviewResponse addReview(ReviewDTO.ReviewRequest request, String userEmail);
    List<ReviewDTO.ReviewResponse> getReviewsByHotel(Long hotelId);
    List<ReviewDTO.ReviewResponse> getMyReviews(String userEmail);
    void deleteReview(Long reviewId, String userEmail);
}
