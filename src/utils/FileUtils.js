import fs from 'fs'
import {exec} from 'child_process'

function FileUtils() {
  this.createNewFolder = (rootPath, newFolderName) => {
    const folderFullName = rootPath + '/' + newFolderName;
    
    fs.mkdirSync(folderFullName, { recursive: true }, 
      (err) => { 
        if (err) throw err; 
      });

    return folderFullName;
  }

  this.openNewWriteStream = (rootPath, newFolderName) => {
    return fs.createWriteStream(rootPath + '/' + newFolderName)
  }

  this.joinAllTsFiles = async (videosSourceFolderPath, joinedTargetFolder, fileName, finalIndex) => {
    return new Promise((resolve, reject) => {
      const commands = [
        'cd \'' + videosSourceFolderPath + '\'',
        ' for i in `seq 0 ' + finalIndex + '`',
        ' do cat "video$i.ts" >> \'' + joinedTargetFolder + '/' + fileName + '.ts\'',
        ' done'
      ];
  
      exec(commands.join(';'), (error, stdout, stderr) => {
        if (error) {
            reject(`error: ${error.message}`);
        }
  
        if (stderr) {
            reject(`stderr: ${stderr}`);
        }
        
        console.log(`Arquivos .ts unificados em ${joinedTargetFolder + '/' + fileName + '.ts'}. Stdout: ${stdout}`);
        resolve();
      });
    });
  }

  this.deleteFolder = async (videosSourceFolderPath) => {
    return new Promise((resolve, reject) => {
      exec("rm -fdr '" + videosSourceFolderPath + "'", (error, stdout, stderr) => {
        if (error) {
          reject(`error: ${error.message}`);
        }
    
        if (stderr) {
            reject(`stderr: ${stderr}`);
        }
  
        console.log(`Exclusão do diretório temporário ${videosSourceFolderPath}. Stdout: ${stdout}`);
        resolve();
      });
    });
  }
}

export default new FileUtils()