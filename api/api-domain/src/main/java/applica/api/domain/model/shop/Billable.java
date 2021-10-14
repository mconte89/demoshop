package applica.api.domain.model.shop;

import java.util.List;

public interface Billable {
    String getCode();
    String getDescription();
    double getUnitPrice();
    double getDiscount();
    double getFinalPrice();

    // Analisi ancora in corso.
    // Serve alla gestione unificata di prodotti singoli, prodotti con opzioni e pacchetti
    // Ovvero di righe d'ordine composte da più voci
    // Valutare se necessaria classe diversa per le sottorighe o se è meglio ricorsiva 
    // List<BillableDetail> getDetails(); // null se articolo singolo, lista articoli scontati se pacchetto
}
