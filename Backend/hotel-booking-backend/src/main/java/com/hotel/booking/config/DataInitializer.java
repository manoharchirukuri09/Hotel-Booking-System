package com.hotel.booking.config;

import com.hotel.booking.model.*;
import com.hotel.booking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Seeds the database with demo data on first startup.
 * Skips seeding if data already exists.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final UserRepository    userRepo;
    private final HotelRepository   hotelRepo;
    private final RoomRepository    roomRepo;
    private final PromoRepository   promoRepo;
    private final PasswordEncoder   passwordEncoder;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            if (userRepo.count() > 0) {
                log.info("Database already has data — skipping seed.");
                return;
            }

            log.info("Seeding demo data...");

            // ── Users ──────────────────────────────────────────────────────────
            User admin = userRepo.save(User.builder()
                .fullName("admin")
                .email("admin@gmail.com")
                .password(passwordEncoder.encode("admin@1234"))
                .phone("9000000001")
                .role(User.Role.ADMIN)
                .enabled(true)
                .loyaltyPoints(0)
                .loyaltyTier(User.LoyaltyTier.BRONZE)
                .build());

            User customer = userRepo.save(User.builder()
                .fullName("Ravi Kumar")
                .email("ravi@test.com")
                .password(passwordEncoder.encode("Test@1234"))
                .phone("9876543210")
                .role(User.Role.CUSTOMER)
                .enabled(true)
                .loyaltyPoints(650)
                .loyaltyTier(User.LoyaltyTier.SILVER)
                .build());

            log.info("Created users: admin@gmail.com / admin@1234  |  ravi@test.com / Test@1234");

            // ── Hotels ─────────────────────────────────────────────────────────
            Hotel h1 = hotelRepo.save(Hotel.builder()
                .name("Grand Hyatt Hyderabad")
                .city("Hyderabad").state("Telangana").country("India")
                .address("Road No.2, Banjara Hills, Hyderabad")
                .description("Luxury 5-star hotel in the heart of Hyderabad with world-class amenities.")
                .starRating(5.0)
                .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800")
                .amenities("WiFi,Pool,Gym,Spa,Restaurant,Parking,Bar,Conference Room")
                .contactEmail("info@grandhyatt-hyd.com")
                .contactPhone("040-66660101")
                .active(true).build());

            Hotel h2 = hotelRepo.save(Hotel.builder()
                .name("The Leela Palace Bangalore")
                .city("Bangalore").state("Karnataka").country("India")
                .address("23 HAL Airport Road, Bangalore")
                .description("Iconic palace hotel offering royal hospitality and elegant rooms.")
                .starRating(5.0)
                .imageUrl("https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800")
                .amenities("WiFi,Pool,Gym,Spa,Restaurant,Parking,Butler Service,Helipad")
                .contactEmail("reservations@theleela.com")
                .contactPhone("080-25211234")
                .active(true).build());

            Hotel h3 = hotelRepo.save(Hotel.builder()
                .name("Taj Mahal Palace Mumbai")
                .city("Mumbai").state("Maharashtra").country("India")
                .address("Apollo Bunder, Colaba, Mumbai")
                .description("Heritage landmark hotel with stunning views of the Gateway of India.")
                .starRating(5.0)
                .imageUrl("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800")
                .amenities("WiFi,Pool,Gym,Spa,Restaurant,Parking,Heritage Tour,Sea View")
                .contactEmail("tmhm.reservations@tajhotels.com")
                .contactPhone("022-66651234")
                .active(true).build());

            Hotel h4 = hotelRepo.save(Hotel.builder()
                .name("ITC Maurya Delhi")
                .city("Delhi").state("Delhi").country("India")
                .address("Sardar Patel Marg, Diplomatic Enclave, New Delhi")
                .description("Premium hotel in the diplomatic hub of New Delhi, favoured by world leaders.")
                .starRating(5.0)
                .imageUrl("https://images.unsplash.com/photo-1618245318763-453825cd2f9a?w=800")
                .amenities("WiFi,Pool,Gym,Spa,Restaurant,Parking,Business Center")
                .contactEmail("itcmaurya@itchotels.in")
                .contactPhone("011-23011234")
                .active(true).build());

            Hotel h5 = hotelRepo.save(Hotel.builder()
                .name("Goa Marriott Resort")
                .city("Goa").state("Goa").country("India")
                .address("Miramar Beach, Panaji, Goa")
                .description("Beachfront resort with stunning views and vibrant Goan culture.")
                .starRating(4.0)
                .imageUrl("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800")
                .amenities("WiFi,Pool,Beach Access,Gym,Spa,Restaurant,Water Sports,Kids Club")
                .contactEmail("mhrs.goixr.reservations@marriott.com")
                .contactPhone("0832-2463333")
                .active(true).build());

            log.info("Created 5 hotels");

            // ── Rooms ──────────────────────────────────────────────────────────
            // Hyderabad rooms
            roomRepo.save(makeRoom(h1,"101",Room.RoomType.DELUXE,  new BigDecimal("5500"),2,"Elegant deluxe room with city view","AC,TV,WiFi,Mini-bar,King Bed",true));
            roomRepo.save(makeRoom(h1,"201",Room.RoomType.SUITE,   new BigDecimal("9500"),3,"Spacious suite with private lounge","AC,TV,WiFi,Mini-bar,Jacuzzi,Butler",true));
            roomRepo.save(makeRoom(h1,"301",Room.RoomType.DOUBLE,  new BigDecimal("3800"),2,"Comfortable double room","AC,TV,WiFi,Twin Beds",true));
            roomRepo.save(makeRoom(h1,"401",Room.RoomType.PENTHOUSE,new BigDecimal("22000"),4,"Penthouse with panoramic city views","AC,TV,WiFi,Private Pool,Kitchen,Jacuzzi",true));
            roomRepo.save(makeRoom(h1,"501",Room.RoomType.SINGLE,  new BigDecimal("2800"),1,"Cosy single room for business travellers","AC,TV,WiFi,Work Desk",true));

            // Bangalore rooms
            roomRepo.save(makeRoom(h2,"101",Room.RoomType.DELUXE,  new BigDecimal("7200"),2,"Royal deluxe room with palace views","AC,TV,WiFi,King Bed,Marble Bath",true));
            roomRepo.save(makeRoom(h2,"201",Room.RoomType.SUITE,   new BigDecimal("14000"),3,"Grand suite with butler service","AC,TV,WiFi,Butler,Jacuzzi,Living Room",true));
            roomRepo.save(makeRoom(h2,"301",Room.RoomType.TWIN,    new BigDecimal("5500"),2,"Twin room ideal for colleagues","AC,TV,WiFi,Twin Beds",true));

            // Mumbai rooms
            roomRepo.save(makeRoom(h3,"101",Room.RoomType.DELUXE,  new BigDecimal("11000"),2,"Heritage deluxe with Gateway view","AC,TV,WiFi,Sea View,King Bed",true));
            roomRepo.save(makeRoom(h3,"201",Room.RoomType.SUITE,   new BigDecimal("18000"),3,"Presidential suite with sea terrace","AC,TV,WiFi,Terrace,Jacuzzi,Butler",true));
            roomRepo.save(makeRoom(h3,"301",Room.RoomType.DOUBLE,  new BigDecimal("8500"),2,"Classic double room","AC,TV,WiFi,City View",true));

            // Delhi rooms
            roomRepo.save(makeRoom(h4,"101",Room.RoomType.DELUXE,  new BigDecimal("8800"),2,"Executive deluxe room","AC,TV,WiFi,King Bed,Work Desk",true));
            roomRepo.save(makeRoom(h4,"201",Room.RoomType.SUITE,   new BigDecimal("16000"),3,"Luxury suite with dining area","AC,TV,WiFi,Dining,Jacuzzi,Butler",true));

            // Goa rooms
            roomRepo.save(makeRoom(h5,"101",Room.RoomType.DELUXE,  new BigDecimal("6500"),2,"Beachfront deluxe room","AC,TV,WiFi,Sea View,Balcony,King Bed",true));
            roomRepo.save(makeRoom(h5,"201",Room.RoomType.SUITE,   new BigDecimal("12000"),4,"Family suite with beach access","AC,TV,WiFi,Sea View,Kitchen,Bunk Beds",true));
            roomRepo.save(makeRoom(h5,"301",Room.RoomType.DOUBLE,  new BigDecimal("4800"),2,"Garden-view double room","AC,TV,WiFi,Garden View",true));

            log.info("Created rooms for all hotels");

            // ── Promos ─────────────────────────────────────────────────────────
            promoRepo.save(Promo.builder()
                .code("WELCOME20")
                .description("20% off for new customers on first booking")
                .discountType(Promo.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("20"))
                .minimumBookingAmount(new BigDecimal("3000"))
                .maximumDiscountCap(new BigDecimal("5000"))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusYears(1))
                .maxUsageCount(1000)
                .usedCount(0)
                .active(true).build());

            promoRepo.save(Promo.builder()
                .code("SUMMER25")
                .description("Summer special — 25% off on all bookings")
                .discountType(Promo.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("25"))
                .minimumBookingAmount(new BigDecimal("5000"))
                .maximumDiscountCap(new BigDecimal("8000"))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusMonths(3))
                .maxUsageCount(500)
                .usedCount(0)
                .active(true).build());

            promoRepo.save(Promo.builder()
                .code("FLAT1000")
                .description("Flat ₹1000 off on bookings above ₹8000")
                .discountType(Promo.DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("1000"))
                .minimumBookingAmount(new BigDecimal("8000"))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusMonths(6))
                .maxUsageCount(200)
                .usedCount(0)
                .active(true).build());

            promoRepo.save(Promo.builder()
                .code("WEEKEND15")
                .description("15% off for weekend getaways")
                .discountType(Promo.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("15"))
                .minimumBookingAmount(new BigDecimal("4000"))
                .maximumDiscountCap(new BigDecimal("3000"))
                .validFrom(LocalDate.now())
                .validTo(LocalDate.now().plusMonths(4))
                .maxUsageCount(300)
                .usedCount(0)
                .active(true).build());

            log.info("Created 4 promo codes: WELCOME20, SUMMER25, FLAT1000, WEEKEND15");
            log.info("=== SEED COMPLETE === Visit http://localhost:3000 to start using the app.");
        };
    }

    private Room makeRoom(Hotel hotel, String number, Room.RoomType type,
                          BigDecimal price, int capacity, String desc,
                          String facilities, boolean available) {
        return Room.builder()
                .hotel(hotel)
                .roomNumber(number)
                .roomType(type)
                .pricePerNight(price)
                .maxCapacity(capacity)
                .description(desc)
                .facilities(facilities)
                .available(available)
                .build();
    }
}
