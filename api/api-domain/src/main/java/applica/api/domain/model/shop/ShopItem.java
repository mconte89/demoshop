package applica.api.domain.model.shop;

import java.util.List;

public interface ShopItem {
    String getCode();
    String getDescription();
    double getUnitPrice();
    double getDiscount();
    int getQuantity();
    double getFinalPrice();

    List<ShopItemDetail> getDetails();
}
