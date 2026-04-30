package com.hotel.booking.repository;

import com.hotel.booking.model.Promo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PromoRepository extends JpaRepository<Promo, Long> {

    Optional<Promo> findByCodeIgnoreCase(String code);

    // Find valid, active promo
    Optional<Promo> findByCodeIgnoreCaseAndActiveTrueAndValidFromLessThanEqualAndValidToGreaterThanEqual(
        String code, LocalDate from, LocalDate to
    );
}
