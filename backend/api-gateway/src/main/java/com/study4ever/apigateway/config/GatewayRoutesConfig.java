package com.study4ever.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.ArrayList;
import java.util.List;

import com.study4ever.apigateway.filter.JwtAuthenticationGatewayFilterFactory;

@Configuration
public class GatewayRoutesConfig {

    private final JwtAuthenticationGatewayFilterFactory jwtFilterFactory;

    public GatewayRoutesConfig(JwtAuthenticationGatewayFilterFactory jwtFilterFactory) {
        this.jwtFilterFactory = jwtFilterFactory;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("course-service-read", r -> r
                        .path("/api/v1/courses/**", "/api/v1/modules/**", "/api/v1/lessons/**", "/api/v1/tags/**")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c ->
                                c.setAllowedRoles(new ArrayList<>(List.of("ROLE_TRAINEE", "ROLE_INSTRUCTOR", "ROLE_ADMIN"))))))
                        .uri("lb://COURSE-SERVICE"))
                        
                .route("course-service-write", r -> r
                        .path("/api/v1/courses/**", "/api/v1/modules/**", "/api/v1/lessons/**", "/api/v1/tags/**")
                        .and().method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.PATCH)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c ->
                                c.setAllowedRoles(new ArrayList<>(List.of("ROLE_INSTRUCTOR", "ROLE_ADMIN"))))))
                        .uri("lb://COURSE-SERVICE"))
                        
                .route("auth-service-admin", r -> r
                        .path("/api/v1/admin/**")
                        .filters(f -> f.filter(jwtFilterFactory.apply(c ->
                                c.setAllowedRoles(new ArrayList<>(List.of("ROLE_ADMIN"))))))
                        .uri("lb://AUTH-SERVICE"))
                        
                .route("auth-service", r -> r
                        .path("/api/v1/auth/**")
                        .uri("lb://AUTH-SERVICE"))
                .build();
    }
}
