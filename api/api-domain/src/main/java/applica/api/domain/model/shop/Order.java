package applica.api.domain.model.shop;

import applica.framework.AEntity;
import applica.framework.annotations.ManyToOne;

import java.util.List;

public class Order extends AEntity {
    private List<OrderRow> rows;

    @ManyToOne
    private Customer customer;

    public List<OrderRow> getRows() {
        return rows;
    }

    public void setRows(List<OrderRow> rows) {
        this.rows = rows;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}
