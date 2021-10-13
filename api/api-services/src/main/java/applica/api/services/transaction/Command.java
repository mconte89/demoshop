package applica.api.services.transaction;

public interface Command {

    void execute() throws Exception;
    void rollback() throws Exception;
}
