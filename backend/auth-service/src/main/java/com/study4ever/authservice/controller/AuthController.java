package com.study4ever.authservice.controller;

import com.study4ever.authservice.dto.LoginRequest;
import com.study4ever.authservice.dto.RegisterRequest;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.exception.BadRequestException;
import com.study4ever.authservice.jwt.TokenResponse;
import com.study4ever.authservice.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authService;

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Processing login request for user: {}", loginRequest.getUsername());
        return authService.authenticate(loginRequest);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse register(@Valid @RequestBody RegisterRequest registerRequest) {
        log.info("Processing registration request for user: {}", registerRequest.getUsername());
        return authService.register(registerRequest);
    }

    @PostMapping("/refresh")
    public TokenResponse refreshToken(@RequestBody Map<String, String> refreshRequest) {
        String refreshToken = refreshRequest.get("refreshToken");
        if (refreshToken == null) {
            throw new BadRequestException("Refresh token is required");
        }

        log.info("Processing token refresh request");
        return authService.refreshToken(refreshToken);
    }

    @PostMapping("/logout")
    public void logout() {
        // For JWT, server-side logout is minimal since tokens are stateless
        log.info("Processing logout request");
    }

    @GetMapping("/validate")
    public Map<String, Boolean> validateToken(@RequestHeader(value = "Authorization", required = false) String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            boolean isValid = authService.validateToken(token);
            return Map.of("valid", isValid);
        }
        return Map.of("valid", false);
    }
}
