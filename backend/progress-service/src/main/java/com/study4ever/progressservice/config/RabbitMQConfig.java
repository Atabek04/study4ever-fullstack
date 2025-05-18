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
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class RabbitMQConfig {

    @Value("${rabbitmq.exchanges.events}")
    private String eventsExchange;
    
    @Value("${rabbitmq.exchanges.study-sessions}")
    private String studySessionExchange;

    @Value("${rabbitmq.queues.user-created}")
    private String userCreatedQueue;

    @Value("${rabbitmq.queues.user-deleted}")
    private String userDeletedQueue;

    @Value("${rabbitmq.queues.course-enrollment}")
    private String courseEnrollmentQueue;

    @Value("${rabbitmq.queues.course-completion}")
    private String courseCompletionQueue;

    @Value("${rabbitmq.queues.module-completion}")
    private String moduleCompletionQueue;

    @Value("${rabbitmq.queues.lesson-completion}")
    private String lessonCompletionQueue;

    @Value("${rabbitmq.queues.user-login}")
    private String userLoginQueue;
    
    @Value("${rabbitmq.queues.study-session-started}")
    private String studySessionStartedQueue;
    
    @Value("${rabbitmq.queues.study-session-ended}")
    private String studySessionEndedQueue;
    
    @Value("${rabbitmq.queues.study-session-heartbeat}")
    private String studySessionHeartbeatQueue;

    @Value("${rabbitmq.routing-keys.user-created}")
    private String userCreatedRoutingKey;

    @Value("${rabbitmq.routing-keys.user-deleted}")
    private String userDeletedRoutingKey;

    @Value("${rabbitmq.routing-keys.course-enrollment}")
    private String courseEnrollmentRoutingKey;

    @Value("${rabbitmq.routing-keys.course-completion}")
    private String courseCompletionRoutingKey;

    @Value("${rabbitmq.routing-keys.module-completion}")
    private String moduleCompletionRoutingKey;

    @Value("${rabbitmq.routing-keys.lesson-completion}")
    private String lessonCompletionRoutingKey;

    @Value("${rabbitmq.routing-keys.user-login}")
    private String userLoginRoutingKey;
    
    @Value("${rabbitmq.routing-keys.study-session-started}")
    private String studySessionStartedRoutingKey;
    
    @Value("${rabbitmq.routing-keys.study-session-ended}")
    private String studySessionEndedRoutingKey;
    
    @Value("${rabbitmq.routing-keys.study-session-heartbeat}")
    private String studySessionHeartbeatRoutingKey;

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(eventsExchange);
    }
    
    @Bean
    public TopicExchange studySessionsExchange() {
        return new TopicExchange(studySessionExchange);
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
    public Queue moduleCompletionQueue() {
        return new Queue(moduleCompletionQueue);
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
    public Queue studySessionStartedQueue() {
        return new Queue(studySessionStartedQueue);
    }
    
    @Bean
    public Queue studySessionEndedQueue() {
        return new Queue(studySessionEndedQueue);
    }
    
    @Bean
    public Queue studySessionHeartbeatQueue() {
        return new Queue(studySessionHeartbeatQueue);
    }

    @Bean
    public Binding userCreatedBinding() {
        return BindingBuilder
                .bind(userCreatedQueue())
                .to(eventsExchange())
                .with(userCreatedRoutingKey);
    }

    @Bean
    public Binding userDeletedBinding() {
        return BindingBuilder
                .bind(userDeletedQueue())
                .to(eventsExchange())
                .with(userDeletedRoutingKey);
    }

    @Bean
    public Binding courseEnrollmentBinding() {
        return BindingBuilder
                .bind(courseEnrollmentQueue())
                .to(eventsExchange())
                .with(courseEnrollmentRoutingKey);
    }

    @Bean
    public Binding courseCompletionBinding() {
        return BindingBuilder
                .bind(courseCompletionQueue())
                .to(eventsExchange())
                .with(courseCompletionRoutingKey);
    }

    @Bean
    public Binding moduleCompletionBinding() {
        return BindingBuilder
                .bind(moduleCompletionQueue())
                .to(eventsExchange())
                .with(moduleCompletionRoutingKey);
    }

    @Bean
    public Binding lessonCompletionBinding() {
        return BindingBuilder
                .bind(lessonCompletionQueue())
                .to(eventsExchange())
                .with(lessonCompletionRoutingKey);
    }

    @Bean
    public Binding userLoginBinding() {
        return BindingBuilder
                .bind(userLoginQueue())
                .to(eventsExchange())
                .with(userLoginRoutingKey);
    }
    
    @Bean
    public Binding studySessionStartedBinding() {
        return BindingBuilder
                .bind(studySessionStartedQueue())
                .to(studySessionsExchange())
                .with(studySessionStartedRoutingKey);
    }
    
    @Bean
    public Binding studySessionEndedBinding() {
        return BindingBuilder
                .bind(studySessionEndedQueue())
                .to(studySessionsExchange())
                .with(studySessionEndedRoutingKey);
    }
    
    @Bean
    public Binding studySessionHeartbeatBinding() {
        return BindingBuilder
                .bind(studySessionHeartbeatQueue())
                .to(studySessionsExchange())
                .with(studySessionHeartbeatRoutingKey);
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
