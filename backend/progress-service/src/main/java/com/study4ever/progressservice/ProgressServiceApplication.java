package com.study4ever.progressservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class ProgressServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProgressServiceApplication.class, args);
    }

}
