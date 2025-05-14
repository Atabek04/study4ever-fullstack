package com.study4ever.authservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.policy.SimpleRetryPolicy;
import org.springframework.retry.support.RetryTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    // Topic exchange name
    public static final String USER_EXCHANGE = "user.exchange";
    
    // Queue names
    public static final String USER_CREATED_QUEUE = "user.created.queue";
    public static final String USER_UPDATED_QUEUE = "user.updated.queue";
    public static final String USER_DELETED_QUEUE = "user.deleted.queue";
    
    // Routing keys
    public static final String USER_CREATED_ROUTING_KEY = "user.created";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";
    public static final String USER_DELETED_ROUTING_KEY = "user.deleted";
    
    // Dead letter configuration
    public static final String USER_DLX = "user.dlx";
    public static final String USER_CREATED_DLQ = "user.created.dlq";
    public static final String USER_UPDATED_DLQ = "user.updated.dlq";
    public static final String USER_DELETED_DLQ = "user.deleted.dlq";

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
    
    // Topic Exchange
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }
    
    // User Created Queue
    @Bean
    public Queue userCreatedQueue() {
        return QueueBuilder.durable(USER_CREATED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_CREATED_DLQ)
                .build();
    }
    
    // User Updated Queue
    @Bean
    public Queue userUpdatedQueue() {
        return QueueBuilder.durable(USER_UPDATED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_UPDATED_DLQ)
                .build();
    }
    
    // User Deleted Queue
    @Bean
    public Queue userDeletedQueue() {
        return QueueBuilder.durable(USER_DELETED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_DELETED_DLQ)
                .build();
    }
    
    // Bindings for topic exchange
    @Bean
    public Binding userCreatedBinding(@Qualifier("userCreatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(USER_CREATED_ROUTING_KEY);
    }
    
    @Bean
    public Binding userUpdatedBinding(@Qualifier("userUpdatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(USER_UPDATED_ROUTING_KEY);
    }
    
    @Bean
    public Binding userDeletedBinding(@Qualifier("userDeletedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(USER_DELETED_ROUTING_KEY);
    }

    // Dead Letter Exchange
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(USER_DLX);
    }
    
    // Dead Letter Queues
    @Bean
    public Queue userCreatedDLQ() {
        return QueueBuilder.durable(USER_CREATED_DLQ).build();
    }
    
    @Bean
    public Queue userUpdatedDLQ() {
        return QueueBuilder.durable(USER_UPDATED_DLQ).build();
    }
    
    @Bean
    public Queue userDeletedDLQ() {
        return QueueBuilder.durable(USER_DELETED_DLQ).build();
    }
    
    // Dead Letter Bindings
    @Bean
    public Binding userCreatedDLBinding(@Qualifier("userCreatedDLQ") Queue queue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(queue).to(deadLetterExchange).with(USER_CREATED_DLQ);
    }
    
    @Bean
    public Binding userUpdatedDLBinding(@Qualifier("userUpdatedDLQ") Queue queue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(queue).to(deadLetterExchange).with(USER_UPDATED_DLQ);
    }
    
    @Bean
    public Binding userDeletedDLBinding(@Qualifier("userDeletedDLQ") Queue queue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(queue).to(deadLetterExchange).with(USER_DELETED_DLQ);
    }
}