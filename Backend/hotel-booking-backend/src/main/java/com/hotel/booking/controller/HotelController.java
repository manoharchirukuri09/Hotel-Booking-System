package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.service.HotelService;
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
@RequestMapping("/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotels", description = "Browse, search and manage hotels")
public class HotelController {

    private final HotelService hotelService;

    // ── Public endpoints ───────────────────────────────────────────────────────

    // GET /api/hotels
    @GetMapping
    @Operation(summary = "Get all active hotels")
    public ResponseEntity<ApiResponse<List<HotelDTO.HotelResponse>>> getAllHotels() {
        return ResponseEntity.ok(ApiResponse.success(hotelService.getAllHotels()));
    }

    // GET /api/hotels/{id}
    @GetMapping("/{id}")
    @Operation(summary = "Get hotel by ID")
    public ResponseEntity<ApiResponse<HotelDTO.HotelResponse>> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.getHotelById(id)));
    }

    // GET /api/hotels/search?keyword=mumbai
    @GetMapping("/search")
    @Operation(summary = "Search hotels by city, name or state")
    public ResponseEntity<ApiResponse<List<HotelDTO.HotelResponse>>> searchHotels(
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.searchHotels(keyword)));
    }

    // GET /api/hotels/city/{city}
    @GetMapping("/city/{city}")
    @Operation(summary = "Get hotels by city")
    public ResponseEntity<ApiResponse<List<HotelDTO.HotelResponse>>> getByCity(
            @PathVariable String city) {
        return ResponseEntity.ok(ApiResponse.success(hotelService.getHotelsByCity(city)));
    }

    // ── Admin-only endpoints ───────────────────────────────────────────────────

    // POST /api/hotels
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new hotel [ADMIN]", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<HotelDTO.HotelResponse>> createHotel(
            @Valid @RequestBody HotelDTO.HotelRequest request) {
        HotelDTO.HotelResponse response = hotelService.createHotel(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Hotel created successfully", response));
    }

    // PUT /api/hotels/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update hotel [ADMIN]", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<HotelDTO.HotelResponse>> updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody HotelDTO.HotelRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Hotel updated successfully", hotelService.updateHotel(id, request)));
    }

    // DELETE /api/hotels/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete hotel [ADMIN]", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.ok(ApiResponse.success("Hotel deactivated successfully", null));
    }
}
