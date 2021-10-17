package applica.api.domain.model.shop;

import applica.framework.AEntity;

import java.util.Date;

/* associazione 1-1 con User.
   Nel caso di utenti anonimi, creato nel momento dell'aggiunta del primo item nel carrello
   e associato a token di sessione
 */
public class Customer extends AEntity {

    private String name;
    private String surname;
    private String telephone;
    private String cellphone;
    private String email;
    private Date birthDate;
    private String gender;
    private Address shippingAddress;
    private Address invoicingAddress;
    private ShoppingCart shoppingCart;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getCellphone() {
        return cellphone;
    }

    public void setCellphone(String cellphone) {
        this.cellphone = cellphone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Address getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(Address shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Address getInvoicingAddress() {
        return invoicingAddress;
    }

    public void setInvoicingAddress(Address invoicingAddress) {
        this.invoicingAddress = invoicingAddress;
    }

    public ShoppingCart getShoppingCart() {
        return shoppingCart;
    }

    public void setShoppingCart(ShoppingCart shoppingCart) {
        this.shoppingCart = shoppingCart;
    }
}
