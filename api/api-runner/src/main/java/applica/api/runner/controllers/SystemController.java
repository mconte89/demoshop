package applica.api.runner.controllers;

import applica.framework.library.options.OptionsManager;
import applica.framework.library.responses.Response;
import applica.framework.library.responses.ValueResponse;
import applica.api.domain.model.SystemInformation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/system")
@RestController
public class SystemController {

    @Autowired
    private OptionsManager optionsManager;

    @RequestMapping("/version")
    public @ResponseBody
    Response ping() {
        return new ValueResponse(new SystemInformation(optionsManager.get("api.version")));
    }

}
