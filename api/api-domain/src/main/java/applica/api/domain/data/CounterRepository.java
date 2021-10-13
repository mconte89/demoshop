package applica.api.domain.data;

public interface CounterRepository {

    long countProfiles();
    long countFamilyMembers();
    long countParents();
    long countNegativeTests();
    long countUnknownTests();
    long countPositiveTests();
    long countContacts();

}
