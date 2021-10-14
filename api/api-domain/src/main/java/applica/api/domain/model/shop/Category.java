package applica.api.domain.model.shop;

import applica.framework.AEntity;

public class Category extends AEntity {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
