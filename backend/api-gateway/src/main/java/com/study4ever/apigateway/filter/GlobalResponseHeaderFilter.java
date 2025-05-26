package com.study4ever.apigateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter to ensure custom headers are properly propagated through the gateway
 * This ensures that headers like X-User-Id and X-User-Roles are present in both requests and responses
 */
@Slf4j
@Component
public class GlobalResponseHeaderFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
            .then(Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                ServerHttpRequest request = exchange.getRequest();
                
                // Copy user-related headers from request to response if they exist
                if (request.getHeaders().containsKey("X-User-Id")) {
                    String userId = request.getHeaders().getFirst("X-User-Id");
                    response.getHeaders().add("X-User-Id", userId);
                    log.info("Added X-User-Id to response: {}", userId);
                }
                
                if (request.getHeaders().containsKey("X-User-Roles")) {
                    String userRoles = request.getHeaders().getFirst("X-User-Roles");
                    response.getHeaders().add("X-User-Roles", userRoles);
                    log.info("Added X-User-Roles to response: {}", userRoles);
                }
            }));
    }

    @Override
    public int getOrder() {
        // Make sure this filter runs after the JwtAuthenticationFilter
        return Ordered.HIGHEST_PRECEDENCE + 100;
    }
}
