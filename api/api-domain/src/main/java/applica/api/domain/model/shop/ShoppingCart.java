package applica.api.domain.model.shop;

import applica.framework.AEntity;

import java.util.List;

public class ShoppingCart {
    List<ShopItem> items;

    public List<ShopItem> getItems() {return items;}

    public void setItems(List<ShopItem> items) {this.items = items;}
}
