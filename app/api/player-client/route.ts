export const dynamic = "force-dynamic"

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DOOHPLAY Player</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.logo{font-size:2rem;font-weight:800;color:#00ff88;margin-bottom:8px}
.sub{font-size:.9rem;color:#666;margin-bottom:32px}
.card{background:#111;border:1px solid #222;border-radius:16px;padding:28px;width:100%;max-width:480px;margin-bottom:16px}
label{font-size:.75rem;color:#555;text-transform:uppercase;display:block;margin-bottom:4px}
.val{font-size:.95rem;color:#eee;margin-bottom:16px}
select{background:#222;color:#fff;border:1px solid #333;border-radius:8px;padding:10px;width:100%;font-size:.9rem;margin-bottom:16px}
.btn{background:#00ff88;color:#000;border:none;border-radius:8px;padding:12px 24px;font-size:1rem;font-weight:700;cursor:pointer;width:100%}
.btn.stop{background:#ff4444;color:#fff}
.status{padding:12px 20px;border-radius:8px;font-size:.85rem;margin-bottom:12px;background:#ffaa0020;border:1px solid #ffaa0040;color:#ffaa00}
.ok{background:#00ff8820!important;border-color:#00ff8840!important;color:#00ff88!important}
.err{background:#ff444420!important;border-color:#ff444440!important;color:#ff4444!important}
.num{font-size:3rem;font-weight:800;color:#00ff88;text-align:center;margin:16px 0}
.numlabel{font-size:.8rem;color:#555;text-align:center}
</style>
</head>
<body>
<div class="logo">DOOHPLAY</div>
<div class="sub">Player Client</div>
<div class="card">
<label>Selecione a tela</label>
<select id="sel">
<option value="">-- Selecione --</option>
<option value="ANDROID-001|9de8b2b1-5ca7-4b6d-900d-983f7cded1bf|android_tv">ANDROID-001 - Android TV 1</option>
<option value="ANDROID-002|722ecf2d-42f6-4c13-92c8-b5536240e5dd|android_tv">ANDROID-002 - Android TV 2</option>
<option value="WIN-001|b141e172-276a-482d-828f-281f26174f3d|windows">WIN-001 - Windows</option>
<option value="RPI-001|6f2bd184-dc4b-4899-9dbe-251033492435|raspberry_pi">RPI-001 - Raspberry Pi 1</option>
<option value="RPI-002|7e111abc-4021-4c08-8eca-193d2ad20505|raspberry_pi">RPI-002 - Raspberry Pi 2</option>
</select>
<label>Player ID</label><div class="val" id="pid">-</div>
<label>Plataforma</label><div class="val" id="plat">-</div>
<button class="btn" id="btn" onclick="toggle()">Iniciar Player</button>
</div>
<div class="card">
<div class="status" id="sts">Aguardando inicio...</div>
<div class="num" id="cnt">0</div>
<div class="numlabel">eventos enviados</div>
<div style="margin-top:16px"><label>Ultimo ID</label><div class="val" id="eid">-</div></div>
</div>
<script>
const API='https://doohplay-demo.onrender.com/api/events/collect';
const PLAYERS=[
{code:'ANDROID-001',id:'9de8b2b1-5ca7-4b6d-900d-983f7cded1bf',platform:'android_tv'},
{code:'ANDROID-002',id:'722ecf2d-42f6-4c13-92c8-b5536240e5dd',platform:'android_tv'},
{code:'WIN-001',id:'b141e172-276a-482d-828f-281f26174f3d',platform:'windows'},
{code:'RPI-001',id:'6f2bd184-dc4b-4899-9dbe-251033492435',platform:'raspberry_pi'},
{code:'RPI-002',id:'7e111abc-4021-4c08-8eca-193d2ad20505',platform:'raspberry_pi'}
];
let player=null,running=false,timer=null,count=0;
document.getElementById('sel').onchange=function(){
var parts=this.value.split('|');
player=PLAYERS.find(function(p){return p.code===parts[0]})||null;
document.getElementById('pid').textContent=player?player.id:'-';
document.getElementById('plat').textContent=player?player.platform:'-';
};
function toggle(){
if(!player){alert('Selecione uma tela!');return;}
running=!running;
var btn=document.getElementById('btn');
if(running){btn.textContent='Parar Player';btn.className='btn stop';send();timer=setInterval(send,30000);}
else{btn.textContent='Iniciar Player';btn.className='btn';clearInterval(timer);setStatus('Pausado','');}
}
function send(){
setStatus('Enviando...','');
var payload=JSON.stringify({player_id:player.id,player_code:player.code,event_type:'AD_PLAY',duration_seconds:30,played_at:new Date().toISOString(),platform:player.platform});
var xhr=new XMLHttpRequest();
xhr.open('POST',API,true);
xhr.setRequestHeader('Content-Type','application/json');
xhr.onload=function(){
var d=JSON.parse(xhr.responseText);
count++;
document.getElementById('cnt').textContent=count;
document.getElementById('eid').textContent=d.id||'-';
setStatus('Evento enviado! Total: '+count,'ok');
};
xhr.onerror=function(){setStatus('Erro de conexao','err');};
xhr.send(payload);
}
function setStatus(msg,type){
var el=document.getElementById('sts');
el.className='status'+(type?' '+type:'');
el.textContent=msg;
}
</script>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}