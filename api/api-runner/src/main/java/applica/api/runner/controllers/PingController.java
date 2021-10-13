package applica.api.runner.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("")
@RestController
public class PingController {

    @GetMapping("/ping")
    public String ping() {
        return "OK";
    }

}
