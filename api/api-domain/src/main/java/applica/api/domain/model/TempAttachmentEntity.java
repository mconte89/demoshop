package applica.api.domain.model;

import applica.api.domain.utils.DomainFileUtils;
import applica.framework.AEntity;
import applica.framework.security.User;
import applica.framework.widgets.entities.EntityId;

import java.util.Date;

/**
 * Questa entità permette il download di un file tramite il nuovo sistema di fileserver che NOn espone il percorso relativo del file nel fileserver.
 * Solo l'utente il cui ID è userId è autorizzato al download. Questa entità viene periodicamente eliminiata (file incluso) da un job della scheduleFacade
 */
@EntityId(Entities.TEMP_ATTACHMENT_ENTITY)
public class TempAttachmentEntity extends AEntity {
    private Date date;
    private String path;
    private boolean deleteAfterDownload;
    private String userId;

    public TempAttachmentEntity() {}

    public TempAttachmentEntity(User user, String documentPath) {
        userId = user.getId().toString();
        path = documentPath;
        date = new Date();
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getPathCode() {
        return DomainFileUtils.generateFilePathForEntity(this, "path", false);
    }

    public boolean isDeleteAfterDownload() {
        return deleteAfterDownload;
    }

    public void setDeleteAfterDownload(boolean deleteAfterDownload) {
        this.deleteAfterDownload = deleteAfterDownload;
    }
}
