package applica.api.runner.controllers;

import applica.api.domain.model.Filters;
import applica.api.domain.model.auth.User;
import applica.api.services.AuthService;
import applica.api.services.MailService;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.library.options.OptionsManager;
import applica.framework.library.responses.Response;
import applica.framework.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

import static applica.framework.security.SecurityUtils.getClientIp;

@RequestMapping("/test")
@RestController
public class TestController {
    //Se true -> sono in modalità test: le feature sono abilitate senza ulteriori controlli
    private boolean testMode = false;

    //I seguenti parametri saranno valutati solo se testMode == false
    private boolean hiddenFeaturesEnabled = false;
    private String hiddenFeaturesSecret = null;
    private List<String> hiddenFeatuersAllowedIps = new ArrayList<>();

    @Autowired
    AuthService authService;

    @Autowired
    private OptionsManager optionsManager;

    @Autowired
    private MailService mailService;


    @PostConstruct
    public void init() {

        testMode = optionsManager.get("testmode").equals("ON");

        if (!testMode) {
            hiddenFeaturesEnabled = Boolean.parseBoolean(optionsManager.get("hidden.features.enabled"));
            hiddenFeaturesSecret = optionsManager.get("hidden.features.secret");
            String optionsAllowedIps = optionsManager.get("hidden.features.allowedIps");
            if (StringUtils.hasLength(optionsAllowedIps)) {
                hiddenFeatuersAllowedIps = Arrays.asList(optionsAllowedIps.split(","));
            }

        }
    }

    /**
     * Invia una mail di testo all'indirizzo 'mail'; se 'mail' non è presente verrà usato l'account di test predefinito
     * @param secret
     * @param mail
     * @param text
     * @return
     */

//    @PostMapping("/mail")
//    public
//    @ResponseBody
//    Response mail(String secret, String mail, String text, HttpServletRequest request) {
//        if (isEnabled(request, secret)) {
//            try {
//                mailService.sendSimpleMail(StringUtils.hasLength(mail)? mail : optionsManager.get("testmode.recipient.mail"), StringUtils.hasText(text)? text : "Email test");
//            }  catch (Exception e) {
//                return new Response(Response.ERROR, e.getMessage());
//            }
//        }
//        return new Response();
//    }
//
//    private boolean isEnabled(HttpServletRequest request, String secret) {
//        return testMode || (hiddenFeaturesEnabled && Objects.equals(secret, hiddenFeaturesSecret) && hiddenFeatuersAllowedIps.contains(getClientIp(request)));
//    }




//Imposta la password dell'utente con username "mail" in base al contenuto del campo "password"
//    @PostMapping("/forceResetPassword")
//    public
//    @ResponseBody
//    Response forceResetPassword(String secret, String mail, String password, HttpServletRequest request) {
//        try {
//            if (isEnabled(request, secret)) {
//                User user = Repo.of(User.class).find(Query.build().eq(Filters.USER_MAIL,  mail)).findFirst().get();
//                user.setPassword(SecurityUtils.encryptAndGetPassword(password));
//                Repo.of(User.class).save(user);
//            }
//        }  catch (Exception e) {
//        return new Response(Response.ERROR, e.getMessage());
//    }
//        return new Response();
//    }


    /**
     * Imposta la password di TUTTI gli utenti in "applica" e resetta il campo di set della password corrente in modo da costringerlo ad impostarne una nuova
     * nel successivo login
     */
//    @GetMapping("/fixUsers") public
//    @ResponseBody
//    Response fixUsers(String secret) {
//        if (secret.equals("antonio")) {
//            try {
//                multiThreadService.performForAllOrganizationsInNewThread(() -> Repo.of(User.class).find(null).getRows().forEach(u -> {
//                    u.setPassword(SecurityUtils.encodePassword("applica"));
//                    u.setCurrentPasswordSetDate(new Date());
//                    Repo.of(User.class).save(u);
//                }));
//            }  catch (Exception e) {
//                return new Response(Response.ERROR, e.getMessage());
//        }
//
//    }
//        return new Response();
//    }

    private boolean isEnabled(HttpServletRequest request, String secret) {
        return testMode || (hiddenFeaturesEnabled && Objects.equals(secret, hiddenFeaturesSecret) && hiddenFeatuersAllowedIps.contains(getClientIp(request)));
    }
}
