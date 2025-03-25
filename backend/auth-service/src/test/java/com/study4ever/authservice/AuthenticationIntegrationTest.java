package com.study4ever.authservice;

import com.study4ever.authservice.dto.LoginRequest;
import com.study4ever.authservice.dto.RegisterRequest;
import com.study4ever.authservice.dto.Role;
import com.study4ever.authservice.dto.UserResponse;
import com.study4ever.authservice.jwt.TokenResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthenticationIntegrationTest extends BaseIntegrationTest {

    @Test
    void shouldAuthenticateUserWithValidCredentials() throws Exception {
        String username = "testuser";
        String password = "password";
        createTestUser(username, password, Role.RoleName.ROLE_STUDENT);

        LoginRequest loginRequest = LoginRequest.builder()
                .username(username)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        TokenResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), TokenResponse.class);

        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void shouldRejectAuthenticationWithInvalidPassword() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .username("nonexistent")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRegisterNewUserSuccessfully() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@test.com")
                .password("password")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        UserResponse response = objectMapper.readValue(
                result.getResponse().getContentAsString(), UserResponse.class);

        assertEquals("newuser", response.getUsername());
        assertEquals("newuser@test.com", response.getEmail());

        assertTrue(userRepository.findByUsername("newuser").isPresent());
    }

    @Test
    void testRegistrationWithExistingUsername() throws Exception {
        String existingUsername = "existinguser";
        String password = "password";
        createTestUser(existingUsername, password, Role.RoleName.ROLE_STUDENT);

        RegisterRequest registerRequest = RegisterRequest.builder()
                .username(existingUsername)
                .email("different@test.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());
    }
}