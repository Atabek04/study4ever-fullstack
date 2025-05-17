package com.study4ever.authservice.service;

import com.study4ever.authservice.config.JwtProperties;
import com.study4ever.authservice.dto.LoginRequest;
import com.study4ever.authservice.dto.RegisterRequest;
import com.study4ever.authservice.dto.TokenResponse;
import com.study4ever.authservice.dto.UserCreatedEvent;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.exception.EmailAlreadyExistsException;
import com.study4ever.authservice.exception.NotFoundException;
import com.study4ever.authservice.exception.UsernameAlreadyExistsException;
import com.study4ever.authservice.model.Role;
import com.study4ever.authservice.model.UserCredentials;
import com.study4ever.authservice.repo.RoleRepository;
import com.study4ever.authservice.repo.UserCredentialsRepository;
import com.study4ever.authservice.util.Mapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserCredentialsRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtProperties jwtProperties;
    private final UserEventProducer userEventProducer;

    public TokenResponse authenticate(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return createTokenResponse(authentication);
    }

    @Transactional
    public UserResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new UsernameAlreadyExistsException("Username is already taken");
        }
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already in use");
        }

        Set<Role> roles = new HashSet<>();
        Role role = roleRepository.findByName(Role.RoleName.ROLE_STUDENT)
                .orElseThrow(() -> new NotFoundException("Default role not found"));
        roles.add(role);

        UserCredentials user = UserCredentials.builder()
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .roles(roles)
                .build();
        UserCredentials savedUser = userRepository.save(user);
        sendUserCreatedEvent(savedUser);
        return Mapper.mapToUserResponse(savedUser);
    }

    public TokenResponse refreshToken(String refreshToken) {
        tokenProvider.validateToken(refreshToken);

        String username = tokenProvider.getUsernameFromToken(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        return createTokenResponse(authentication);
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    private TokenResponse createTokenResponse(Authentication authentication) {
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(jwtProperties.getAccessTokenExpirationMs() / 1000);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpirationMs())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .build();
    }

    private void sendUserCreatedEvent(UserCredentials user) {
        Set<String> roleNames = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toSet());

        UserCreatedEvent userCreatedEvent = new UserCreatedEvent(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                roleNames,
                user.isEnabled()
        );
        userEventProducer.sendUserCreatedEvent(userCreatedEvent);
    }
}
