package applica.api.facade;

import applica.api.domain.model.Filters;
import applica.api.domain.model.TempAttachmentEntity;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.fileserver.FileServer;
import applica.framework.library.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.Date;

import static applica.api.services.utils.FileUtils.getEntityIdFromPath;

@Component
public class FileserverFacade {


    @Autowired
    private FileServer fileServer;

    public InputStream getFile(String path) throws IOException {
        return fileServer.getFile(path);
    }


    public void deleteOldTempAttachmentEntities() {
        Repo.of(TempAttachmentEntity.class).find(Query.build().lte(Filters.DATE, DateUtils.addMinutesToDate(new Date(), -10))).getRows().forEach(this::deleteTempAttachment);

    }

    public void checkTempAttachmentAfterDownload(String path) {
        TempAttachmentEntity t = Repo.of(TempAttachmentEntity.class).get(getEntityIdFromPath(path)).orElse(null);
        if (t != null && t.isDeleteAfterDownload())
            deleteTempAttachment(t);
    }

    public void deleteTempAttachment(TempAttachmentEntity d) {
        if (d != null) {
            try {
                fileServer.deleteFile(d.getPath());
            } catch (IOException e) {
                e.printStackTrace();
            }
            Repo.of(TempAttachmentEntity.class).delete(d.getSid());
        }

    }
}
