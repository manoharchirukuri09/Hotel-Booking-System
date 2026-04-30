package com.hotel.booking.repository;

import com.hotel.booking.model.Room;
import com.hotel.booking.model.Room.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByHotelIdAndAvailableTrue(Long hotelId);

    List<Room> findByHotelIdAndRoomType(Long hotelId, RoomType roomType);

    List<Room> findByPricePerNightBetweenAndAvailableTrue(BigDecimal min, BigDecimal max);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.available = true " +
           "AND r.id NOT IN (" +
           "  SELECT b.room.id FROM Booking b WHERE b.hotel.id = :hotelId " +
           "  AND b.status NOT IN ('CANCELLED') " +
           "  AND NOT (b.checkOutDate <= :checkIn OR b.checkInDate >= :checkOut)" +
           ")")
    List<Room> findAvailableRooms(
        @Param("hotelId") Long hotelId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.available = true " +
           "AND r.maxCapacity >= :guests " +
           "AND r.id NOT IN (" +
           "  SELECT b.room.id FROM Booking b WHERE b.hotel.id = :hotelId " +
           "  AND b.status NOT IN ('CANCELLED') " +
           "  AND NOT (b.checkOutDate <= :checkIn OR b.checkInDate >= :checkOut)" +
           ")")
    List<Room> findAvailableRoomsForGuests(
        @Param("hotelId") Long hotelId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("guests") int guests
    );
}
