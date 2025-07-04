package com.study4ever.courseservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListenerConfigurer;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistrar;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
@Slf4j
public class RabbitMQConfig implements RabbitListenerConfigurer {

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

        RetryTemplate retryTemplate = new RetryTemplate();
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(500);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000);
        retryTemplate.setBackOffPolicy(backOffPolicy);
        rabbitTemplate.setRetryTemplate(retryTemplate);

        log.info("RabbitMQ template successfully configured");
        return rabbitTemplate;
    }

    // Topic Exchange
    @Bean
    public TopicExchange userExchange() {
        log.info("Creating user exchange: {}", USER_EXCHANGE);
        return new TopicExchange(USER_EXCHANGE);
    }

    // User Created Queue
    @Bean
    public Queue userCreatedQueue() {
        log.info("Creating user created queue: {}", USER_CREATED_QUEUE);
        return QueueBuilder.durable(USER_CREATED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_CREATED_DLQ)
                .build();
    }

    // User Updated Queue
    @Bean
    public Queue userUpdatedQueue() {
        log.info("Creating user updated queue: {}", USER_UPDATED_QUEUE);
        return QueueBuilder.durable(USER_UPDATED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_UPDATED_DLQ)
                .build();
    }

    // User Deleted Queue
    @Bean
    public Queue userDeletedQueue() {
        log.info("Creating user deleted queue: {}", USER_DELETED_QUEUE);
        return QueueBuilder.durable(USER_DELETED_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_DELETED_DLQ)
                .build();
    }

    // Bindings for topic exchange
    @Bean
    public Binding userCreatedBinding(@Qualifier("userCreatedQueue") Queue queue, TopicExchange userExchange) {
        return BindingBuilder.bind(queue).to(userExchange).with(USER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding userUpdatedBinding(@Qualifier("userUpdatedQueue") Queue queue, TopicExchange userExchange) {
        return BindingBuilder.bind(queue).to(userExchange).with(USER_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding userDeletedBinding(@Qualifier("userDeletedQueue") Queue queue, TopicExchange userExchange) {
        return BindingBuilder.bind(queue).to(userExchange).with(USER_DELETED_ROUTING_KEY);
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

    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, USER_DLX, USER_DELETED_DLQ);
    }

    @Override
    public void configureRabbitListeners(RabbitListenerEndpointRegistrar registrar) {
        registrar.setValidator(localValidatorFactoryBean());
    }

    @Bean
    public LocalValidatorFactoryBean localValidatorFactoryBean() {
        return new LocalValidatorFactoryBean();
    }
}