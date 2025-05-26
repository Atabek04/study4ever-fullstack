package com.study4ever.apigateway.filter;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@EnableConfigurationProperties(JwtAuthenticationGatewayFilterFactory.Config.class)
public class JwtAuthenticationGatewayFilterFactory extends AbstractGatewayFilterFactory<JwtAuthenticationGatewayFilterFactory.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationGatewayFilterFactory(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            if (path.startsWith("/api/v1/auth/")) {
                log.debug("Skipping JWT authentication for auth path: {}", path);
                return chain.filter(exchange);
            }

            return validateAndProcessToken(exchange, chain, config);
        };
    }

    private Mono<Void> validateAndProcessToken(ServerWebExchange exchange,
                                               GatewayFilterChain chain,
                                               Config config) {
        String path = exchange.getRequest().getURI().getPath();
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            return createErrorResponse(exchange.getResponse(),
                    HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.validateToken(token)) {
            log.warn("Invalid JWT token for path: {}", path);
            return createErrorResponse(exchange.getResponse(),
                    HttpStatus.UNAUTHORIZED, "Invalid or expired JWT token");
        }

        try {
            String username = jwtUtil.getUsernameFromToken(token);
            List<String> userRoles = jwtUtil.getRolesFromToken(token);

            if (userRoles == null) {
                userRoles = new ArrayList<>();
                log.warn("No roles found in token for user: {}", username);
            }

            List<String> allowedRoles = config.getAllowedRoles();
            log.debug("User: {}, Roles: {}, Required roles: {}", username, userRoles, allowedRoles);

            // If allowedRoles is empty, it means any authenticated user can access
            if (allowedRoles != null && !allowedRoles.isEmpty()) {
                boolean hasPermission = false;
                for (String userRole : userRoles) {
                    log.debug("Checking if role '{}' is in allowed roles: {}", userRole, allowedRoles);
                    if (allowedRoles.contains(userRole)) {
                        log.debug("Role match found: {}", userRole);
                        hasPermission = true;
                        break;
                    }
                }

                if (!hasPermission) {
                    log.warn("Access denied for user {} with roles {} - required roles: {}",
                            username, userRoles, allowedRoles);
                    return createErrorResponse(exchange.getResponse(), HttpStatus.FORBIDDEN,
                            "Access denied. Insufficient privileges.");
                }
            }

            // Add user information to request headers for downstream services
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", username)
                    .header("X-User-Roles", String.join(",", userRoles))
                    .build();

            // Set user information on the response headers for the frontend
            exchange.getResponse().getHeaders().set("X-User-Id", username);
            exchange.getResponse().getHeaders().set("X-User-Roles", String.join(",", userRoles));

            log.info("Added user roles to response headers: {} for user: {}", userRoles, username);
            
            return chain.filter(exchange.mutate()
                    .request(mutatedRequest)
                    .build());
        } catch (Exception e) {
            log.error("Error processing JWT token for path: {}", path, e);
            return createErrorResponse(exchange.getResponse(),
                    HttpStatus.INTERNAL_SERVER_ERROR, "Error processing JWT token");
        }
    }

    private Mono<Void> createErrorResponse(ServerHttpResponse response, HttpStatus status, String message) {
        response.setStatusCode(status);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        response.getHeaders().add(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, max-age=0, must-revalidate");
        response.getHeaders().add(HttpHeaders.PRAGMA, "no-cache");

        String timestamp = LocalDateTime.now().toString();
        String jsonError = String.format(
                "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\"}",
                timestamp, status.value(), status.getReasonPhrase(), message);

        DataBuffer buffer = response.bufferFactory().wrap(jsonError.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("allowedRoles");
    }

    @Override
    public ShortcutType shortcutType() {
        return ShortcutType.GATHER_LIST;
    }

    @ConfigurationProperties(prefix = "spring.cloud.gateway.filter.jwt-authentication")
    @Getter
    @Setter
    public static class Config {
        private List<String> allowedRoles = new ArrayList<>();
    }

    @PostConstruct
    public void init() {
        log.info("JwtAuthenticationGatewayFilterFactory initialized!");
    }
}