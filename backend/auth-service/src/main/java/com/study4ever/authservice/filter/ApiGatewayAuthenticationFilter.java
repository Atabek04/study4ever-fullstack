package com.study4ever.authservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
public class ApiGatewayAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        String userId = request.getHeader("X-User-Id");
        String userRoles = request.getHeader("X-User-Roles");
        
        if (userId != null && userRoles != null) {
            log.debug("Processing API Gateway headers - User: {}, Roles: {}", userId, userRoles);
            
            List<SimpleGrantedAuthority> authorities = Collections.emptyList();
            if (!userRoles.isEmpty()) {
                authorities = Arrays.stream(userRoles.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }
            
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("Set authentication in context for user: {}", userId);
        }
        
        filterChain.doFilter(request, response);
    }
}
