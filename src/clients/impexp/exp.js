const { exec } = require("child_process");
const c = require('../../config');


const exportData = (uuid, format, bbox, buildingID, limit, startIndex, texture, sqlSelect) => new Promise((resolve, reject) => {
    try{
        let options = ' --db-host=' + process.env.DB_HOST
        + ' --db-port=' + process.env.DB_PORT
        + ' --db-name=' + process.env.DB_DATABASE
        + ' --db-username=' + process.env.DB_USERNAME
        + ' --db-password="' + process.env.DB_PASSWORD+'"'
        if (texture === "oui" ) {
            options = options + ' -o ' + process.env['EXPORTER_SAVE_PATH'] + uuid + '.zip'
            + ' --compressed-format=' + format.slice(1); //remove point before file extension
        } else {
            options = options + ' -o ' + process.env['EXPORTER_SAVE_PATH'] + uuid + format
            + ' --no-appearance';
        }
        if (!!bbox) options = options + ' --bbox=' + bbox.toString().replace(/\s/g,'');
        if (!!buildingID) options = options + ' --resource-id=' + buildingID;
        if (!!limit) options = options + ' --count=' + limit;
        if (!!startIndex) options = options + ' --start-index=' + startIndex;
        if (!!sqlSelect) options = options + ' --sql-select=' + sqlSelect;
        console.log(process.env.IMPORTER_EXPORTER_PATH + '/bin/impexp export'
        + options)
        exec(process.env.IMPORTER_EXPORTER_PATH + '/bin/impexp export'
        + options
        , (error, stdout, stderr) => {
            if (error) {
                reject(`error: ${error.message}`);
            }
            if (stderr) {
                reject(`stderr: ${stderr}`);
            }
            resolve(`stdout: ${stdout}`)
        })
    }catch(e){
        reject (e.message);
    }
});

module.exports =  { exportData };