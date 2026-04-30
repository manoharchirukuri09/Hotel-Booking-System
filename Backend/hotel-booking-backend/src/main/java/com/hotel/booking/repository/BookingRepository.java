package com.hotel.booking.repository;

import com.hotel.booking.model.Booking;
import com.hotel.booking.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByReservationNumber(String reservationNumber);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByHotelIdOrderByCreatedAtDesc(Long hotelId);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findBookingHistoryByUser(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Booking b " +
           "WHERE b.room.id = :roomId AND b.status NOT IN ('CANCELLED') " +
           "AND NOT (b.checkOutDate <= :checkIn OR b.checkInDate >= :checkOut)")
    boolean isRoomBooked(
        @Param("roomId") Long roomId,
        @Param("checkIn") java.time.LocalDate checkIn,
        @Param("checkOut") java.time.LocalDate checkOut
    );
}
