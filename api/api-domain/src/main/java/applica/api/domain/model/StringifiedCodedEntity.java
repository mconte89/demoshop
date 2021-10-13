package applica.api.domain.model;

import applica.framework.Query;

public interface StringifiedCodedEntity extends CodedEntity {
    String getCode();

    void setCode(String code);

    void setProgressive(long progressive);

    long getProgressive();

    void generateCodeForCreation();

    Query generateQueryForCodeProgressive();
}
