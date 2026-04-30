package com.hotel.booking.service;

import com.hotel.booking.dto.PromoDTO;
import java.math.BigDecimal;
import java.util.List;

public interface PromoService {
    PromoDTO.PromoResponse createPromo(PromoDTO.PromoRequest request);
    PromoDTO.PromoValidateResponse validatePromo(String code, BigDecimal bookingAmount);
    List<PromoDTO.PromoResponse> getAllPromos();
    PromoDTO.PromoResponse togglePromo(Long id);
}
