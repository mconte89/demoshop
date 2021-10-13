package applica.api.domain.model;

import applica.framework.Entity;

import java.util.Date;

public interface EntityWithCreationInfos extends Entity {

    void setCreationInfos();

    void setLastEditInfos();

    String getCreationUserId();

    String getLastEditUserId();

    Date getCreationDate();

    Date getLastEditDate();

    void setCreationDate(Date date);

    void setLastEditDate(Date date);

    void setLastEditUserId(String userId);

    void setCreationUserId(String userId);
}
