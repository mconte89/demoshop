package applica.api.runner.filters;

import applica.api.domain.model.auth.User;
import applica.framework.security.Security;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static applica.api.runner.controllers.AccountController.CHANGE_PASSWORD_URL;

/**
 * Applica (www.applicamobile.com)
 * User: bimbobruno
 * Date: 11/12/14
 * Time: 18:23
 */
public class UserPasswordChangeDetectFilter extends GenericFilterBean {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        User user = ((User) Security.withMe().getLoggedUser());
        if (user != null && user.isNeedToChangePassword() && !request.getRequestURL().toString().endsWith(CHANGE_PASSWORD_URL))
            ((HttpServletResponse) servletResponse).sendError(HttpServletResponse.SC_UNAUTHORIZED);
        else
            filterChain.doFilter(servletRequest, servletResponse);
    }
}
