package com.study4ever.progressservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.exchanges.events}")
    private String exchange;

    @Value("${rabbitmq.queues.user-created}")
    private String userCreatedQueue;

    @Value("${rabbitmq.queues.user-deleted}")
    private String userDeletedQueue;

    @Value("${rabbitmq.queues.course-enrollment}")
    private String courseEnrollmentQueue;

    @Value("${rabbitmq.queues.course-completion}")
    private String courseCompletionQueue;

    @Value("${rabbitmq.queues.lesson-completion}")
    private String lessonCompletionQueue;

    @Value("${rabbitmq.queues.user-login}")
    private String userLoginQueue;

    @Value("${rabbitmq.routing-keys.user-created}")
    private String userCreatedRoutingKey;

    @Value("${rabbitmq.routing-keys.user-deleted}")
    private String userDeletedRoutingKey;

    @Value("${rabbitmq.routing-keys.course-enrollment}")
    private String courseEnrollmentRoutingKey;

    @Value("${rabbitmq.routing-keys.course-completion}")
    private String courseCompletionRoutingKey;

    @Value("${rabbitmq.routing-keys.lesson-completion}")
    private String lessonCompletionRoutingKey;

    @Value("${rabbitmq.routing-keys.user-login}")
    private String userLoginRoutingKey;

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(exchange);
    }

    @Bean
    public Queue userCreatedQueue() {
        return new Queue(userCreatedQueue);
    }

    @Bean
    public Queue userDeletedQueue() {
        return new Queue(userDeletedQueue);
    }

    @Bean
    public Queue courseEnrollmentQueue() {
        return new Queue(courseEnrollmentQueue);
    }

    @Bean
    public Queue courseCompletionQueue() {
        return new Queue(courseCompletionQueue);
    }

    @Bean
    public Queue lessonCompletionQueue() {
        return new Queue(lessonCompletionQueue);
    }

    @Bean
    public Queue userLoginQueue() {
        return new Queue(userLoginQueue);
    }

    @Bean
    public Binding userCreatedBinding() {
        return BindingBuilder
                .bind(userCreatedQueue())
                .to(eventExchange())
                .with(userCreatedRoutingKey);
    }

    @Bean
    public Binding userDeletedBinding() {
        return BindingBuilder
                .bind(userDeletedQueue())
                .to(eventExchange())
                .with(userDeletedRoutingKey);
    }

    @Bean
    public Binding courseEnrollmentBinding() {
        return BindingBuilder
                .bind(courseEnrollmentQueue())
                .to(eventExchange())
                .with(courseEnrollmentRoutingKey);
    }

    @Bean
    public Binding courseCompletionBinding() {
        return BindingBuilder
                .bind(courseCompletionQueue())
                .to(eventExchange())
                .with(courseCompletionRoutingKey);
    }

    @Bean
    public Binding lessonCompletionBinding() {
        return BindingBuilder
                .bind(lessonCompletionQueue())
                .to(eventExchange())
                .with(lessonCompletionRoutingKey);
    }

    @Bean
    public Binding userLoginBinding() {
        return BindingBuilder
                .bind(userLoginQueue())
                .to(eventExchange())
                .with(userLoginRoutingKey);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter());
        return rabbitTemplate;
    }
}
