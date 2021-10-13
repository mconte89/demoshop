package applica.api.runner.configuration;

import applica.api.domain.utils.CustomErrorUtils;
import applica.api.domain.utils.CustomLocalizationUtils;
import applica.api.runner.operations.*;
import applica.framework.ApplicationContextProvider;
import applica.framework.DefaultRepositoriesFactory;
import applica.framework.RepositoriesFactory;
import applica.framework.fileserver.FileServer;
import applica.framework.fileserver.SimpleFileServer;
import applica.framework.library.cache.Cache;
import applica.framework.library.cache.MemoryCache;
import applica.framework.library.i18n.LocalizationUtils;
import applica.framework.library.options.OptionsManager;
import applica.framework.library.options.PropertiesOptionManager;
import applica.framework.library.utils.ErrorsUtils;
import applica.framework.library.velocity.BaseVelocityBuilder;
import applica.framework.library.velocity.VelocityBuilder;
import applica.framework.library.velocity.VelocityBuilderProvider;
import applica.framework.notifications.NotificationService;
import applica.framework.notifications.NotificationsController;
import applica.framework.notifications.firebase.FirebaseNotificationService;
import applica.framework.revision.RevisionController;
import applica.framework.revision.RevisionTrackingCrudStrategy;
import applica.framework.revision.services.RevisionService;
import applica.framework.revision.services.implementation.BaseRevisionService;
import applica.framework.widgets.factory.DefaultOperationsFactory;
import applica.framework.widgets.factory.OperationsFactory;
import applica.framework.widgets.mapping.EntityMapper;
import applica.framework.widgets.operations.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.*;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor;
import org.springframework.scheduling.config.TaskManagementConfigUtils;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.i18n.SessionLocaleResolver;

import java.util.Locale;


/**
 * Created by bimbobruno on 14/11/2016.
 */
@Configuration
@Primary
public class ApplicationConfiguration implements WebMvcConfigurer {

    private Log logger = LogFactory.getLog(getClass());

    private OptionsManager options;

    // FRAMEWORK GENERAL BEANS

    @Bean
    public OptionsManager optionsManager() {
        options = new PropertiesOptionManager();

        //force environment using command line parameter
        String environment = System.getProperty("environment");
        if (org.apache.commons.lang.StringUtils.isNotEmpty(environment)) {
            ((PropertiesOptionManager) options).forceEnvironment(environment);
            logger.info("Forced environment to: " + environment);
        }

        return options;
    }

    @Bean
    public LocalizationUtils getLocalizationUtils() {
        return new CustomLocalizationUtils();
    }

    @Bean
    public ApplicationContextProvider applicationContextProvider() {
        return new ApplicationContextProvider();
    }

    @Bean
    public Cache cache() {
        return new MemoryCache();
    }

    @Bean
    public RepositoriesFactory repositoriesFactory() {
        return new DefaultRepositoriesFactory();
    }

    @Bean
    public VelocityBuilder velocityBuilder() {
        return new BaseVelocityBuilder();
    }

    @Bean
    public VelocityBuilderProvider velocityBuilderProvider() {
        return new VelocityBuilderProvider();
    }

    @Bean
    public OperationsFactory operationsFactory() {
        return new CustomOperationsFactory();
    }

    @Bean
    public EntityMapper entityMapper() {
        return new CustomEntityMapper();
    }

    @Bean
    @Scope("prototype")
    public CustomDefaultDeleteOperation defaultDeleteOperation() {
        return new CustomDefaultDeleteOperation();
    }

    @Bean
    @Scope("prototype")
    public CustomDefaultSaveOperation defaultSaveOperation() {
        return new CustomDefaultSaveOperation();
    }

    @Bean
    @Scope("prototype")
    public CustomDefaultGetOperation defaultGetOperation() {
        return new CustomDefaultGetOperation();
    }

    @Bean
    @Scope("prototype")
    public CustomDefaultFindOperation defaultFindOperation() {
        return new CustomDefaultFindOperation();
    }

    @Bean
    @Scope("prototype")
    public CustomDefaultCreateOperation defaultCreateOperation() {
        return new CustomDefaultCreateOperation();
    }


    /* Fileserver */

    @Bean
    public FileServer fileServer() {
        return new SimpleFileServer();
    }


    @Bean
    public ErrorsUtils getErrorUtils() {
        return new CustomErrorUtils();
    }

    /* cors configuration */

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                        .addMapping("/**")
                        .allowedMethods("POST", "PUT", "GET", "DELETE")
                        .allowedOrigins(options.get("applica.security.cors.allowedOrigins").split(","))
                ;
            }
        };
    }

    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver localeResolver = new SessionLocaleResolver();
        localeResolver.setDefaultLocale(Locale.ITALIAN);
        return localeResolver;
    }


    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasenames("classpath:messages/messages");
        messageSource.setDefaultEncoding("UTF-8");
        return messageSource;
    }

    @Bean
    public NotificationService notificationService(ResourceLoader resourceLoader, OptionsManager optionsManager) {
        return new FirebaseNotificationService(optionsManager, resourceLoader);
    }

    @Bean
    public NotificationsController notificationsController(ResourceLoader resourceLoader, OptionsManager optionsManager) {
        return new NotificationsController(notificationService(resourceLoader, optionsManager));
    }


    @Conditional(SchedulerCondition.class)
    @Bean(name = TaskManagementConfigUtils.SCHEDULED_ANNOTATION_PROCESSOR_BEAN_NAME)
    @Role(BeanDefinition.ROLE_INFRASTRUCTURE)
    public ScheduledAnnotationBeanPostProcessor scheduledAnnotationProcessor() {
        return new ScheduledAnnotationBeanPostProcessor();
    }



    @Bean
    public RevisionController revisionController() {
        return new RevisionController();
    }


    @Bean
    public RevisionService revisionService() {
        return new BaseRevisionService();
    }

}
