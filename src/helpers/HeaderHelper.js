function HeaderHelper() {
  var headers = [];
  var cookies = [];
  
  this.setHeader = (headerName, headerNewValue) => {
    let headerIndex = -1;
    
    headers.forEach((header, index) => {
      if (header[headerName]) headerIndex = index;
    });
    
    if (headerIndex >= 0) {
      headers[headerIndex][headerName] = headerNewValue;
    }
  }

  this.getHeader = (headerName) => {
    let headerIndex = -1;

    headers.forEach((header, index) => {
      if (header[headerName]) headerIndex = index;
    });
    
    if (headerIndex >= 0) {
      return headers[headerIndex];
    } else {
      return undefined;
    }
  }

  this.addHeader = (header) => {
    headers.push(header);
  }

  this.getHeadersAsObjectArray = () => {
    return headers;
  }

  this.addCookie = (cookie) => {
    cookies.push(cookie);
  }

  this.getCookies = () => {
    return cookies;
  }

  this.buildHeadersAsObject = () => {
    let headersObj = {};
  
    headers.forEach(header => {
      headersObj[Object.entries(header)[0][0]] = Object.entries(header)[0][1];
    });
  
    headersObj.cookie = cookies.join(';');
  
    if (headersObj.referer == undefined) headersObj.referer = process.env.LOGIN_URL;
  
    return headersObj;
  }
}

export default HeaderHelper;