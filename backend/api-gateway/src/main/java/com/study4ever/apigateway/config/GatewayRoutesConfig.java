package com.study4ever.apigateway.config;

import com.study4ever.apigateway.filter.JwtAuthenticationGatewayFilterFactory;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class GatewayRoutesConfig {

    private static final ArrayList<String> ALL_ROLES = new ArrayList<>(List.of("ROLE_STUDENT", "ROLE_INSTRUCTOR", "ROLE_ADMIN"));
    private static final ArrayList<String> INSTRUCTOR_ADMIN_ROLES = new ArrayList<>(List.of("ROLE_INSTRUCTOR", "ROLE_ADMIN"));
    private static final ArrayList<String> ADMIN_ROLES = new ArrayList<>(List.of("ROLE_ADMIN"));

    private final JwtAuthenticationGatewayFilterFactory jwtFilterFactory;

    public GatewayRoutesConfig(JwtAuthenticationGatewayFilterFactory jwtFilterFactory) {
        this.jwtFilterFactory = jwtFilterFactory;
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Bookmark routes - MUST BE FIRST to avoid conflicts with other routes
                .route("progress-service-bookmark-add", r -> r
                        .path("/api/v1/courses/*/modules/*/lessons/*/bookmark")
                        .and().method(HttpMethod.POST)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-bookmark-remove", r -> r
                        .path("/api/v1/lessons/*/bookmark")
                        .and().method(HttpMethod.DELETE)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-bookmark-status", r -> r
                        .path("/api/v1/lessons/*/bookmark/status")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-bookmarks-list", r -> r
                        .path("/api/v1/bookmarks")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-bookmarks-by-course", r -> r
                        .path("/api/v1/courses/*/bookmarks")
                        .and().method(HttpMethod.GET, HttpMethod.DELETE)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-modules-progress", r -> r
                        .predicate(p -> p.getRequest().getURI().getPath().matches("/api/v1/courses/\\d+/modules/progress"))
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-lessons-progress", r -> r
                        .predicate(p -> p.getRequest().getURI().getPath().matches("/api/v1/courses/\\d+/modules/\\d+/lessons/progress"))
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-lessons-completed-progress", r -> r
                        .predicate(p -> p.getRequest().getURI().getPath().matches("/api/v1/courses/\\d+/modules/\\d+/lessons/completed"))
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-lessons-completed-progress-course", r -> r
                        .predicate(p -> p.getRequest().getURI().getPath().matches("/api/v1/courses/\\d+/completed"))
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))
                        
                .route("progress-service-continue-learning", r -> r
                        .predicate(p -> p.getRequest().getURI().getPath().matches("/api/v1/courses/\\d+/continue-learning"))
                        .and()
                        .method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                // Course service routes
                .route("course-service-read", r -> r
                        .path("/api/v1/courses/**")
                        .and().method(HttpMethod.GET)
                        .and().not(p -> p.path(
                                "/api/v1/courses/*/progress/**",
                                "/api/v1/courses/*/modules/*/progress/**",
                                "/api/v1/courses/*/modules/*/lessons/*/progress/**",
                                "/api/v1/courses/progress/**",
                                "/api/v1/courses/enrolled-courses"))
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://COURSE-SERVICE"))

                .route("course-service-read-other", r -> r
                        .path("/api/v1/modules/**", "/api/v1/lessons/**", "/api/v1/tags/**")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://COURSE-SERVICE"))

                .route("course-service-write", r -> r
                        .path("/api/v1/courses/**", "/api/v1/modules/**", "/api/v1/lessons/**", "/api/v1/tags/**")
                        .and().method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.PATCH)
                        .and().not(p -> p.path(
                                "/api/v1/courses/*/progress/**",
                                "/api/v1/courses/*/modules/*/progress/**",
                                "/api/v1/courses/*/modules/*/lessons/*/progress/**"))
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(INSTRUCTOR_ADMIN_ROLES))))
                        .uri("lb://COURSE-SERVICE"))

                .route("course-service-study-sessions-read", r -> r
                        .path("/api/v1/study-sessions/**")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://COURSE-SERVICE"))

                .route("course-service-study-sessions-write", r -> r
                        .path("/api/v1/study-sessions/**")
                        .and().method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.PATCH)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://COURSE-SERVICE"))

                // Progress service routes
                .route("progress-service-course-progress-read", r -> r
                        .path("/api/v1/courses/*/progress/**",
                                "/api/v1/courses/*/modules/*/progress/**",
                                "/api/v1/courses/*/modules/*/progress",
                                "/api/v1/courses/*/modules/*/lessons/*/progress/**",
                                "/api/v1/courses/progress/**",
                                "/api/v1/courses/enrolled-courses")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-course-progress-write", r -> r
                        .path("/api/v1/courses/*/progress/**",
                                "/api/v1/courses/*/modules/*/progress/**",
                                "/api/v1/courses/*/modules/*/lessons/*/progress/**")
                        .and().method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.PATCH)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-read", r -> r
                        .path("/api/v1/progress/**",
                                "/api/v1/sessions/**",
                                "/api/v1/streaks/**")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-write", r -> r
                        .path("/api/v1/progress/**",
                                "/api/v1/sessions/**",
                                "/api/v1/streaks/**")
                        .and().method(HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE, HttpMethod.PATCH)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-admin", r -> r
                        .path("/api/v1/admin/progress/**",
                                "/api/v1/admin/sessions/**",
                                "/api/v1/admin/streaks/**",
                                "/api/v1/sessions/admin/**")
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                // Leaderboard service routes
                .route("progress-service-leaderboard-read", r -> r
                        .path("/api/leaderboard/**")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                .route("progress-service-leaderboard-write", r -> r
                        .path("/api/leaderboard/recalculate")
                        .and().method(HttpMethod.POST)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(INSTRUCTOR_ADMIN_ROLES))))
                        .uri("lb://PROGRESS-SERVICE"))

                // Auth service routes - Admin routes
                .route("auth-service-admin-students", r -> r
                        .path("/api/v1/admin/students/**", "/api/v1/admin/students")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service-admin-instructors", r -> r
                        .path("/api/v1/admin/instructors/**", "/api/v1/admin/instructors")
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service-admin-users", r -> r
                        .path("/api/v1/admin/users/**", "/api/v1/admin/users")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service-admin-summary", r -> r
                        .path("/api/v1/admin/summary")
                        .and().method(HttpMethod.GET)
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service-admin-general", r -> r
                        .path("/api/v1/admin/**")
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ADMIN_ROLES))))
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service", r -> r
                        .path("/api/v1/auth/**")
                        .uri("lb://AUTH-SERVICE"))

                .route("auth-service-profile", r -> r
                        .path("/api/v1/auth/profile")
                        .filters(f -> f.filter(jwtFilterFactory.apply(c -> c.setAllowedRoles(ALL_ROLES))))
                        .uri("lb://AUTH-SERVICE"))
                .build();
    }
}

