package com.study4ever.authservice.controller;

import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.service.JwtTokenProvider;
import com.study4ever.authservice.service.UserCredentialsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class ProfileController {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserCredentialsService userService;

    @GetMapping("/profile")
    public UserResponse getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        var username = jwtTokenProvider.getUsernameFromToken(token);
        return userService.getProfile(username);
    }
}
