package com.hotel.booking.service;

import com.hotel.booking.model.Booking;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${email.api.key:}")
    private String apiKey;

    @Value("${email.sender.email:manoharchirukuri09@gmail.com}")
    private String senderEmail;

    @Value("${email.sender.name:LuxStay}")
    private String senderName;

    private final ObjectMapper objectMapper;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private void sendEmailViaBrevo(String toEmail, String subject, String htmlContent) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Email API key is not configured. Cannot send email to {} (Subject: {})", toEmail, subject);
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("name", senderName, "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "htmlContent", htmlContent
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("accept", "application/json")
                    .header("api-key", apiKey)
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent successfully to {}", toEmail);
            } else {
                log.error("Failed to send email. Status: {}, Response: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Exception while sending email: {}", e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmed - " + booking.getReservationNumber();
        String html = buildEmailHtml(booking);
        sendEmailViaBrevo(booking.getUser().getEmail(), subject, html);
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        String subject = "Booking Cancelled - " + booking.getReservationNumber();
        String html = buildCancellationEmailHtml(booking);
        sendEmailViaBrevo(booking.getUser().getEmail(), subject, html);
    }

    @Async
    public void sendWelcomeEmail(com.hotel.booking.model.User user) {
        String subject = "Welcome to LuxStay - Registration Successful";
        String html = buildWelcomeEmailHtml(user);
        sendEmailViaBrevo(user.getEmail(), subject, html);
    }

    @Async
    public void sendPasswordResetEmail(com.hotel.booking.model.User user, String resetUrl) {
        String subject = "Reset Your LuxStay Password";
        String html = buildResetEmailHtml(user, resetUrl);
        sendEmailViaBrevo(user.getEmail(), subject, html);
    }

    private String buildResetEmailHtml(com.hotel.booking.model.User user, String resetUrl) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color:#2c5f8a;">🔐 Password Reset Request</h2>
                <p>Hello %s,</p>
                <p>We received a request to reset your password for your LuxStay account.</p>
                <p>Click the button below to reset it. This link will expire in 1 hour.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="%s" style="background-color: #c9a84c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Reset Password
                  </a>
                </div>
                
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p style="font-size: 12px; color: #999;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  %s
                </p>
                <br>
                <p style="color:#666;">Best regards,<br>The LuxStay Team</p>
              </div>
            </body>
            </html>
            """.formatted(user.getFullName(), resetUrl, resetUrl);
    }

    private String buildWelcomeEmailHtml(com.hotel.booking.model.User user) {

        return """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color:#c9a84c;">✨ Welcome to LuxStay!</h2>
                <p>Dear <strong>%s</strong>,</p>
                <p>Thank you for joining LuxStay. Your account has been successfully created.</p>
                <p>You can now browse and book premium hotels across India with ease.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Your Registered Email:</strong> %s</p>
                </div>
                
                <p>Enjoy your journey with us!</p>
                <br>
                <p style="color:#666;">Warm regards,<br>The LuxStay Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size:12px;color:#999;text-align:center;">
                  If you did not register for this account, please ignore this email or contact support.
                </p>
              </div>
            </body>
            </html>
            """.formatted(user.getFullName(), user.getEmail());
    }

    private String buildCancellationEmailHtml(Booking booking) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h2 style="color:#d9534f;">🚫 Booking Cancelled</h2>
                <p>Dear %s,</p>
                <p>Your booking with reservation number <strong>%s</strong> has been successfully cancelled.</p>
                
                <div style="background: #fdf7f7; border-left: 4px solid #d9534f; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Hotel:</strong> %s</p>
                  <p style="margin: 5px 0 0 0;"><strong>Dates:</strong> %s to %s</p>
                </div>
                
                <p>If any payment was made, the refund will be processed as per the hotel's policy.</p>
                <p>We hope to see you again soon!</p>
                <br>
                <p style="color:#666;">Best regards,<br>The LuxStay Team</p>
              </div>
            </body>
            </html>
            """.formatted(
                booking.getUser().getFullName(),
                booking.getReservationNumber(),
                booking.getHotel().getName(),
                booking.getCheckInDate().format(DATE_FMT),
                booking.getCheckOutDate().format(DATE_FMT)
        );
    }

    private String buildEmailHtml(Booking booking) {


        return """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color:#2c5f8a;">🏨 Booking Confirmed!</h2>
              <p>Dear %s,</p>
              <p>Your hotel booking has been confirmed. Here are your booking details:</p>
              <table style="border-collapse:collapse;width:100%%;max-width:500px;">
                <tr style="background:#f5f5f5;">
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Reservation No.</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%s</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Hotel</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%s, %s</td>
                </tr>
                <tr style="background:#f5f5f5;">
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Room</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%s (%s)</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Check-in</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%s</td>
                </tr>
                <tr style="background:#f5f5f5;">
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Check-out</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%s</td>
                </tr>
                <tr>
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Guests</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;">%d</td>
                </tr>
                <tr style="background:#f5f5f5;">
                  <td style="padding:10px;border:1px solid #ddd;"><strong>Total Amount</strong></td>
                  <td style="padding:10px;border:1px solid #ddd;"><strong>₹%s</strong></td>
                </tr>
              </table>
              <br>
              <p style="color:#666;">Thank you for choosing us. We look forward to hosting you!</p>
              <p style="font-size:12px;color:#999;">If you have any questions, contact us at support@hotelbooking.com</p>
            </body>
            </html>
            """.formatted(
                booking.getUser().getFullName(),
                booking.getReservationNumber(),
                booking.getHotel().getName(), booking.getHotel().getCity(),
                booking.getRoom().getRoomNumber(), booking.getRoom().getRoomType(),
                booking.getCheckInDate().format(DATE_FMT),
                booking.getCheckOutDate().format(DATE_FMT),
                booking.getNumberOfGuests(),
                booking.getTotalAmount()
        );
    }
}
