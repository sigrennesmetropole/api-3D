// const { exec } = require("child_process");
const { successResponse } = require("../../services/Service");
const axios = require('axios');
const config = {responseType: 'arraybuffer'}

if (!!process.env.PROXY_HOST){
    console.log("proxy activé")
    const tunnel = require('tunnel');

    const agent = tunnel.httpsOverHttp({
        proxy: {
        host: process.env.PROXY_HOST,
        port: process.env.PROXY_PORT,
        },
})
    config.httpsAgent = agent;
    config.proxy = false;
};
const exportVectorWFS = (version, typeName, bbox, srs, f) => new Promise(
    async (resolve, reject) => {
        try{
            let url = 'https://public.sig.rennesmetropole.fr/geoserver/ows?request=GetFeature&service=WFS'
            + '&version=' + version
            + '&typeName=' + typeName
            + '&bbox=' + bbox.toString().replace(/,/g,"%2C")
            + '&srs=' + srs
            + '&outputFormat=' + f;
            
            axios.get(url, config)
                .then(res => {
                    resolve(res.data);
                })
                .catch(error => {
                    reject(error.message);
                });
        }catch(e){
            reject(e.message);
        }
    }
);

module.exports =  { exportVectorWFS };