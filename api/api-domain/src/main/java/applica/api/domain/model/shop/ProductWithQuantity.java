package applica.api.domain.model.shop;

public class ProductWithQuantity {
    private Product article;
    private int quantity;

    public Product getArticle() {
        return article;
    }

    public void setArticle(Product article) {
        this.article = article;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
