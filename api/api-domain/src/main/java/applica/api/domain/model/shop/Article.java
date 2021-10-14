package applica.api.domain.model.shop;
import applica.api.domain.model.Entities;
import applica.framework.AEntity;
import applica.framework.widgets.entities.EntityId;

@EntityId(Entities.ARTICLE)
public class Article extends AEntity {
    private String code;
    private String name;
    private String description;
    private double price;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
