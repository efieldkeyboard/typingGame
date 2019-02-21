var http = require('http');
var fs = require('fs');

http.createServer(reqHandler).listen(50607);


function reqHandler(request, response){
  console.log('received request for ' + request.url);
 var popName = request.url.split('/').pop();
 var fileType = '';
 var fileName = '';
 
 switch(request.url.split('.').pop()){
  case '/':
   fileType = 'text/html';
   fileName = 'index.html';
   break;
   
  case 'jpg':
   fileType = 'image/jpg';
   fileName = './images/' + popName;
   break;
   
  case 'png':
   fileType = 'image/png';
   fileName = './images/' + popName;
   break;
   
  case 'ico':
   fileType = 'image/x-icon';
   fileName = './images/' + popName;
   break;
   
  case 'gif':
   fileType = 'image/gif';
   fileName = './images/' + popName;
   break;
   
  case 'html':
   fileType = 'text/html';
   fileName = './html/' + popName;
   break;
   
  case 'css':
   fileType = 'text/css';
   fileName = './css/' + popName;
   break;
   
  case 'js':
   fileType = 'application/javascript';
   fileName = './scripts/' + popName;
   break;
   
  case 'JSON':
   fileType = 'application/json';
   fileName = './json/' + popName;
   break;
   
  default:
   break;
 }
 resWriter(response, fileType, fileName);
}


function resWriter(res, ftype, fname){
 fs.readFile(fname, null, function(error, data){
  if(error){
   res.writeHead(404);
   res.write('file not found');
  } else {
   res.writeHead(200, {'Content-type': ftype});
   res.write(data);
  }
  res.end();
 });
}