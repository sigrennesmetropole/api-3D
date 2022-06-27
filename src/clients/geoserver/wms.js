// const { exec } = require("child_process");
const { successResponse } = require("../../services/Service");
const axios = require('axios');
const config = {responseType: 'arraybuffer'}
if(!!process.env.https_proxy){
console.log("proxy activé")
const tunnel = require('tunnel');

const agent = tunnel.httpsOverHttp({
    proxy: {
    host: 'fr-proxy.resultinfra.com',
    port: 3128,
    },
})
    config.httpsAgent = agent;
    config.proxy = false;
};
const exportRasterWMS = (version, workspace, layers, bbox, witdh, height, srs, format) => new Promise(
    async (resolve, reject) => {
        try{
            let url = 'https://public.sig.rennesmetropole.fr/geoserver/raster/wms?service=WMS'
            + '&version=' + version
            + '&request=GetMap'
            + '&layers=' + workspace + '%3A' + layers
            + '&bbox=' + bbox.replace("/,/g","%2C")
            + '&width=' + witdh
            + '&height=' + height
            + '&srs=' + srs
            + '&format=' + format;
            
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

module.exports =  { exportRasterWMS };