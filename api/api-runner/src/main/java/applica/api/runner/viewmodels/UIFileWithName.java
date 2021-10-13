package applica.api.runner.viewmodels;

import applica.api.services.utils.FileUtils;
import applica.framework.library.base64.URLData;

import java.io.InputStream;

public class UIFileWithName {
    private String mimeType;
    private byte[] byteArray;
    private String filename;
    private String base64String;


    public UIFileWithName() {}

    public UIFileWithName(byte[] toByteArray, String filename) {
        this.byteArray = toByteArray;
        this.filename = filename;
        this.mimeType = FileUtils.getMimeType(filename);
    }

    public UIFileWithName(InputStream inputStream, String filename) {
        base64String = new URLData(FileUtils.getMimeType(filename), inputStream).write();
        this.filename = filename;
        this.mimeType = FileUtils.getMimeType(filename);
    }

    public byte[] getByteArray() {
        return byteArray;
    }

    public void setByteArray(byte[] byteArray) {
        this.byteArray = byteArray;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getBase64String() {
        return base64String;
    }

    public void setBase64String(String base64String) {
        this.base64String = base64String;
    }
}
