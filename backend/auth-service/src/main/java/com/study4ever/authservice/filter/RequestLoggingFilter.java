package com.study4ever.authservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Log headers for debugging
        if (log.isDebugEnabled()) {
            log.debug("=== Request Headers ===");
            Collections.list(request.getHeaderNames()).forEach(headerName ->
                    log.debug("{}: {}", headerName, request.getHeader(headerName))
            );

            log.debug("=== Request Info ===");
            log.debug("URI: {}", request.getRequestURI());
            log.debug("Method: {}", request.getMethod());
            log.debug("Remote Address: {}", request.getRemoteAddr());
        }

        filterChain.doFilter(request, response);
    }
}
