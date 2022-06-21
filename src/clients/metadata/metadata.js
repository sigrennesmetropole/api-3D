
const axios = require('axios');
var convert = require('xml-js');
const config = {
  headers:{
    'accept': 'application/xml',
    'Accept': 'application/xml'
  }  
}
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


const retrieveMetadata = (url) => new Promise(
    async (resolve, reject) => {
      try {
        axios.get(url, config)
        .then(response => { 
          let data = createJson(response);
          resolve(data);
        })
        .catch(error => {
          reject(error)
        });
      } catch (e) {
        reject(Promise.reject(e));
      }
    }
);
const getMetadata = async () => {
  let result = [];
  for (const uuid of process.env['FILES_IDS'].split(",")){
    try {
    let metadata = await retrieveMetadata('https://public.sig.rennesmetropole.fr/geonetwork/srv/api/0.1/records/'+uuid);
    result.push(metadata);
    }catch (e) {
      console.log("Impossible de récupérer l'uuid "+ uuid);
      console.log(e);
    }
  }
  return {metadata: result}
};


 const createJson = (xml) => {
  var json = JSON.parse(convert.xml2json(xml.data,{compact: true}));
  let licence_text = "";
  let data = json['gmd:MD_Metadata']['gmd:identificationInfo']['gmd:MD_DataIdentification'];
  let contact = data['gmd:pointOfContact']['gmd:CI_ResponsibleParty']['gmd:contactInfo']['gmd:CI_Contact'];
  let adress =  contact['gmd:address']['gmd:CI_Address'];
  data['gmd:resourceConstraints']['gmd:MD_LegalConstraints']['gmd:useLimitation'].forEach((d, index) => {
    if (index != 0) {licence_text += " - "}
    licence_text +=  d['gco:CharacterString']._text;})
  let rue_text = "";
  contact['gmd:address']['gmd:CI_Address']['gmd:deliveryPoint'].forEach((d, index) => {
    if (index != 0) {rue_text += " - "}
    rue_text +=  d['gco:CharacterString']._text;})
  return {title : data['gmd:citation']['gmd:CI_Citation']['gmd:title']['gco:CharacterString']._text,
  abstract: data['gmd:abstract']['gco:CharacterString']._text,
  date_revision: data['gmd:citation']['gmd:CI_Citation']['gmd:date'].filter(d => d['gmd:CI_Date']['gmd:dateType']['gmd:CI_DateTypeCode']['_attributes'].codeListValue === "revision")[0]['gmd:CI_Date']['gmd:date']['gco:Date']._text,
  apercu: data['gmd:graphicOverview']['gmd:MD_BrowseGraphic']['gmd:fileName']['gco:CharacterString']._text,
  licence: licence_text,
  file: json['gmd:MD_Metadata']['gmd:fileIdentifier']['gco:CharacterString']._text,
  contact: {
    name: data['gmd:pointOfContact']['gmd:CI_ResponsibleParty']['gmd:organisationName']['gco:CharacterString']._text,
    adresse: {
      rue: rue_text,
      ville: adress['gmd:city']['gco:CharacterString']._text,
      codepostal: adress['gmd:postalCode']['gco:CharacterString']._text,
      pays: adress['gmd:country']['gco:CharacterString']._text
    },
    email: adress['gmd:electronicMailAddress']['gco:CharacterString']._text,
    phone: contact['gmd:phone']['gmd:CI_Telephone']['gmd:voice']['gco:CharacterString']._text
  }
}
 };

module.exports =  { getMetadata };