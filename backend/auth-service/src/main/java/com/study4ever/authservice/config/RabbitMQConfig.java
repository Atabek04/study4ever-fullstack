package com.study4ever.authservice.config;

import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String USER_QUEUE = "user.queue";
    public static final String USER_DLX = "user.dlx";
    public static final String USER_DLQ = "user.dlq";

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        
        // Configure retry with exponential backoff
        RetryTemplate retryTemplate = new RetryTemplate();
        
        // Configure exponential backoff policy
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(500); // Initial interval 500ms
        backOffPolicy.setMultiplier(2.0); // Double the interval each retry
        backOffPolicy.setMaxInterval(10000); // Max 10 seconds
        retryTemplate.setBackOffPolicy(backOffPolicy);
        
        // Configure retry policy
        Map<Class<? extends Throwable>, Boolean> retryableExceptions = new HashMap<>();
        retryableExceptions.put(Exception.class, true);
        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(3, retryableExceptions);
        retryTemplate.setRetryPolicy(retryPolicy);
        
        rabbitTemplate.setRetryTemplate(retryTemplate);
        
        // Set mandatory to true to get returns callbacks for undeliverable messages
        rabbitTemplate.setMandatory(true);
        
        // Configure confirmation callback
        rabbitTemplate.setConfirmCallback((correlation, ack, reason) -> {
            if (!ack) {
                System.err.println("Message was not confirmed by broker. Reason: " + reason);
                // In a real application, implement logging and possibly alerting
            }
        });
        
        // Configure return callback for messages that cannot be routed
        rabbitTemplate.setReturnsCallback(returned -> {
            System.err.println("Message returned: " + returned.getMessage() +
                    " with reply code: " + returned.getReplyCode() +
                    " and reason: " + returned.getReplyText());
            // In a real application, implement logging and reprocessing
        });
        
        return rabbitTemplate;
    }

    @Bean
    public Queue userQueue() {
        return QueueBuilder.durable(USER_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_DLQ)
                .build();
    }
    
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(USER_DLX);
    }
    
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(USER_DLQ).build();
    }
}