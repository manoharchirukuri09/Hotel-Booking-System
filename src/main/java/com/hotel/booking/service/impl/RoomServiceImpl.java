package com.hotel.booking.service.impl;

import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.exception.ResourceNotFoundException;
import com.hotel.booking.model.Hotel;
import com.hotel.booking.model.Room;
import com.hotel.booking.repository.HotelRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    @Override
    @Transactional
    public RoomDTO.RoomResponse createRoom(RoomDTO.RoomRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found: " + request.getHotelId()));

        Room room = Room.builder()
                .hotel(hotel)
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .pricePerNight(request.getPricePerNight())
                .maxCapacity(request.getMaxCapacity())
                .description(request.getDescription())
                .facilities(request.getFacilities())
                .imageUrl(request.getImageUrl())
                .available(true)
                .build();

        Room saved = roomRepository.save(room);
        log.info("Room created: {} for hotel {}", saved.getRoomNumber(), hotel.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomDTO.RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
        return mapToResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO.RoomResponse> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomDTO.RoomResponse> getAvailableRooms(Long hotelId, LocalDate checkIn,
                                                         LocalDate checkOut, int guests) {
        return roomRepository.findAvailableRoomsForGuests(hotelId, checkIn, checkOut, guests)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomDTO.RoomResponse updateRoom(Long id, RoomDTO.RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));

        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setPricePerNight(request.getPricePerNight());
        room.setMaxCapacity(request.getMaxCapacity());
        room.setDescription(request.getDescription());
        room.setFacilities(request.getFacilities());
        room.setImageUrl(request.getImageUrl());

        return mapToResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
        room.setAvailable(false); // Soft delete
        roomRepository.save(room);
    }

    private RoomDTO.RoomResponse mapToResponse(Room room) {
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
