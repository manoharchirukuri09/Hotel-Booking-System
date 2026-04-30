package com.hotel.booking.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String phone;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.CUSTOMER;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;

    // ── Loyalty Points System ──────────────────────────────────────────────────
    /** Total points earned (1 point per ₹100 spent on confirmed bookings). */
    @Builder.Default
    @Column(nullable = false)
    private int loyaltyPoints = 0;

    /** Tier computed from points: BRONZE < 500 | SILVER < 2000 | GOLD < 5000 | PLATINUM */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoyaltyTier loyaltyTier = LoyaltyTier.BRONZE;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    // ── Password Reset ────────────────────────────────────────────────────────
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    @PrePersist

    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /** Add points after a confirmed booking and recalculate tier. */
    public void addLoyaltyPoints(int points) {
        this.loyaltyPoints += points;
        this.loyaltyTier    = LoyaltyTier.fromPoints(this.loyaltyPoints);
    }

    /** Deduct points when redeemed (100 points = ₹50 discount). */
    public boolean redeemLoyaltyPoints(int points) {
        if (this.loyaltyPoints < points) return false;
        this.loyaltyPoints -= points;
        this.loyaltyTier    = LoyaltyTier.fromPoints(this.loyaltyPoints);
        return true;
    }

    public enum Role { CUSTOMER, ADMIN }

    public enum LoyaltyTier {
        BRONZE, SILVER, GOLD, PLATINUM;

        public static LoyaltyTier fromPoints(int pts) {
            if (pts >= 5000) return PLATINUM;
            if (pts >= 2000) return GOLD;
            if (pts >= 500)  return SILVER;
            return BRONZE;
        }

        /** Discount % on next booking: BRONZE=0, SILVER=5, GOLD=10, PLATINUM=15 */
        public int discountPercent() {
            return switch (this) {
                case SILVER   -> 5;
                case GOLD     -> 10;
                case PLATINUM -> 15;
                default       -> 0;
            };
        }
    }
}
