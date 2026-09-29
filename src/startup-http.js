import {createServer} from 'node:http';

// Expose a port to the hosting platform without exposing an uninitialized app.
export function createStartupGate(){
 let app=null,status='starting';
 return {
  handler(req,res){
   if(app)return app(req,res);
   res.writeHead(503,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Retry-After':'5','X-Content-Type-Options':'nosniff'});
   res.end(JSON.stringify({status,message:status==='starting'?'O serviço está iniciando. Aguarde a conclusão das verificações.':'O serviço está temporariamente indisponível.'}));
  },
  activate(handler){if(typeof handler!=='function')throw new TypeError('Aplicação HTTP inválida.');app=handler;},
  fail(){app=null;status='unavailable';}
 };
}

export function listenHttp(handler,port){
 return new Promise((resolve,reject)=>{
  const server=createServer(handler);
  server.once('error',reject);
  server.listen(port,'0.0.0.0',()=>{server.off('error',reject);resolve(server);});
 });
}
