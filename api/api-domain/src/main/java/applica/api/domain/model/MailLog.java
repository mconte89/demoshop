package applica.api.domain.model;

import applica.framework.AEntity;
import applica.framework.widgets.entities.EntityId;
import applica.framework.widgets.mapping.Attachment;
import java.util.Date;
import java.util.List;


@EntityId(Entities.MAIL_LOG)
public class MailLog extends AEntity {

    private String subject;
    private String recipient;
    private String sender;
    private Date date;
    private String log;
    private String text;
    private List<Attachment> attachments;

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getLog() {
        return log;
    }

    public void setLog(String log) {
        this.log = log;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public List<Attachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<Attachment> attachments) {
        this.attachments = attachments;
    }
}
