package com.hotel.booking.service;

import com.hotel.booking.dto.AuthDTO;

public interface AuthService {
    AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request);
    AuthDTO.AuthResponse login(AuthDTO.LoginRequest request);
    AuthDTO.AuthResponse refreshToken(String refreshToken);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}

