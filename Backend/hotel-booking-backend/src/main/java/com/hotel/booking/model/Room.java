package com.hotel.booking.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType roomType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private int maxCapacity;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Comma-separated: "AC,TV,WiFi,Mini-bar"
    @Column(columnDefinition = "TEXT")
    private String facilities;

    private String imageUrl;

    @Builder.Default
    @Column(nullable = false)
    private boolean available = true;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    public enum RoomType {
        SINGLE, DOUBLE, TWIN, SUITE, DELUXE, PENTHOUSE
    }
}
