package com.hotel.booking.repository;

import com.hotel.booking.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCityIgnoreCaseAndActiveTrue(String city);

    List<Hotel> findByActiveTrue();

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND " +
           "(LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.state) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Hotel> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND h.starRating >= :minRating")
    List<Hotel> findByMinStarRating(@Param("minRating") Double minRating);

    @Query("SELECT h FROM Hotel h WHERE h.active = true AND LOWER(h.amenities) LIKE LOWER(CONCAT('%', :amenity, '%'))")
    List<Hotel> findByAmenity(@Param("amenity") String amenity);
}
