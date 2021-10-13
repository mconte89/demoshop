package applica.api.runner;

import applica.api.domain.model.Filters;
import applica.api.runner.configuration.ApplicationConfiguration;
import applica.api.runner.configuration.ApplicationInitializer;
import applica.api.runner.configuration.MongoConfiguration;
import applica.api.runner.configuration.SecurityConfiguration;
import applica.framework.AEntity;
import applica.framework.ApplicationContextProvider;
import applica.framework.EntitiesScanner;
import applica.framework.revision.model.Revision;
import applica.framework.security.authorization.Permissions;
import applica.framework.widgets.entities.EntitiesRegistry;
import applica.framework.widgets.entities.PermissionsRegistry;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.autoconfigure.http.HttpMessageConvertersAutoConfiguration;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.HttpEncodingAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static applica.framework.security.authorization.BaseAuthorizationService.SUPERUSER_PERMISSION;

/**
 * Applica (www.applica.guru)
 * User: bimbobruno
 * Date: 2/21/13
 * Time: 3:37 PM
 */
@EnableWebMvc
@ComponentScan("applica.api.domain")
@ComponentScan("applica.api.data.mongodb")
@ComponentScan("applica.api.services")
@ComponentScan("applica.api.runner")
@ComponentScan("applica.api.facade")
@Import({
        DispatcherServletAutoConfiguration.class,
        ErrorMvcAutoConfiguration.class,
        HttpEncodingAutoConfiguration.class,
        HttpMessageConvertersAutoConfiguration.class,
        JacksonAutoConfiguration.class,
        PropertyPlaceholderAutoConfiguration.class,
        ServletWebServerFactoryAutoConfiguration.class,
        WebMvcAutoConfiguration.class,
        ApplicationConfiguration.class,
        MongoConfiguration.class,
        SecurityConfiguration.class
})
public class Application implements InitializingBean {
    static {
        AEntity.strategy = AEntity.IdStrategy.String;
    }

    private final ApplicationContextProvider applicationContextProvider;
    private final ApplicationInitializer applicationInitializer;

    @Autowired
    public Application(ApplicationContextProvider applicationContextProvider, ApplicationInitializer applicationInitializer) {
        this.applicationContextProvider = applicationContextProvider;
        this.applicationInitializer = applicationInitializer;
    }

    @Override
    public void afterPropertiesSet() {
        applicationInitializer.init();
    }

    public static void main(String[] args) {
        try {
            EntitiesScanner scanner = new EntitiesScanner();
            scanner.addHandler(EntitiesRegistry.instance());
            scanner.addHandler(PermissionsRegistry.instance());
            scanner.scan(Filters.class.getPackage());
            scanner.scan(Revision.class.getPackage());
            Permissions.instance().registerStatic(SUPERUSER_PERMISSION);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        SpringApplication.run(Application.class, args);
    }
}
