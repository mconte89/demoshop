package applica.api.facade;

import applica.api.domain.data.geo.GeoCityRepository;
import applica.api.domain.data.geo.GeoNationRepository;
import applica.api.domain.data.geo.GeoProvinceRepository;
import applica.api.domain.model.Filters;
import applica.api.domain.model.csv.CsvInfo;
import applica.api.domain.model.csv.CsvReader;
import applica.api.domain.model.csv.RowData;
import applica.api.domain.model.csv.RowValidator;
import applica.api.domain.model.csv.csvRowValidator.GeoCityRowValidator;
import applica.api.domain.model.csv.csvRowValidator.GeoNationRowValidator;
import applica.api.domain.model.csv.csvRowValidator.GeoProvinceRowValidator;
import applica.api.domain.model.geo.*;
import applica.api.services.GeoCityService;
import applica.api.services.GeoNationService;
import applica.api.services.GeoProvinceService;
import applica.api.services.exceptions.CsvValidationException;
import applica.api.services.utils.FileUtils;
import applica.framework.Query;
import applica.framework.Repo;
import applica.framework.fileserver.viewmodel.UIFileUpload;
import applica.framework.library.options.OptionsManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.InputStream;
import java.util.List;

@Component
public class GeoFacade {

    private final String CITY = "city";
    private final String PROVINCE = "province";
    private final String NATION = "nation";

    @Autowired
    private OptionsManager optionsManager;

    @Autowired
    private GeoCityRepository geoCityRepository;

    @Autowired
    private GeoProvinceRepository geoProvinceRepository;

    @Autowired
    private GeoNationRepository geoNationRepository;


    @Autowired
    private GeoCityService geoCityService;

    @Autowired
    private GeoProvinceService geoProvinceService;

    @Autowired
    private GeoNationService geoNationService;


    public void importGeoEntities() {
        try {

            System.out.println("Check " + NATION);
            importGeoEntity(NATION);

            System.out.println("Check " + PROVINCE);
            importGeoEntity(PROVINCE);

            System.out.println("Check " + CITY);
            importGeoEntity(CITY);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    public void importGeoEntity(String entity) throws Exception {
        GeoEntity geoEntity = getFirstGeoEntityForCheck(entity);

        System.out.println(entity + " has to be imported: " + (geoEntity == null));
        if (geoEntity == null) {
            UIFileUpload uiFileUpload = new UIFileUpload();

            String filename = getGeoEntityCsvName(entity);
            InputStream i = FileUtils.getResourceFileInputStream(String.format("/csv/%s.csv", filename));
            String path = FileUtils.moveToTempPath(optionsManager, i, filename + ".csv");
            uiFileUpload.setPath(path);

            importEntities(entity, uiFileUpload);

            File finalFile = new File(path);
            new Thread(() -> {
                if (finalFile != null && finalFile.exists()) {
                    finalFile.delete();
                }
            }).start();

        }
    }

    private String importEntities(String entity, UIFileUpload csvFile) throws CsvValidationException {
        /*
        Sposto il csv in una cartella temporanea (dato che mi serve un percorso assoluto per utilizzare il csvImporter)
         */
        Integer count = 0;

        //salvo il file nella directory temporanea del file server
        String csvPath = csvFile.getPath();
        RowValidator geoCityRowValidator = getRowValidatorForEntity(entity);

        CsvReader reader = new CsvReader(csvPath, ";", geoCityRowValidator);
        CsvInfo csvReadOutput = reader.readFile();
        if (StringUtils.hasLength(csvReadOutput.getError())) {
            //errori di parse del file
            throw new CsvValidationException(csvReadOutput.getError());
        }
        else if (csvReadOutput.getNonValidatedRowIndexes() != null & (csvReadOutput.getNonValidatedRowIndexes().size() >= csvReadOutput.getImportedTableRows().size())) {
            //non vi è alcuna riga valida nel file
            throw new CsvValidationException("Il csv non presenta alcun elemento valido per l'importazione!");
        }

        //dopo aver validato le righe del CSV, creo le entità a partire da esse
        List<RowData> rows = csvReadOutput.getImportedTableRows();

        for (RowData rowData: rows) {

            importRow(entity, rowData);

            count+=1;

        }

        return count.toString();
    }

    private void importRow(String entity, RowData rowData) {

        switch (entity) {
            case CITY:
                String name = rowData.getData().get(GeoCityRowValidator.NAME);
                String cap = rowData.getData().get(GeoCityRowValidator.POSTAL_CODE);
                String province = rowData.getData().get(GeoCityRowValidator.PROVINCE_CODE);
                String istat = rowData.getData().get(GeoCityRowValidator.ISTAT_CODE);

                GeoCity geoCity = geoCityService.getByPostalCode(cap);

                if(geoCity == null) {
                    geoCity = new GeoCity();
                }

                geoCity.setDescription(name);
                geoCity.setCap(cap);
                geoCity.setProvince(geoProvinceService.getByCode(province));
                geoCity.setIstatCode(istat);

                geoCityService.save(geoCity);
                break;
            case PROVINCE:
                String code = rowData.getData().get(GeoProvinceRowValidator.CODE);
                name = rowData.getData().get(GeoProvinceRowValidator.NAME);
                String regionCode = rowData.getData().get(GeoProvinceRowValidator.REGION);
                String nationCode = rowData.getData().get(GeoProvinceRowValidator.NATION_CODE);

                GeoProvince geoProvince = geoProvinceService.getByCode(code);

                if(geoProvince == null) {
                    geoProvince = new GeoProvince();
                }

                geoProvince.setDescription(name);
                geoProvince.setCode(code);
                GeoRegion region = Repo.of(GeoRegion.class).find(Query.build().eq(Filters.DESCRIPTION, regionCode)).findFirst().orElse(null);
                if (region == null) {
                    region = new GeoRegion();
                    region.setDescription(regionCode);
                    region.setNation(geoNationService.getByCode(nationCode));
                    Repo.of(GeoRegion.class).save(region);
                }
                geoProvince.setRegion(region);

                geoProvinceService.save(geoProvince);
                break;
            case NATION:
                code = rowData.getData().get(GeoNationRowValidator.CODE);
                String description = rowData.getData().get(GeoNationRowValidator.DESCRIPTION);

                GeoNation geoNation = geoNationService.getByCode(code);

                if(geoNation == null) {
                    geoNation = new GeoNation();
                }

                geoNation.setDescription(description);
                geoNation.setCode(code);

                geoNationService.save(geoNation);
                break;
        }

    }

    private RowValidator getRowValidatorForEntity(String entity) {

        switch (entity) {
            case CITY:
                return new GeoCityRowValidator();
            case PROVINCE:
                return new GeoProvinceRowValidator();
            case NATION:
                return new GeoNationRowValidator();
        }
        return null;
    }

    private String getGeoEntityCsvName(String entity) {

        switch (entity) {
            case CITY:
                return "geoCities";
            case PROVINCE:
                return "geoProvinces";
            case NATION:
                return "geoNations";
        }
        return "";
    }

    private GeoEntity getFirstGeoEntityForCheck(String entity) {
        switch (entity) {
            case CITY:
                return geoCityRepository.find(Query.build().page(1).rowsPerPage(1)).findFirst().orElse(null);
            case PROVINCE:
                return geoProvinceRepository.find(Query.build().page(1).rowsPerPage(1)).findFirst().orElse(null);
            case NATION:
                return geoNationRepository.find(Query.build().page(1).rowsPerPage(1)).findFirst().orElse(null);
        }
        return null;

    }
}
