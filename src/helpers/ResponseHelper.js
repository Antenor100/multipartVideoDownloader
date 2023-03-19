function ReponseHelper() {
  var header;
  
  this.setHeader = (h) => {
    header = h;
  }

  this.getHeader = () => {
    return header;
  }
}

export default ReponseHelper;