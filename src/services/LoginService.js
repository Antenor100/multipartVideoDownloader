import https from 'https';
import HeaderHelper from '../helpers/HeaderHelper.js'
import ResponseService from '../helpers/ResponseHelper.js'

function LoginService(headerInvalidLogin, linkLogin) {
  this.loginOnPlatform = async (authenticityToken, csrfToken) => {
    const details = {
      'authenticity_token': authenticityToken,
      'user[email]': process.env.EMAIL,
      'user[password]': process.env.PASSWORD,
      'user[remember_me]': true,
      'commit': 'Login'
    };
  
    let formBody = [];
  
    for (var property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
  
    formBody = formBody.join("&");
  
    const response = new Promise((resolve) => {
      const req = https.request(linkLogin, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrfToken,
          'cookie': headerInvalidLogin.getCookies().join(';')
        }
      }, (res) => {
        resolve({status: res.statusCode, headers: res.headers});
      });
  
      req.on("error", (e) => {
        throw new Error(e);
      });
  
      req.write(formBody);
  
      req.end();
    });
  
    const loginResponse = await response;
  
    if ((loginResponse.status == 200 || loginResponse.status == 302) && loginResponse.headers["set-cookie"].length > 1) {
      const responseServiceLogin = new ResponseService();
      responseServiceLogin.setHeader(saveLoginHeadersAndCookies(loginResponse));
      
      return responseServiceLogin;
  
    } else {
      throw new Error(loginResponse.status + ' Erro ao tentar logar na plataforma. Verifique credenciais, endereços e cookies!')
    }
  }

  const saveLoginHeadersAndCookies = (response) => {
    const headerHelper = new HeaderHelper();

    Object.entries(response.headers).forEach(([name, value]) => {
      if (name == 'set-cookie') {
        if (!Array.isArray(value)) value = [value]; 
  
        value.forEach(headerCookies => {
          headerCookies = headerCookies.split(';');
  
          headerCookies.forEach(cookie => {
            headerHelper.addCookie(cookie);
          });
        });
  
      } else {
        headerHelper.addHeader({[name]: value})
      }
    });

    return headerHelper;
  }
}

export default LoginService;