package applica.api.fileserver;

import applica.framework.ApplicationContextProvider;
import applica.framework.fileserver.servlets.FilesServlet;
import applica.framework.fileserver.servlets.ImagesServlet;
import applica.framework.library.options.OptionsManager;
import applica.framework.library.options.PropertiesOptionManager;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.unit.DataSize;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.MultipartConfigElement;

/**
 * Created by bimbobruno on 14/11/2016.
 */
@Configuration
@Primary
public class ApplicationConfiguration implements WebMvcConfigurer {

    @Bean
    public OptionsManager optionsManager() {
        return new PropertiesOptionManager();
    }

    @Bean
    public ApplicationContextProvider applicationContextProvider() {
        return new ApplicationContextProvider();
    }

    @Bean
    public ServletRegistrationBean imagesServlet() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new ImagesServlet(), "/images/*");
        bean.setLoadOnStartup(1);
        return bean;
    }

    @Bean
    public ServletRegistrationBean filesServlet() {
        ServletRegistrationBean bean = new ServletRegistrationBean(new FilesServlet(), "/files/*");
        bean.setLoadOnStartup(1);
        return bean;
    }

    @Bean
    MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(5120));
        factory.setMaxRequestSize(DataSize.ofMegabytes(5120));
        return factory.createMultipartConfig();
    }


}
