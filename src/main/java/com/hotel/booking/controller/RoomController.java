package com.hotel.booking.controller;

import com.hotel.booking.dto.ApiResponse;
import com.hotel.booking.dto.RoomDTO;
import com.hotel.booking.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms", description = "Room management and availability search")
public class RoomController {

    private final RoomService roomService;

    // ── Public endpoints ───────────────────────────────────────────────────────

    // GET /api/rooms/{id}
    @GetMapping("/{id}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<ApiResponse<RoomDTO.RoomResponse>> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomById(id)));
    }

    // GET /api/rooms/hotel/{hotelId}
    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "Get all rooms for a hotel")
    public ResponseEntity<ApiResponse<List<RoomDTO.RoomResponse>>> getRoomsByHotel(
            @PathVariable Long hotelId) {
        return ResponseEntity.ok(ApiResponse.success(roomService.getRoomsByHotel(hotelId)));
    }

    // GET /api/rooms/available?hotelId=1&checkIn=2025-06-01&checkOut=2025-06-05&guests=2
    @GetMapping("/available")
    @Operation(summary = "Search available rooms by hotel, dates and guest count")
    public ResponseEntity<ApiResponse<List<RoomDTO.RoomResponse>>> getAvailableRooms(
            @RequestParam Long hotelId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(defaultValue = "1") int guests) {
        return ResponseEntity.ok(ApiResponse.success(
                roomService.getAvailableRooms(hotelId, checkIn, checkOut, guests)));
    }

    // ── Admin-only endpoints ───────────────────────────────────────────────────

    // POST /api/rooms
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new room to a hotel [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<RoomDTO.RoomResponse>> createRoom(
            @Valid @RequestBody RoomDTO.RoomRequest request) {
        RoomDTO.RoomResponse response = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", response));
    }

    // PUT /api/rooms/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update room details [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<RoomDTO.RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomDTO.RoomRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Room updated", roomService.updateRoom(id, request)));
    }

    // DELETE /api/rooms/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft-delete a room [ADMIN]",
               security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deactivated", null));
    }
}
