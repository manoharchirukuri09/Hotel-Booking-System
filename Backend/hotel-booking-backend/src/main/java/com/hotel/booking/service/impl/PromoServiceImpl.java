package com.hotel.booking.service.impl;

import com.hotel.booking.dto.PromoDTO;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.model.Promo;
import com.hotel.booking.repository.PromoRepository;
import com.hotel.booking.service.PromoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromoServiceImpl implements PromoService {

    private final PromoRepository promoRepository;

    @Override
    @Transactional
    public PromoDTO.PromoResponse createPromo(PromoDTO.PromoRequest request) {
        Promo promo = Promo.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumBookingAmount(request.getMinimumBookingAmount())
                .maximumDiscountCap(request.getMaximumDiscountCap())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .maxUsageCount(request.getMaxUsageCount())
                .active(true)
                .build();

        return mapToResponse(promoRepository.save(promo));
    }

    @Override
    @Transactional(readOnly = true)
    public PromoDTO.PromoValidateResponse validatePromo(String code, BigDecimal bookingAmount) {
        LocalDate today = LocalDate.now();
        Optional<Promo> promoOpt =
                promoRepository.findByCodeIgnoreCaseAndActiveTrueAndValidFromLessThanEqualAndValidToGreaterThanEqual(
                        code, today, today);

        if (promoOpt.isEmpty()) {
            return PromoDTO.PromoValidateResponse.builder()
                    .valid(false)
                    .message("Promo code is invalid or expired")
                    .build();
        }

        Promo promo = promoOpt.get();

        // Check minimum booking amount
        if (promo.getMinimumBookingAmount() != null &&
                bookingAmount.compareTo(promo.getMinimumBookingAmount()) < 0) {
            return PromoDTO.PromoValidateResponse.builder()
                    .valid(false)
                    .message("Minimum booking amount of ₹" + promo.getMinimumBookingAmount() + " required")
                    .build();
        }

        // Check usage limit
        if (promo.getMaxUsageCount() != null && promo.getUsedCount() >= promo.getMaxUsageCount()) {
            return PromoDTO.PromoValidateResponse.builder()
                    .valid(false)
                    .message("Promo code usage limit reached")
                    .build();
        }

        // Calculate discount
        BigDecimal discountAmount;
        if (promo.getDiscountType() == Promo.DiscountType.PERCENTAGE) {
            discountAmount = bookingAmount
                    .multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // Apply cap if set
            if (promo.getMaximumDiscountCap() != null &&
                    discountAmount.compareTo(promo.getMaximumDiscountCap()) > 0) {
                discountAmount = promo.getMaximumDiscountCap();
            }
        } else {
            discountAmount = promo.getDiscountValue().min(bookingAmount);
        }

        BigDecimal finalAmount = bookingAmount.subtract(discountAmount);

        return PromoDTO.PromoValidateResponse.builder()
                .valid(true)
                .code(promo.getCode())
                .discountType(promo.getDiscountType())
                .discountValue(promo.getDiscountValue())
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .message("Promo applied successfully!")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PromoDTO.PromoResponse> getAllPromos() {
        return promoRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PromoDTO.PromoResponse togglePromo(Long id) {
        Promo promo = promoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promo not found: " + id));
        promo.setActive(!promo.isActive());
        return mapToResponse(promoRepository.save(promo));
    }

    private PromoDTO.PromoResponse mapToResponse(Promo p) {
        return PromoDTO.PromoResponse.builder()
                .id(p.getId())
                .code(p.getCode())
                .description(p.getDescription())
                .discountType(p.getDiscountType())
                .discountValue(p.getDiscountValue())
                .minimumBookingAmount(p.getMinimumBookingAmount())
                .maximumDiscountCap(p.getMaximumDiscountCap())
                .validFrom(p.getValidFrom())
                .validTo(p.getValidTo())
                .maxUsageCount(p.getMaxUsageCount())
                .usedCount(p.getUsedCount())
                .active(p.isActive())
                .build();
    }
}
