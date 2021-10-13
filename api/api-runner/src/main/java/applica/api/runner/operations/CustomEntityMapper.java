package applica.api.runner.operations;

import applica.api.domain.utils.DomainFileUtils;
import applica.api.services.utils.FileUtils;
import applica.framework.Entity;
import applica.framework.fileserver.FileServer;
import applica.framework.library.base64.URLData;
import applica.framework.widgets.mapping.Attachment;
import applica.framework.widgets.mapping.AttachmentData;
import applica.framework.widgets.mapping.EntityMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.beanutils.PropertyUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Created by bimbobruno on 14/02/2017.
 */
public class CustomEntityMapper extends EntityMapper {


    @Autowired(required = false)
    private FileServer fileServer;

    public void attachmentToDataUrl(Entity source, ObjectNode destination, String sourceProperty, String destinationProperty) {

        Attachment file = null;
        try {
            file = (Attachment) PropertyUtils.getProperty(source, sourceProperty);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (file != null) {
            if (StringUtils.isNotEmpty(file.getPath())) {
                destination.putPOJO(destinationProperty, new AttachmentData(file.getName(), DomainFileUtils.generateFilePathForEntity(source, sourceProperty, false), false, file.getSize()));
            }
        }
    }

    public void attachmentsToDataUrl(Entity source, ObjectNode destination, String sourceProperty, String destinationProperty) {

        ArrayNode array = destination.putArray(destinationProperty);
        List<Attachment> files = null;
        try {
            files = (List<Attachment>) PropertyUtils.getProperty(source, sourceProperty);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (files != null && files.size() > 0) {
            for (Attachment attachment : files) {
                if (StringUtils.isNotEmpty(attachment.getPath())) {
                    array.addPOJO(new AttachmentData(attachment.getName(), DomainFileUtils.generateFilePathForEntity(source, sourceProperty, false), false, attachment.getSize()));
                }
            }
        }
    }

    public void dataUrlToAttachment(ObjectNode source, Entity destination, String sourceProperty, String destinationProperty, String path) {
        Objects.requireNonNull(fileServer, "Fileserver not injected");
        Objects.requireNonNull(destination, "Cannot convert entity to image: entity is null");
        Objects.requireNonNull(source, "Cannot convert entity to image: node is null");

        AttachmentData fileData = null;
        Attachment fileUrls = null;
        Attachment actualFiles;
        try {
            actualFiles = (Attachment) PropertyUtils.getProperty(destination, destinationProperty);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (source.get(sourceProperty) != null && !source.get(sourceProperty).isNull()) {
            JsonNode n = source.get(sourceProperty);
            fileData = new AttachmentData(n.get("filename").asText(), n.get("data").asText(), n.get("base64").asBoolean(), n.get("size").asInt());
        }

        if (fileData != null) {
            try {
                String filePath;
                if (fileData.isBase64()) {
                    URLData urlData = URLData.parse(fileData.getData());
                    filePath = fileServer.saveFile(path, FilenameUtils.getExtension(fileData.getFilename()), new ByteArrayInputStream(urlData.getBytes()));

                } else {
                    filePath = FileUtils.getFileserverPath(fileData.getData());
                }

                fileUrls = new Attachment(fileData.getFilename(), filePath, fileData.getSize());

            } catch (Exception e) {
                e.printStackTrace();
            }

        }
        try {
            PropertyUtils.setProperty(destination, destinationProperty, fileUrls);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (actualFiles != null && (fileUrls == null || !actualFiles.getPath().equals(fileUrls.getPath()))) {
            try {
                fileServer.deleteFile(actualFiles.getPath());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void dataUrlToAttachments(ObjectNode source, Entity destination, String sourceProperty, String destinationProperty, String path) {
        Objects.requireNonNull(fileServer, "Fileserver not injected");
        Objects.requireNonNull(destination, "Cannot convert entity to image: entity is null");
        Objects.requireNonNull(source, "Cannot convert entity to image: node is null");

        List<AttachmentData> fileDatas = new ArrayList<>();
        List<Attachment> fileUrls = new ArrayList<>();
        List<Attachment> actualFiles = new ArrayList<>();
        try {
            actualFiles = (List<Attachment>) PropertyUtils.getProperty(destination, destinationProperty);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (source.get(sourceProperty) != null && !source.get(sourceProperty).isNull()) {
            source.get(sourceProperty).forEach(n -> fileDatas.add(new AttachmentData(n.get("filename").asText(), n.get("data").asText(), n.get("base64").asBoolean(), n.get("size").asInt())));
        }

        if (fileDatas.size() > 0) {
            for (AttachmentData fileData : fileDatas) {
                try {
                    String filePath;
                    if (fileData.isBase64()) {
                        URLData urlData = URLData.parse(fileData.getData());
                        filePath = fileServer.saveFile(path, FilenameUtils.getExtension(fileData.getFilename()), new ByteArrayInputStream(urlData.getBytes()));
                    } else {
                        filePath = FileUtils.getFileserverPath(fileData.getData());
                    }

                    fileUrls.add(new Attachment(fileData.getFilename(), filePath, fileData.getSize()));

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

        }
        try {
            PropertyUtils.setProperty(destination, destinationProperty, fileUrls);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        if (actualFiles != null) {
            for (Attachment actualFile : actualFiles) {
                try {
                    if (fileUrls.stream().noneMatch(file -> file.getPath().equals(actualFile.getPath())))
                        fileServer.deleteFile(actualFile.getPath());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

}

