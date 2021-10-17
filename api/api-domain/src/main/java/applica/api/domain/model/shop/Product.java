package applica.api.domain.model.shop;
import applica.api.domain.model.Entities;
import applica.framework.AEntity;
import applica.framework.annotations.OneToMany;
import applica.framework.widgets.entities.EntityId;

import java.util.ArrayList;
import java.util.List;

@EntityId(Entities.PRODUCT)
public class Product extends AEntity {
    private String code;
    private String name;
    private String description;
    private double price;
    private double discount;
    private boolean forSale;
    private int availableQuantity;

    /* TODO: fix Save operation */
    @OneToMany
    private List<Category> categories = new ArrayList<Category>();

    public String getCode() {return code;}

    public void setCode(String code) {this.code = code;}

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public String getDescription() {return description;}

    public void setDescription(String description) {this.description = description;}

    public double getPrice() {return price;}

    public void setPrice(double price) {this.price = price;}

    public double getDiscount() {return discount;}

    public void setDiscount(double discount) {this.discount = discount;}

    public boolean getForSale() {return forSale;}

    public void setForSale(boolean forSale) {this.forSale = forSale;}

    public int getAvailableQuantity() {return availableQuantity;}

    public void setAvailableQuantity(int availableQuantity) {this.availableQuantity = availableQuantity;}

    public List<Category> getCategories() {return categories;}

    public void setCategories(List<Category> categories) {this.categories = categories;}
}
