import {load} from 'cheerio';
import fetch from 'node-fetch';
import LoginService from './LoginService.js'
import HeaderHelper from '../helpers/HeaderHelper.js'

function VideosService() {

  var headerVideosService;

  this.getHeaderVideosService = () => headerVideosService;

  this.getVideosId = async (responseLogin = false) => {
    if(responseLogin) headerVideosService = responseLogin.getHeader();

    const response = await fetch(process.env.PREFIX_VIDEO_URL, 
      {
        method: 'GET',
        headers: (responseLogin) ? headerVideosService.buildHeadersAsObject()
          : {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 OPR/96.0.0.0',
            'origin': process.env.DEFAULT_DOMAIN,
            'referer': process.env.DEFAULT_DOMAIN+'/',
          }
      }
    );
    
    const responseBodyText = await response.text();

    const $ = load(responseBodyText);

    const csrfTokenInput = $('meta[name="csrf-token"]');

    const loginInput = $('input[name="authenticity_token"]');

    if (validateIfLogged(loginInput, responseBodyText)) {
      return getArrayVideosId($);

    } else {
      const headerInvalidLogin = new HeaderHelper();

      response.headers.forEach((value, name) => {
        if (name == 'set-cookie') {
          headerInvalidLogin.addCookie(value);
        }
      });

      const loginUtil = new LoginService(headerInvalidLogin, process.env.LOGIN_URL);

      const loginResponse = await loginUtil.loginOnPlatform(loginInput.attr('value'), csrfTokenInput.attr('content'));

      return this.getVideosId(loginResponse);
    }
  }

  const validateIfLogged = (loginInput, responseBodyText) => {
    return !(loginInput.length > 0 && responseBodyText.includes('user_remember_me'));
  }
  
  const getArrayVideosId = ($) => {
    const videosContainer = $('div[data-reorderable-sort-url-value] > div[id]');
  
      let videosIdArray = [];
  
      videosContainer.each((i,item) => {
          let divUlContainer = $('div[data-action]', item)[0];
  
          let ulElement = $('ul', divUlContainer)[0];
            
          $('li', ulElement).each((i,liItem) => {
            let smallLiElement = $('small[class="text-slate-400 dark:text-zinc-400"]', liItem);
            if (smallLiElement[0]) {
              videosIdArray.push(liItem.attribs['data-id']);
            }
          });
      });
  
      return videosIdArray;
  };
}

export default VideosService;