package com.hotel.booking.service;

import com.hotel.booking.dto.HotelDTO;
import java.util.List;

public interface HotelService {
    HotelDTO.HotelResponse createHotel(HotelDTO.HotelRequest request);
    HotelDTO.HotelResponse getHotelById(Long id);
    List<HotelDTO.HotelResponse> getAllHotels();
    List<HotelDTO.HotelResponse> searchHotels(String keyword);
    List<HotelDTO.HotelResponse> getHotelsByCity(String city);
    HotelDTO.HotelResponse updateHotel(Long id, HotelDTO.HotelRequest request);
    void deleteHotel(Long id);
}
