package applica.api.services.responses;

import applica.framework.library.responses.Response;

/**
 * Created by bimbobruno on 19/05/2017.
 */
public class ErrorResponse extends Response {

    private final Object data;

    public ErrorResponse(int responseCode, Object data) {
        super(responseCode, data instanceof String ? String.valueOf(data) : null);
        this.data = data instanceof String? null : data;
    }

    public Object getData() {
        return data;
    }
}
