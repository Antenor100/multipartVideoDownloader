import initConfig from './config/config.js'
import VideosService from './services/VideosService.js'
import DownloadService from './services/DownloadService.js'

initConfig();

main();

async function main() {
  try {
    const videosService = new VideosService();
    const videosId = await videosService.getVideosId()

    const downloadService = new DownloadService();
    await downloadService.downloadVideos(videosId, videosService.getHeaderVideosService(), process.env.PATH_DOWNLOAD)

  } catch (error) {
    console.log(error);
  }
};