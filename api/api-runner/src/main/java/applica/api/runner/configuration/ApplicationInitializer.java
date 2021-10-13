package applica.api.runner.configuration;


import applica.api.facade.SetupFacade;
import applica.framework.revision.services.RevisionService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class ApplicationInitializer {


    private Log logger = LogFactory.getLog(getClass());

    @Autowired
    private SetupFacade setupFacade;

    @Autowired(required = false)
    private RevisionService revisionService;


    public void init() {
        if (revisionService != null)
            revisionService.disableRevisionForCurrentThread();

        setupFacade.setupApplication();
        logger.info("Applica Framework app started");
        if (revisionService != null)
            revisionService.enableRevisionForCurrentThread();
    }
}
