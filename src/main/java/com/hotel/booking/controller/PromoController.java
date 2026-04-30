package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.PromoDTO;
import com.hotel.booking.service.PromoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/promos")
@RequiredArgsConstructor
@Tag(name = "Promotions", description = "Discount codes and loyalty offers")
public class PromoController {

    private final PromoService promoService;

    // POST /api/promos/validate  — any logged-in user can validate a promo
    @PostMapping("/validate")
    @Operation(summary = "Validate a promo code against a booking amount",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<PromoDTO.PromoValidateResponse>> validatePromo(
            @Valid @RequestBody PromoDTO.PromoValidateRequest request) {
        PromoDTO.PromoValidateResponse response =
                promoService.validatePromo(request.getCode(), request.getBookingAmount());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // POST /api/promos  — Admin creates a new promo
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new promo code [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<PromoDTO.PromoResponse>> createPromo(
            @Valid @RequestBody PromoDTO.PromoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Promo created", promoService.createPromo(request)));
    }

    // GET /api/promos  — Admin views all promos
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all promo codes [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<List<PromoDTO.PromoResponse>>> getAllPromos() {
        return ResponseEntity.ok(ApiResponse.success(promoService.getAllPromos()));
    }

    // PUT /api/promos/{id}/toggle  — Admin activates/deactivates a promo
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle promo active status [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<PromoDTO.PromoResponse>> togglePromo(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Promo status updated",
                promoService.togglePromo(id)));
    }
}
