package com.hotel.booking.service.impl;

import com.hotel.booking.dto.BookingDTO;
import com.hotel.booking.exception.BadRequestException;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.model.*;
import com.hotel.booking.repository.*;
import com.hotel.booking.service.BookingService;
import com.hotel.booking.service.EmailService;
import com.hotel.booking.service.PromoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository    userRepository;
    private final RoomRepository    roomRepository;
    private final HotelRepository   hotelRepository;
    private final PromoRepository   promoRepository;
    private final EmailService      emailService;
    private final PromoService      promoService;

    /** Points earned per ₹100 spent */
    private static final int POINTS_PER_100_RUPEES = 1;
    /** Points needed to get ₹50 discount */
    private static final int POINTS_PER_REDEEM_UNIT = 100;
    private static final int RUPEES_PER_REDEEM_UNIT = 50;

    @Override
    @Transactional
    public BookingDTO.BookingResponse createBooking(BookingDTO.BookingRequest request,
                                                    String userEmail) {
        // 1. Load entities
        User  user  = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + request.getHotelId()));
        Room  room  = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + request.getRoomId()));

        // 2. Validate dates
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate()))
            throw new BadRequestException("Check-out date must be after check-in date");

        // 3. Check room availability
        if (bookingRepository.isRoomBooked(room.getId(), request.getCheckInDate(), request.getCheckOutDate()))
            throw new BadRequestException("Room is not available for the selected dates");

        // 4. Check guest capacity
        if (request.getNumberOfGuests() > room.getMaxCapacity())
            throw new BadRequestException("Room capacity exceeded. Max: " + room.getMaxCapacity());

        // 5. Base amount
        long       nights     = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal baseAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        // 6. Promo discount
        BigDecimal promoDiscount  = BigDecimal.ZERO;
        String     appliedPromo   = null;
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            var promoResult = promoService.validatePromo(request.getPromoCode(), baseAmount);
            if (promoResult.isValid()) {
                promoDiscount = promoResult.getDiscountAmount();
                appliedPromo  = request.getPromoCode().toUpperCase();
                promoRepository.findByCodeIgnoreCase(request.getPromoCode())
                        .ifPresent(p -> { p.setUsedCount(p.getUsedCount() + 1); promoRepository.save(p); });
            }
        }

        // 7. Loyalty tier discount (automatic, based on user tier)
        BigDecimal loyaltyDiscount = BigDecimal.ZERO;
        int        tierPct         = user.getLoyaltyTier().discountPercent();
        if (tierPct > 0) {
            loyaltyDiscount = baseAmount
                    .subtract(promoDiscount)
                    .multiply(BigDecimal.valueOf(tierPct))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        // 8. Loyalty points redemption (optional — user requests to redeem)
        BigDecimal pointsDiscount = BigDecimal.ZERO;
        if (request.getRedeemLoyaltyPoints() != null && request.getRedeemLoyaltyPoints() > 0) {
            int units    = request.getRedeemLoyaltyPoints() / POINTS_PER_REDEEM_UNIT;
            int maxUnits = user.getLoyaltyPoints() / POINTS_PER_REDEEM_UNIT;
            units = Math.min(units, maxUnits);
            if (units > 0) {
                int pointsToUse = units * POINTS_PER_REDEEM_UNIT;
                pointsDiscount  = BigDecimal.valueOf((long) units * RUPEES_PER_REDEEM_UNIT);
                user.redeemLoyaltyPoints(pointsToUse);
                log.info("User {} redeemed {} points for ₹{} discount", userEmail, pointsToUse, pointsDiscount);
            }
        }

        // 9. Final total
        BigDecimal totalDiscount = promoDiscount.add(loyaltyDiscount).add(pointsDiscount);
        BigDecimal totalAmount   = baseAmount.subtract(totalDiscount).max(BigDecimal.ZERO);

        // 10. Earn loyalty points on this booking (1 pt per ₹100 of final amount paid)
        int pointsEarned = totalAmount.divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN).intValue()
                           * POINTS_PER_100_RUPEES;
        user.addLoyaltyPoints(pointsEarned);
        userRepository.save(user);
        log.info("User {} earned {} loyalty points. New total: {}", userEmail, pointsEarned, user.getLoyaltyPoints());

        // 11. Save booking
        Booking booking = Booking.builder()
                .reservationNumber(generateReservationNumber())
                .user(user).room(room).hotel(hotel)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .totalAmount(totalAmount)
                .discountAmount(totalDiscount)
                .promoCode(appliedPromo)
                .loyaltyDiscountAmount(loyaltyDiscount)
                .loyaltyPointsEarned(pointsEarned)
                .loyaltyPointsRedeemed(request.getRedeemLoyaltyPoints() != null ? request.getRedeemLoyaltyPoints() : 0)
                .specialRequests(request.getSpecialRequests())
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);

        // 12. Email
        try { emailService.sendBookingConfirmation(saved); }
        catch (Exception e) { log.warn("Email send failed: {}", e.getMessage()); }

        return mapToResponse(saved, nights);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDTO.BookingResponse getBookingByReservationNumber(String reservationNumber) {
        Booking b = bookingRepository.findByReservationNumber(reservationNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + reservationNumber));
        return mapToResponse(b, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDTO.BookingResponse getBookingById(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        return mapToResponse(b, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO.BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findBookingHistoryByUser(user.getId()).stream()
                .map(b -> mapToResponse(b, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingDTO.BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> mapToResponse(b, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingDTO.BookingResponse cancelBooking(Long id, String userEmail) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        
        // Force-initialize lazy associations to avoid LazyInitializationException
        User owner = b.getUser();
        if (owner == null) throw new ResourceNotFoundException("Booking owner not found");
        
        if (!owner.getEmail().equals(userEmail))
            throw new BadRequestException("You are not authorized to cancel this booking");
        
        if (b.getStatus() == Booking.BookingStatus.CANCELLED)
            throw new BadRequestException("Booking is already cancelled");
        
        if (b.getStatus() == Booking.BookingStatus.COMPLETED)
            throw new BadRequestException("Completed bookings cannot be cancelled");
        
        // Rule: Can only cancel BEFORE the check-in date
        if (!LocalDate.now().isBefore(b.getCheckInDate()))
            throw new BadRequestException("Cancellations are only allowed before the check-in date.");

        // Refund loyalty points that were earned on this booking (since it's being cancelled)
        try {
            if (b.getLoyaltyPointsEarned() > 0) {
                owner.redeemLoyaltyPoints(Math.min(b.getLoyaltyPointsEarned(), owner.getLoyaltyPoints()));
                userRepository.save(owner);
            }
        } catch (Exception e) {
            log.warn("Failed to refund loyalty points for booking {}: {}", b.getReservationNumber(), e.getMessage());
        }

        b.setStatus(Booking.BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(b);
        
        // Pre-fetch lazy associations before mapping to response (prevents LazyInitException)
        String hotelName = updated.getHotel().getName();
        String roomNumber = updated.getRoom().getRoomNumber();
        log.info("Cancelled booking {} for hotel {} room {}", updated.getReservationNumber(), hotelName, roomNumber);

        // Send Cancellation Email (async — may run after transaction closes)
        try {
            emailService.sendBookingCancellation(updated);
        } catch (Exception e) {
            log.warn("Failed to send cancellation email for booking {}: {}", updated.getReservationNumber(), e.getMessage());
        }

        return mapToResponse(updated, ChronoUnit.DAYS.between(updated.getCheckInDate(), updated.getCheckOutDate()));
    }


    @Override
    @Transactional
    public BookingDTO.BookingResponse confirmBooking(Long id) {
        Booking b = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        b.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking updated = bookingRepository.save(b);
        return mapToResponse(updated, ChronoUnit.DAYS.between(updated.getCheckInDate(), updated.getCheckOutDate()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String generateReservationNumber() {
        return "HB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private BookingDTO.BookingResponse mapToResponse(Booking b, long nights) {
        return BookingDTO.BookingResponse.builder()
                .id(b.getId())
                .reservationNumber(b.getReservationNumber())
                .userId(b.getUser().getId())
                .userFullName(b.getUser().getFullName())
                .userEmail(b.getUser().getEmail())
                .hotelId(b.getHotel().getId())
                .hotelName(b.getHotel().getName())
                .hotelCity(b.getHotel().getCity())
                .roomId(b.getRoom().getId())
                .roomNumber(b.getRoom().getRoomNumber())
                .roomType(b.getRoom().getRoomType().name())
                .checkInDate(b.getCheckInDate())
                .checkOutDate(b.getCheckOutDate())
                .numberOfNights((int) nights)
                .numberOfGuests(b.getNumberOfGuests())
                .pricePerNight(b.getRoom().getPricePerNight())
                .discountAmount(b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO)
                .loyaltyDiscountAmount(b.getLoyaltyDiscountAmount() != null ? b.getLoyaltyDiscountAmount() : BigDecimal.ZERO)
                .loyaltyPointsEarned(b.getLoyaltyPointsEarned())
                .loyaltyPointsRedeemed(b.getLoyaltyPointsRedeemed())
                .totalAmount(b.getTotalAmount())
                .promoCode(b.getPromoCode())
                .status(b.getStatus())
                .specialRequests(b.getSpecialRequests())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
