package com.study4ever.authservice.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
@Data
public class JwtProperties {
    private String secret;
    private long accessTokenExpirationMs;
    private long refreshTokenExpirationMs;
    private String issuer;
}
