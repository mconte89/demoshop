package applica.api.runner.test;

import applica.api.runner.Application;
import applica.framework.library.options.OptionsManager;
import applica.framework.library.options.PropertiesOptionManager;
import applica.framework.library.responses.Response;
import applica.framework.library.responses.ValueResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.Assert;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@SpringBootTest(classes = {Application.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class IntegrationTest implements InitializingBean {

    public static final int SAMPLES = 10;
    public static final int FAMILY_MEMBERS = 3;
    public static final int CONTACTS = 5;
    public static final int TESTS = 1;

    @LocalServerPort
    private int port;

    private RestTemplate rest = new RestTemplate();

    private static String token;
    private static String userId;

    private static JsonNode profile;
    private static JsonNode family;

    @Autowired
    private OptionsManager options;

    private String url(String path) {
        return String.format("http://localhost:%d/api%s", port, path);
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        ((PropertiesOptionManager) options).forceEnvironment("test");
    }

    @Order(1)
    @Test
    public void registerAndLogin() {
        if (token != null) {
            return;
        }

        var password = UUID.randomUUID().toString();
        var mail = System.currentTimeMillis() + "testmail@applica";
        var form = new LinkedMultiValueMap<String, String>();

        form.add("name", "Bruno");
        form.add("password", password);
        form.add("mail", mail);

        var registration = rest.postForObject(url("/account/register"), form, ValueResponse.class);
        Assert.assertNotNull(registration);
        Assert.assertEquals(Response.OK, registration.getResponseCode());
        Assert.assertNotNull(registration.getValue());
        var activationCode = registration.getValue().toString();

        form.clear();
        form.add("activationCode", activationCode);
        var activation = rest.postForObject(url("/account/confirm"), form, ValueResponse.class);
        Assert.assertNotNull(activation);
        Assert.assertEquals(Response.OK, activation.getResponseCode());

        form.clear();
        form.add("mail", mail);
        form.add("password", password);
        var login = rest.postForObject(url("/auth/login"), form, ObjectNode.class);
        Assert.assertNotNull(login);
        Assert.assertEquals(Response.OK, login.get("responseCode").asInt());
        token = login.get("token").asText();
        userId = login.get("user").get("id").asText();

        Assert.assertNotNull(token);

        System.out.println(token);
    }

    MultiValueMap<String, String> token() {
        var headers = new LinkedMultiValueMap<String, String>();
        headers.set("x-auth-token", token);

        return headers;
    }


}
