package com.study4ever.authservice.config;

import com.github.fridujo.rabbitmq.mock.MockConnectionFactory;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.CachingConnectionFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@TestConfiguration
@Profile("test")
public class RabbitMQTestConfig {

    @Bean
    @Primary
    public ConnectionFactory connectionFactory() {
        return new CachingConnectionFactory(new MockConnectionFactory());
    }

    @Bean
    @Primary
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(new Jackson2JsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(RabbitMQConfig.USER_EXCHANGE);
    }

    @Bean
    public Queue userCreatedQueue() {
        return new Queue(RabbitMQConfig.USER_CREATED_QUEUE, true);
    }

    @Bean
    public Queue userUpdatedQueue() {
        return new Queue(RabbitMQConfig.USER_UPDATED_QUEUE, true);
    }

    @Bean
    public Queue userDeletedQueue() {
        return new Queue(RabbitMQConfig.USER_DELETED_QUEUE, true);
    }

    @Bean
    public Binding userCreatedBinding(@Qualifier("userCreatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(RabbitMQConfig.USER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding userUpdatedBinding(@Qualifier("userUpdatedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(RabbitMQConfig.USER_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding userDeletedBinding(@Qualifier("userDeletedQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(RabbitMQConfig.USER_DELETED_ROUTING_KEY);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(RabbitMQConfig.USER_DLX);
    }

    @Bean
    public Queue userCreatedDLQ() {
        return new Queue(RabbitMQConfig.USER_CREATED_DLQ, true);
    }

    @Bean
    public Queue userUpdatedDLQ() {
        return new Queue(RabbitMQConfig.USER_UPDATED_DLQ, true);
    }

    @Bean
    public Queue userDeletedDLQ() {
        return new Queue(RabbitMQConfig.USER_DELETED_DLQ, true);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }
}
