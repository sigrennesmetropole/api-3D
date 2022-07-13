var BBox = require('bbox');
const fs = require('fs');
const Service = require('./Service');

const isBBoxLessThan10km2ElseReject = (bbox, reject) => {
    if(!!bbox){
        var fixed = BBox.create(bbox[0],bbox[1],bbox[2],bbox[3]);
        let area = Math.abs(fixed.height*fixed.width/1000000);
        if (area > 10) {
            reject(Service.rejectResponse(
                {description: "La taille de la BBOX est limitée à 10Km²", code: 400},
                400,
            ));
            return;
        };
    }
}

const getBBoxFromCodeInseeElseReject = (codeInsee, reject) => {
    let communes = JSON.parse(fs.readFileSync(__dirname+'/bbox_codeinsee.json'));
    for (let i = 0; i<communes.length; i++) {
        if (communes[i].code_insee == codeInsee) {
            return [communes[i].xmin, communes[i].ymin, communes[i].xmax, communes[i].ymax].map(Number);
        }
    }
    reject(Service.rejectResponse(
        {description: "Invalid input : <code_insee> not found", code: 400},
        400,
    ));
    return;
}

const getBBoxHeightAndWidth = (bbox) => {
    if(!!bbox){
        let fixed = BBox.create(bbox[0],bbox[1],bbox[2],bbox[3]);
        return {'height' : fixed.height, 'width' : fixed.width};
    };
}

module.exports = { isBBoxLessThan10km2ElseReject, getBBoxFromCodeInseeElseReject, getBBoxHeightAndWidth }