package applica.api.services.impl;


import applica.api.domain.model.MailLog;
import applica.api.domain.model.auth.AppPermissions;
import applica.api.domain.model.auth.User;
import applica.api.services.MailService;
import applica.framework.Repo;
import applica.framework.fileserver.FileServer;
import applica.framework.library.mail.MailUtils;
import applica.framework.library.mail.Recipient;
import applica.framework.library.mail.TemplatedMail;
import applica.framework.library.options.OptionsManager;
import applica.framework.library.utils.ProgramException;
import applica.framework.library.utils.SystemOptionsUtils;
import applica.framework.security.Security;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.tika.utils.SystemUtils;
import org.jsoup.helper.StringUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class MailServiceImpl implements MailService {

    private Log logger = LogFactory.getLog(getClass());

    @Autowired
    private OptionsManager optionsManager;

    @Autowired
    private FileServer fileServer;

    @Override
    public TemplatedMail createMail(String templatePath, int mailType, String subject, Map<String, Object> data) {
        TemplatedMail mail = new TemplatedMail();
        mail.setOptions(optionsManager);
        mail.setMailFormat(mailType);
        mail.setTemplatePath(templatePath);
        mail.setFrom(optionsManager.get("registration.mail.from"));
        mail.setSubject(subject);
        for (String key: data.keySet()) {
            mail.put(key, data.get(key));
        }
        return mail;
    }



    @Override
    public void sendSimpleMail(String mail, String text) {
        Map<String, Object> data = new HashMap<>();

        data.put("text", text);

        Recipient recipient = new Recipient();
        recipient.setRecipient(mail);
        sendMail(createMail("mailTemplates/simpletext.vm", TemplatedMail.HTML, "Test", data), Collections.singletonList(recipient));
    }




    @Override
    public void sendActivationMail(User user, String defaultPassword) {
        Map<String, Object> data = new HashMap<>();

        data.put("password", defaultPassword);
        data.put("user", user);

        Recipient recipient = new Recipient();
        recipient.setRecipient(user.getMail());

        if (Security.with(user).isPermitted(AppPermissions.CAN_USE_WEBAPP)) {
            String loginUrl = String.format("%s#/login", optionsManager.get("frontend.public.url"));
            data.put("loginUrl", loginUrl);

        }

        if (Security.with(user).isPermitted(AppPermissions.CAN_USE_MOBILE)) {
            data.put("androidUrl", optionsManager.get("store.url.android"));
            data.put("appleUrl", optionsManager.get("store.url.apple"));
        }

        sendMail(createMail("mailTemplates/userActivation.vm", TemplatedMail.HTML, optionsManager.get("registration.mail.subject"), data), Collections.singletonList(recipient));
    }

    @Override
    public void createAndSendMail(String template, int mailType, String subject, List<Recipient> recipients, Map<String, Object> data) {

        sendMail(createMail(template, mailType, subject, data), recipients);
    }

    private String getAllRecipientsToString(TemplatedMail mail) {
        if (mail.getRecipients() != null) {
          return StringUtil.join(mail.getRecipients().stream().map(Recipient::getRecipient).collect(Collectors.toList()), ",");
        }
        return "";
    }

    //Ottiene la lista di oggetti di tipo Recipient da una lista di utenti passata in parametro, a patto che abbiano il campo "mail" valorizzato
    private List<Recipient> getRecipientsFromUserList(List<User> recipients) {
        if (recipients != null) {
            recipients.removeIf(user -> !MailUtils.isValid(user.getMail()));
            return recipients.stream().map(r -> new Recipient(r.getMail(), Recipient.TYPE_TO)).collect(Collectors.toList());
        }
        return null;
    }


    //TODO:lambda
    @Override
    public void sendMail(TemplatedMail mail, List<Recipient> recipients) {

        if (optionsManager.get("testmode").equals("ON")) {
            for (Recipient recipient: recipients) {
                recipient.setRecipient(optionsManager.get("testmode.recipient.mail"));
            }
        }
        String recipientString = recipients.stream().map(Recipient::getRecipient).collect(Collectors.joining(", "));
        try {
            mail.setRecipients(recipients);
            mail.send();
            generateMailLog(mail, recipients, "OK", mail.getFrom());
            logger.info(String.format("Email '%s' correttamente inviata in data %s a %s", mail.getSubject(), new Date(), recipientString));
        } catch (Exception e) {
            e.printStackTrace();
            generateMailLog(mail, recipients, String.format("Errore: %s", e.getMessage()),  mail.getFrom());

            throw new ProgramException(String.format("Errore durante l'invio della mail '%s' a %s: %s", mail.getSubject(), recipientString,e.getMessage()));

        }
    }

    private void generateMailLog(TemplatedMail mail, List<Recipient> recipient, String messageLog, String sender) {
        if (!SystemOptionsUtils.isEnabled("log.email"))
            return;
        MailLog log = new MailLog();
        log.setDate(new Date());
        log.setSender(sender);
        log.setSubject(mail.getSubject());
        log.setLog(messageLog);
        log.setRecipient(recipient.stream().map(Recipient::getRecipient).collect(Collectors.joining(", ")));
        log.setText(mail.getMailText());
//        if (mail.getAttachmentList() != null && mail.getAttachmentList().size() > 0){
//            List<Attachment> attachments = new ArrayList<>();
//            for (Attachment a: mail.getAttachmentList()
//            ) {
//                try {
//                    Attachment attachment = new Attachment(a.getName(), fileServer.copyFile(a.getPath(), "files/mailLog"), a.getSize());
//                    attachments.add(attachment);
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//            log.setAttachments(attachments);
//        }
        Repo.of(MailLog.class).save(log);
    }


}
