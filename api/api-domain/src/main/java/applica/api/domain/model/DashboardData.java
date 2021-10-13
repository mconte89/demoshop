package applica.api.domain.model;

public class DashboardData {
    private long unknownTests;
    private long familyMembers;
    private long parents;
    private long positiveTests;
    private long negativeTests;
    private long contacts;

    public void setUnknownTests(long unknownTests) {
        this.unknownTests = unknownTests;
    }

    public long getUnknownTests() {
        return unknownTests;
    }

    public void setFamilyMembers(long familyMembers) {
        this.familyMembers = familyMembers;
    }

    public long getFamilyMembers() {
        return familyMembers;
    }

    public void setParents(long parents) {
        this.parents = parents;
    }

    public long getParents() {
        return parents;
    }

    public void setPositiveTests(long positiveTests) {
        this.positiveTests = positiveTests;
    }

    public long getPositiveTests() {
        return positiveTests;
    }

    public void setNegativeTests(long negativeTests) {
        this.negativeTests = negativeTests;
    }

    public long getNegativeTests() {
        return negativeTests;
    }

    public void setContacts(long contacts) {
        this.contacts = contacts;
    }

    public long getContacts() {
        return contacts;
    }
}
