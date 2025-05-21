package com.study4ever.courseservice.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for application caching.
 * Provides a cache manager for active study sessions to optimize performance.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    public static final String ACTIVE_SESSIONS_CACHE = "activeSessions";
    public static final String USER_SESSIONS_CACHE = "userSessions";
    
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(ACTIVE_SESSIONS_CACHE, USER_SESSIONS_CACHE);
    }
}
