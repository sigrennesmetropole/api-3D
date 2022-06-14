const { exec } = require("child_process");
const c = require('../../config');

const exportData = (uuid,format) => new Promise((resolve, reject) => {
    try{
        exec(process.env.IMPORTER_EXPORTER_PATH+'/bin/impexp export'
        +' --db-host='+process.env.DB_HOST
        +' --db-port='+process.env.DB_PORT
        +' --db-name='+process.env.DB_DATABASE
        +' --db-username='+process.env.DB_USERNAME
        +' --db-password='+process.env.DB_PASSWORD
        +' -o '+uuid+format 
        +' --count=2'
        +' -b 1362167.0541,7224632.4696,1362877.1148,7225'
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
}
);

module.exports =  { exportData };