package com.study4ever.authservice;

import com.study4ever.authservice.dto.LoginRequest;
import com.study4ever.authservice.dto.Role;
import com.study4ever.authservice.jwt.TokenResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TokenIntegrationTest extends BaseIntegrationTest {

    @Test
    void testTokenRefresh() throws Exception {
        String username = "refreshuser";
        String password = "password";
        createTestUser(username, password, Role.RoleName.ROLE_STUDENT);

        LoginRequest loginRequest = LoginRequest.builder()
                .username(username)
                .password(password)
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        TokenResponse tokenResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(), TokenResponse.class);

        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + tokenResponse.getRefreshToken() + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        TokenResponse newTokenResponse = objectMapper.readValue(
                refreshResult.getResponse().getContentAsString(), TokenResponse.class);

        assertNotNull(newTokenResponse.getAccessToken());
        assertNotNull(newTokenResponse.getRefreshToken());
        assertNotEquals(tokenResponse.getAccessToken(), newTokenResponse.getAccessToken());
    }

    @Test
    void testInvalidTokenRefresh() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"invalid-token\"}"))
                .andExpect(status().isUnauthorized());
    }
}
