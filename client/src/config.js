var serviceBase = require("./service-url");

function getVersion() {
    return "1.0";
}

function getCopyright() {
    return "Applica SRL, 2020";
}

module.exports = {
    "service.url": `${serviceBase}`,
    "fs.url": `${serviceBase}fs`,
    "login.url": `${serviceBase}auth/login`,
    "account.url": `${serviceBase}account`,
    "account.register.url": `${serviceBase}account/register`,
    "account.recover.url": `${serviceBase}account/recover`,
    "account.reset.url": `${serviceBase}account/reset`,
    "account.confirm.url": `${serviceBase}account/confirm`,
    "grids.url": `${serviceBase}grids`,
    "entities.url": `${serviceBase}entities`,
    "entities.delete.url": `${serviceBase}entities/delete`,
    "values.url": `${serviceBase}values`,
    "values.entities.url": `${serviceBase}values/entities`,
    "account.requestRecoveryCode.url": `${serviceBase}account/sendConfirmationCode`,
    "account.validateRecoveryCode.url": `${serviceBase}account/validateRecoveryCode`,
    "account.resetPassword.url": `${serviceBase}account/resetPassword`,
    "account.resetUserPassword.url": `${serviceBase}account/resetUserPassword`,
    "system.url": `${serviceBase}system`,
    "revision.url": `${serviceBase}revision`,
    "backendVersion" : getVersion(),
    "copyrightInfos" : getCopyright()
}