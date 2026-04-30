package com.hotel.booking.service.impl;

import com.hotel.booking.dto.HotelDTO;
import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Room;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;

    @Override
    @Transactional
    public HotelDTO.HotelResponse createHotel(HotelDTO.HotelRequest request) {
        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .city(request.getCity())
                .address(request.getAddress())
                .state(request.getState())
                .country(request.getCountry())
                .description(request.getDescription())
                .starRating(request.getStarRating())
                .imageUrl(request.getImageUrl())
                .amenities(request.getAmenities())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .active(true)
                .build();

        Hotel saved = hotelRepository.save(hotel);
        log.info("Hotel created: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelDTO.HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO.HotelResponse> getAllHotels() {
        return hotelRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO.HotelResponse> searchHotels(String keyword) {
        return hotelRepository.searchByKeyword(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelDTO.HotelResponse> getHotelsByCity(String city) {
        return hotelRepository.findByCityIgnoreCaseAndActiveTrue(city)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HotelDTO.HotelResponse updateHotel(Long id, HotelDTO.HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));

        hotel.setName(request.getName());
        hotel.setCity(request.getCity());
        hotel.setAddress(request.getAddress());
        hotel.setState(request.getState());
        hotel.setCountry(request.getCountry());
        hotel.setDescription(request.getDescription());
        hotel.setStarRating(request.getStarRating());
        hotel.setImageUrl(request.getImageUrl());
        hotel.setAmenities(request.getAmenities());
        hotel.setContactEmail(request.getContactEmail());
        hotel.setContactPhone(request.getContactPhone());

        Hotel updated = hotelRepository.save(hotel);
        log.info("Hotel updated: {}", updated.getId());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
        hotel.setActive(false); // Soft delete
        hotelRepository.save(hotel);
        log.info("Hotel soft-deleted: {}", id);
    }

    // ── Mapping helper ─────────────────────────────────────────────────────────

    private HotelDTO.HotelResponse mapToResponse(Hotel hotel) {
        List<Room> rooms = roomRepository.findByHotelId(hotel.getId());
        long availableRooms = rooms.stream().filter(Room::isAvailable).count();
        Double avgRating = reviewRepository.getAverageRatingByHotelId(hotel.getId());

        List<String> amenitiesList = hotel.getAmenities() != null
                ? Arrays.asList(hotel.getAmenities().split(","))
                : List.of();

        List<RoomDTO.RoomResponse> roomResponses = rooms.stream()
                .map(this::mapRoomToResponse)
                .collect(Collectors.toList());

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
                .rooms(roomResponses)
                .build();
    }

    private RoomDTO.RoomResponse mapRoomToResponse(Room room) {
        List<String> facilities = room.getFacilities() != null
                ? Arrays.asList(room.getFacilities().split(","))
                : List.of();

        return RoomDTO.RoomResponse.builder()
                .id(room.getId())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .maxCapacity(room.getMaxCapacity())
                .description(room.getDescription())
                .facilities(facilities)
                .imageUrl(room.getImageUrl())
                .available(room.isAvailable())
                .build();
    }
}
