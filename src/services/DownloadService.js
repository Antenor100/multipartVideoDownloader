import fetch from 'node-fetch';
import {load} from 'cheerio';
import FileUtils from '../utils/FileUtils.js';

function DownlaodService() {
  this.downloadVideos = async (arrayVideosId, header, path) => {
    
    for (const videoId of arrayVideosId) {
      const videoUrl = `${process.env.PREFIX_VIDEO_URL}/${videoId}`;

      const response = await fetch(videoUrl, 
        {
          method: 'GET',
          headers: header.buildHeadersAsObject()
        }
      );
      
      const responseBodyText = await response.text();
  
      const $ = load(responseBodyText);
      
      const videoName = $('h2').contents().first().text();

      console.log('\n\n\nBaixando: ' + videoName);

      const videoElement = $('div[class="aspect-w-16 aspect-h-9 relative z-20"]')

      if (header.getHeader('referer')) {
        header.setHeader('referer', videoUrl);
      } else {
        header.addHeader({referer:videoUrl});
      }

      const playListUrl = process.env.SECRET_URL_VIDEO_HOST + '/' + videoElement.attr('data-panda-player-url-value').split('?v=')[1] + '/1920x1080/video.m3u8'

      const responsePlaylist = await fetch(playListUrl,
        {
          method: 'GET',
          headers: header.buildHeadersAsObject()
        }
      );

      const responsePlaylistText = await responsePlaylist.text();

      const arrayVideosLink = responsePlaylistText.split('\n').filter((line)=>{
        return line.includes('https')
      });

      const videoFolderFullName = FileUtils.createNewFolder(path, videoName);

      const tenPercentOfIndexLength = arrayVideosLink.length / 10

      let actualTenMultiplePercent = 0;

      for (const [index, videoLink] of arrayVideosLink.entries()) {
        const file = FileUtils.openNewWriteStream(videoFolderFullName, `video${index}.ts`);

        const videoResponse = await fetch(videoLink,
          {
            method: 'GET',
            headers: header.buildHeadersAsObject()
          }
        );
        
        await new Promise((resolve, reject) => {
          videoResponse.body.pipe(file);
          
          videoResponse.body.on("error", (err) => {
            reject(err);
          });
          
          file.on("finish", function() {
            resolve();
          });

          const indexRestOfTenPercent = index / tenPercentOfIndexLength
          
          if (parseInt(indexRestOfTenPercent) > actualTenMultiplePercent && index > 0 && actualTenMultiplePercent < 9) {
            ++actualTenMultiplePercent;
            console.log('Download\s em: ' + actualTenMultiplePercent*10 + '%')
          }
        });
      }

      console.log('Download\`s do video => \"' + videoName + '\" concluídos');

      await FileUtils.joinAllTsFiles(videoFolderFullName, path, videoName, arrayVideosLink.length-1);

      await FileUtils.deleteFolder(videoFolderFullName);
    }
  }
}

export default DownlaodService