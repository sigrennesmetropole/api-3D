var BBox = require('bbox');
const fs = require('fs');
const Service = require('./Service');

const getCommuneDataElseReject = (codeInsee, reject) => {
    let communes = JSON.parse(fs.readFileSync(__dirname+'/bbox_codeinsee.json'));
    for (let i = 0; i<communes.length; i++) {
        if (communes[i].code_insee == codeInsee) {
            return communes[i]
        }
    }
    reject(Service.rejectResponse(
        {description: "Invalid input : <code_insee> not found", code: 400},
        400,
    ));
    return;
}

const isBBoxLessThanMaxSizeElseReject = (bbox, reject) => {
    if(!!bbox){
        var fixed = BBox.create(bbox[0],bbox[1],bbox[2],bbox[3]);
        let area = Math.abs(fixed.height*fixed.width/1000000);
        if (area > process.env.BBOX_MAX_SIZE) {
            reject(Service.rejectResponse(
                {description: "La taille de la BBOX est limitée à "+process.env.BBOX_MAX_SIZE+"Km²", code: 400},
                400,
            ));
            return;
        };
    }
}

const getBBoxFromCodeInseeElseReject = (codeInsee, reject) => {
    let commune = getCommuneDataElseReject(codeInsee, reject);
    return [commune.xmin, commune.ymin, commune.xmax, commune.ymax].map(Number);
}

const getBBoxHeightAndWidth = (bbox) => {
    if(!!bbox){
        let fixed = BBox.create(bbox[0],bbox[1],bbox[2],bbox[3]);
        return {'height' : fixed.height, 'width' : fixed.width};
    };
}

const getBBoxFromAny = (bbox, codeInsee, reject) => {
    if (!!codeInsee & !!bbox){
        reject(Service.rejectResponse(
          {description: "Invalid input : <bbox> and <code insee> are mutually exclusive", code: 400},
          400,
        ));
        return;
    }
    if (!!bbox){
        bbox  = bbox.split(',');
        isBBoxLessThanMaxSizeElseReject(bbox, reject);
        return bbox
    }
    if (!!codeInsee){
        return getBBoxFromCodeInseeElseReject(codeInsee, reject);
    }
    return [1330000, 7203000, 1368000, 7246000];
}

module.exports = {
    isBBoxLessThanMaxSizeElseReject,
    getBBoxFromCodeInseeElseReject,
    getBBoxHeightAndWidth,
    getBBoxFromAny,
    getCommuneDataElseReject
}