// Gestionnaire des fichiers lourds téléchargeables.
// Lorsqu'un export 3D est trop lourd pour être diffusé en direct, un fichier est créé et déposé sur serveur. L'utilisateur dispose alors de l'URL de téléchargement du fichier.
// Le gestionnaire doit supprimer les fichiers lorsqu'ils ont dépassé la durée de rétention paramétrée

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class TempDwnldFilesManager {
  constructor() {
    this.folder = path.join(process.env['DOWNLD_PATH'], process.env['DOWNLD_FOLDERNAME']);
    this.startManagement();
  }

  startManagement() {
    var t = this;
    let timer = setInterval(function(){t.checkFiles(t.folder);}, 600000); // 600000 = 10 minutes
  }

  checkFiles(_folder) {
    try{
      let filenames = fs.readdirSync(_folder);
      let refTime = new Date().getTime() - process.env['DOWNLD_RETENTION_MIN'] * 60 * 1000;
      for (var i=0; i<filenames.length; i++) {
        let file = path.join(process.env['DOWNLD_PATH'], process.env['DOWNLD_FOLDERNAME'], filenames[i] );
        if (fs.statSync(file)["birthtimeMs"] < refTime) {
          logger.info('Suppression du fichier  ' + filenames[i]);
          fs.unlinkSync(file);
        }
      }
    } catch (err) {
      logger.error("Erreur du gestionnaire de fichiers téléchargeables temporaires");
      logger.info(err);
    }
  }
}

module.exports = TempDwnldFilesManager;