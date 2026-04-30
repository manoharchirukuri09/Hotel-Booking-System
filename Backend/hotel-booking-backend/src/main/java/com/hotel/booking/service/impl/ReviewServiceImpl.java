package com.hotel.booking.service.impl;

import com.hotel.booking.dto.ReviewDTO;
import com.hotel.booking.exception.BadRequestException;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Review;
import com.hotel.booking.model.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository  reviewRepository;
    private final UserRepository    userRepository;
    private final HotelRepository   hotelRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public ReviewDTO.ReviewResponse addReview(ReviewDTO.ReviewRequest request, String userEmail) {
        User  user  = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + request.getHotelId()));

        // A user can only review a hotel they have stayed at (completed booking)
        boolean hasStayed = bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .anyMatch(b -> b.getHotel().getId().equals(hotel.getId())
                        && (b.getStatus().name().equals("CONFIRMED")
                            || b.getStatus().name().equals("COMPLETED")));

        if (!hasStayed)
            throw new BadRequestException("You can only review hotels you have stayed at.");

        if (reviewRepository.existsByHotelIdAndUserId(hotel.getId(), user.getId()))
            throw new BadRequestException("You have already reviewed this hotel.");

        Review review = Review.builder()
                .hotel(hotel)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        log.info("Review added by {} for hotel {}", userEmail, hotel.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO.ReviewResponse> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDTO.ReviewResponse> getMyReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reviewRepository.findByUserId(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        if (!review.getUser().getEmail().equals(userEmail))
            throw new BadRequestException("You can only delete your own reviews.");
        reviewRepository.delete(review);
    }

    private ReviewDTO.ReviewResponse mapToResponse(Review r) {
        return ReviewDTO.ReviewResponse.builder()
                .id(r.getId())
                .hotelId(r.getHotel().getId())
                .hotelName(r.getHotel().getName())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
