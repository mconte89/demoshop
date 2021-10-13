package applica.api.runner.controllers;


import applica.api.domain.model.Entities;
import applica.api.domain.model.TempAttachmentEntity;
import applica.api.facade.FileserverFacade;
import applica.api.runner.viewmodels.UIFileWithName;
import applica.api.services.utils.FileUtils;
import applica.framework.Repo;
import applica.framework.fileserver.FileServer;
import applica.framework.fileserver.MimeUtils;
import applica.framework.library.responses.Response;
import applica.framework.security.authorization.AuthorizationException;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import static applica.api.services.utils.FileUtils.*;

/**
 * Created by bimbobruno on 08/03/2017.
 */
@Controller
@RequestMapping("/fs")
public class FileServerController {

    @Autowired
    private FileServer fileServer;

    @RequestMapping("image")
    public void image(String path, String size, HttpServletResponse response) {
        try (InputStream inputStream = fileServer.getImage(path, size)) {
            if(inputStream == null) {
                response.setStatus(404);
            } else {
                String fileName = FilenameUtils.getName(path);
                String extension = FilenameUtils.getExtension(fileName);
                response.setContentLength(inputStream.available());
                response.setContentType(MimeUtils.getMimeType(extension));
                response.setHeader("Content-disposition", String.format("inline;filename=%s", fileName));
                response.setStatus(200);
                IOUtils.copy(inputStream, response.getOutputStream());
            }
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    @RequestMapping("file")
    public void file(String path, String size, HttpServletResponse response) {
        try (InputStream inputStream = fileServer.getImage(path, size)) {
            if(inputStream == null) {
                response.setStatus(404);
            } else {
                String fileName = FilenameUtils.getName(path);
                String extension = FilenameUtils.getExtension(fileName);
                response.setContentLength(inputStream.available());
                response.setContentType(MimeUtils.getMimeType(extension));
                response.setHeader("Content-disposition", String.format("inline;filename=%s", fileName));
                response.setStatus(200);
                IOUtils.copy(inputStream, response.getOutputStream());
            }
        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    @GetMapping("/renameAndDownload")
    public Response renameAndDownload(HttpServletResponse response, String filename, String path) {

        try {
            downloadAndRenameFile(filename, path, response);
            return new Response(Response.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new Response(Response.ERROR);
        }
    }

    /**
     * Tutti i controller accettano come parametro la stringa "path" (continua a chiamarsi così per questioni di retro-compatibilità con i vecchi client) che corrisponde al codice 'entityName_entityId_field_[extra]'
     * I controller che restituiscono un oggetto di tipo UIFileWithName restituiscono il base64 del file.
     */

    @Autowired
    private FileserverFacade fileserverFacade;

    private UIFileWithName renameAndDownload(String filename, String fileserverPath) {
        try (InputStream inputStream = fileserverFacade.getFile(fileserverPath)) {
            return new UIFileWithName(inputStream, StringUtils.hasLength(filename) ? filename : FilenameUtils.getName(fileserverPath));
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/encoded")
    public @ResponseBody
    UIFileWithName downloadEncodedFile(String filename, String path) {
        try {
            String fileserverPath = FileUtils.getFileserverPath(path);

            UIFileWithName fileWithName = renameAndDownload(filename, fileserverPath);
            new Thread(() -> {
                if (getEntityFromPath(path).equals(Entities.TEMP_ATTACHMENT_ENTITY)) {
                    fileserverFacade.checkTempAttachmentAfterDownload(path);
                }
            }).start();
            return fileWithName;
        } catch (AuthorizationException e) {
            e.printStackTrace();
        }
        return null;
    }


    @GetMapping("/")
    public void getFile(HttpServletResponse response, String filename, String path) {
        renameAndDownload(getEntityFromPath(path), getEntityIdFromPath(path), FileUtils.getFieldFromPath(path), filename, response);
    }

    @GetMapping("/{entity}/{entityId}/{field}")
    public void renameAndDownload(@PathVariable("entity") String entity, @PathVariable("entityId") String entityId, @PathVariable("field") String field, String filename, HttpServletResponse response) {
        try {
            String path = FileUtils.getPath(entity, entityId, field);
            downloadAndRenameFile(filename, path, response);
            new Thread(() -> {
                if (entity.equals(Entities.TEMP_ATTACHMENT_ENTITY)) {
                    fileserverFacade.deleteTempAttachment(Repo.of(TempAttachmentEntity.class).get(entityId).orElse(null));
                }
            }).start();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
