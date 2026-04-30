package com.hotel.booking.service;

import com.hotel.booking.dto.RoomDTO;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    RoomDTO.RoomResponse createRoom(RoomDTO.RoomRequest request);
    RoomDTO.RoomResponse getRoomById(Long id);
    List<RoomDTO.RoomResponse> getRoomsByHotel(Long hotelId);
    List<RoomDTO.RoomResponse> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut, int guests);
    RoomDTO.RoomResponse updateRoom(Long id, RoomDTO.RoomRequest request);
    void deleteRoom(Long id);
}
