package applica.api.domain.model.shop;

import applica.api.domain.model.Entities;
import applica.framework.AEntity;
import applica.framework.widgets.entities.EntityId;

@EntityId(Entities.CATEGORY)
public class Category extends AEntity {

    private String name;
    private String description;

    @Override
    public String toString() { return getName(); }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}
}
