package com.study4ever.courseservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.annotation.RabbitListenerConfigurer;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistrar;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.backoff.ExponentialBackOffPolicy;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@Configuration
public class RabbitMQConfig implements RabbitListenerConfigurer {

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
        
        // Add retry template
        RetryTemplate retryTemplate = new RetryTemplate();
        ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        backOffPolicy.setInitialInterval(500);
        backOffPolicy.setMultiplier(2.0);
        backOffPolicy.setMaxInterval(10000);
        retryTemplate.setBackOffPolicy(backOffPolicy);
        rabbitTemplate.setRetryTemplate(retryTemplate);
        
        return rabbitTemplate;
    }

    // Main queue for user events
    @Bean
    public Queue userQueue() {
        return QueueBuilder.durable(USER_QUEUE)
                .withArgument("x-dead-letter-exchange", USER_DLX)
                .withArgument("x-dead-letter-routing-key", USER_DLQ)
                .build();
    }
    
    // Dead letter exchange
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(USER_DLX);
    }
    
    // Dead letter queue
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(USER_DLQ).build();
    }
    
    // Bind dead letter queue to dead letter exchange
    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue)
                .to(deadLetterExchange)
                .with(USER_DLQ);
    }
    
    // Message recoverer for failed message processing
    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, USER_DLX, USER_DLQ);
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