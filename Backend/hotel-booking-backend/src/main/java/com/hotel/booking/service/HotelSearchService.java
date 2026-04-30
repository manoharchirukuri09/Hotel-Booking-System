package com.hotel.booking.service;

import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Room;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelSearchService {

    private final HotelRepository  hotelRepository;
    private final RoomRepository   roomRepository;
    private final ReviewRepository reviewRepository;

    @Data
    @Builder
    public static class SearchCriteria {
        private String     keyword;
        private String     city;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private String     amenities;   // comma-separated
        private Double     minRating;
        private LocalDate  checkIn;
        private LocalDate  checkOut;
        private int        guests;
    }

    @Transactional(readOnly = true)
    public List<HotelDTO.HotelResponse> search(SearchCriteria c) {
        // 1. Start from all active hotels
        List<Hotel> hotels = hotelRepository.findByActiveTrue();

        // 2. Keyword filter (name, city, state)
        if (c.getKeyword() != null && !c.getKeyword().isBlank()) {
            String kw = c.getKeyword().toLowerCase();
            hotels = hotels.stream()
                    .filter(h -> h.getName().toLowerCase().contains(kw)
                              || h.getCity().toLowerCase().contains(kw)
                              || (h.getState() != null && h.getState().toLowerCase().contains(kw)))
                    .collect(Collectors.toList());
        }

        // 3. City exact filter
        if (c.getCity() != null && !c.getCity().isBlank()) {
            String ct = c.getCity().toLowerCase();
            hotels = hotels.stream()
                    .filter(h -> h.getCity().toLowerCase().equalsIgnoreCase(ct))
                    .collect(Collectors.toList());
        }

        // 4. Minimum star rating
        if (c.getMinRating() != null) {
            hotels = hotels.stream()
                    .filter(h -> h.getStarRating() != null && h.getStarRating() >= c.getMinRating())
                    .collect(Collectors.toList());
        }

        // 5. Amenities filter — hotel must contain ALL requested amenities
        if (c.getAmenities() != null && !c.getAmenities().isBlank()) {
            List<String> required = Arrays.stream(c.getAmenities().split(","))
                    .map(String::trim).map(String::toLowerCase)
                    .filter(s -> !s.isEmpty())
                    .toList();
            hotels = hotels.stream()
                    .filter(h -> {
                        if (h.getAmenities() == null) return false;
                        String hotelAmenities = h.getAmenities().toLowerCase();
                        return required.stream().allMatch(hotelAmenities::contains);
                    })
                    .collect(Collectors.toList());
        }

        // 6. Price range + availability filter
        // If dates provided: use availability query per hotel
        // If only price: filter rooms in memory
        boolean datesProvided = c.getCheckIn() != null && c.getCheckOut() != null;

        // Filter hotels that have at least one room matching price range + availability
        hotels = hotels.stream().filter(hotel -> {
            List<Room> candidateRooms;
            if (datesProvided) {
                candidateRooms = roomRepository.findAvailableRoomsForGuests(
                        hotel.getId(), c.getCheckIn(), c.getCheckOut(), c.getGuests());
            } else {
                candidateRooms = roomRepository.findByHotelIdAndAvailableTrue(hotel.getId());
            }

            // Price range filter on rooms
            if (c.getMinPrice() != null) {
                candidateRooms = candidateRooms.stream()
                        .filter(r -> r.getPricePerNight().compareTo(c.getMinPrice()) >= 0)
                        .collect(Collectors.toList());
            }
            if (c.getMaxPrice() != null) {
                candidateRooms = candidateRooms.stream()
                        .filter(r -> r.getPricePerNight().compareTo(c.getMaxPrice()) <= 0)
                        .collect(Collectors.toList());
            }

            return !candidateRooms.isEmpty();
        }).collect(Collectors.toList());

        // 7. Map to response DTOs
        return hotels.stream()
                .map(h -> buildHotelResponse(h, c))
                .collect(Collectors.toList());
    }

    private HotelDTO.HotelResponse buildHotelResponse(Hotel hotel, SearchCriteria c) {
        boolean datesProvided = c.getCheckIn() != null && c.getCheckOut() != null;
        List<Room> rooms = datesProvided
                ? roomRepository.findAvailableRoomsForGuests(
                        hotel.getId(), c.getCheckIn(), c.getCheckOut(), c.getGuests())
                : roomRepository.findByHotelId(hotel.getId());

        long availableRooms = roomRepository.findByHotelIdAndAvailableTrue(hotel.getId()).size();
        Double avgRating = reviewRepository.getAverageRatingByHotelId(hotel.getId());

        List<String> amenitiesList = hotel.getAmenities() != null
                ? Arrays.asList(hotel.getAmenities().split(","))
                : List.of();

        return HotelDTO.HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .city(hotel.getCity())
                .address(hotel.getAddress())
                .state(hotel.getState())
                .country(hotel.getCountry())
                .description(hotel.getDescription())
                .starRating(hotel.getStarRating())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .imageUrl(hotel.getImageUrl())
                .amenities(amenitiesList)
                .contactEmail(hotel.getContactEmail())
                .contactPhone(hotel.getContactPhone())
                .active(hotel.isActive())
                .totalRooms(rooms.size())
                .availableRooms((int) availableRooms)
                .build();
    }
}
