package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.service.HotelSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/hotels/search")
@RequiredArgsConstructor
@Tag(name = "Hotel Search", description = "Advanced hotel search with combined filters")
public class HotelSearchController {

    private final HotelSearchService hotelSearchService;

    /**
     * GET /api/hotels/search/filter
     *
     * Supports any combination of:
     *   ?city=Hyderabad
     *   &minPrice=1000&maxPrice=8000
     *   &amenities=WiFi,Pool
     *   &checkIn=2025-06-10&checkOut=2025-06-15&guests=2
     *   &minRating=4.0
     *   &keyword=grand
     */
    @GetMapping("/filter")
    @Operation(summary = "Advanced hotel + room availability search with all filters combined")
    public ResponseEntity<ApiResponse<List<HotelDTO.HotelResponse>>> filterHotels(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String amenities,      // comma-separated e.g. "WiFi,Pool"
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false)
                @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") int guests
    ) {
        HotelSearchService.SearchCriteria criteria = HotelSearchService.SearchCriteria.builder()
                .keyword(keyword)
                .city(city)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .amenities(amenities)
                .minRating(minRating)
                .checkIn(checkIn)
                .checkOut(checkOut)
                .guests(guests)
                .build();

        List<HotelDTO.HotelResponse> results = hotelSearchService.search(criteria);
        return ResponseEntity.ok(ApiResponse.success(
                results.size() + " hotel(s) found", results));
    }
}
