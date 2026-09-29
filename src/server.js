import {database,initialize} from './db.js';
import {createApp} from './app.js';
import {createBot} from './bot.js';
import {boot,reporter} from './preflight.js';
import {STARTUP_TIMEOUT_MS} from './discord-connection.js';
import {listenHttp} from './startup-http.js';
const log=reporter();
let running;
// The early HTTP listener remains unavailable until every check has passed.
const deadline=setTimeout(()=>{log.line('BLOQUEADO','Tempo máximo de inicialização (180s) excedido. Aplicação NÃO liberada.');process.exit(1);},STARTUP_TIMEOUT_MS);
try{
 running=await boot({makePool:database,initialize,makeBot:createBot,makeApp:createApp,log,
  listen:listenHttp});
 clearTimeout(deadline);
}catch{clearTimeout(deadline);process.exit(1);}
for(const signal of ['SIGTERM','SIGINT'])process.once(signal,async()=>{running.server.close();await running.bot.stop();await running.pool.end();process.exit(0);});
