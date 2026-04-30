package com.hotel.booking.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Rules (per IP address):
 *   /auth/*  → 10 requests / minute  (brute-force protection)
 *   all other → 100 requests / minute
 *
 * For production replace with Redis + Bucket4j or Resilience4j.
 */
@Component
@Slf4j
public class RateLimitingFilter implements Filter {

    // IP → [requestCount, windowStartMs]
    private final Map<String, long[]> authBucket   = new ConcurrentHashMap<>();
    private final Map<String, long[]> globalBucket = new ConcurrentHashMap<>();

    private static final int  AUTH_LIMIT   = 10;
    private static final int  GLOBAL_LIMIT = 100;
    private static final long WINDOW_MS    = 60_000L; // 1 minute

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest  req  = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String ip      = getClientIp(req);
        String path    = req.getRequestURI();
        boolean isAuth = path.contains("/auth/");

        Map<String, long[]> bucket = isAuth ? authBucket : globalBucket;
        int                 limit  = isAuth ? AUTH_LIMIT : GLOBAL_LIMIT;

        if (isRateLimited(bucket, ip, limit)) {
            log.warn("Rate limit exceeded for IP={} path={}", ip, path);
            resp.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            resp.setContentType("application/json");
            resp.getWriter().write(
                "{\"success\":false,\"message\":\"Too many requests. Please wait and try again.\",\"data\":null}"
            );
            return;
        }

        // Add rate-limit headers for transparency
        resp.setHeader("X-RateLimit-Limit",     String.valueOf(limit));
        resp.setHeader("X-RateLimit-Remaining", remaining(bucket, ip, limit));

        chain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, long[]> bucket, String ip, int limit) {
        long now = System.currentTimeMillis();
        bucket.compute(ip, (k, v) -> {
            if (v == null || now - v[1] > WINDOW_MS) return new long[]{1, now};
            v[0]++;
            return v;
        });
        long[] entry = bucket.get(ip);
        return entry[0] > limit;
    }

    private String remaining(Map<String, long[]> bucket, String ip, int limit) {
        long[] entry = bucket.get(ip);
        if (entry == null) return String.valueOf(limit);
        return String.valueOf(Math.max(0, limit - (int) entry[0]));
    }

    private String getClientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : req.getRemoteAddr();
    }
}
