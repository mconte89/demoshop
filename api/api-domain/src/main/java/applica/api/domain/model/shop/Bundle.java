package applica.api.domain.model.shop;

import applica.framework.AEntity;

import java.util.List;

public class Bundle extends AEntity {

    String name;
    List<ProductWithQuantity> articles;

    public String getName() {return name;}

    public void setName(String name) {this.name = name;}

    public List<ProductWithQuantity> getArticles() {return articles;}

    public void setArticles(List<ProductWithQuantity> articles) {this.articles = articles;}
}


