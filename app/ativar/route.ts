// app/ativar/route.ts
export const dynamic = "force-dynamic"

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ativar DOOHPLAY</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background:#0F172A; color:#F1F5F9;
  font-family:system-ui,sans-serif;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  height:100vh; padding:24px;
}
.logo { font-size:42px; font-weight:900; margin-bottom:8px; letter-spacing:-1px; }
.logo span { color:#3B82F6; }
input {
  width:100%; max-width:420px;
  padding:22px 28px;
  font-size:32px; font-weight:700;
  text-align:center; letter-spacing:8px;
  background:#1E293B; color:#F1F5F9;
  border:2px solid #334155; border-radius:14px;
  outline:none; margin-bottom:20px;
  text-transform:uppercase; display:block;
}
input:focus { border-color:#3B82F6; }
#btn {
  width:100%; max-width:420px;
  padding:22px; font-size:20px; font-weight:700;
  background:linear-gradient(135deg,#3B82F6,#6366F1);
  color:white; border:none; border-radius:14px;
  cursor:pointer; margin-bottom:20px; display:block;
}
#btn:focus { outline:3px solid #93C5FD; }
#btn:disabled { opacity:0.5; }
#status { font-size:15px; color:#94A3B8; min-height:24px; text-align:center; }
.error { color:#EF4444 !important; }
.success { color:#22C55E !important; }
</style>
</head>
<body>
<div class="logo">DOOH<span>PLAY</span></div>
<div style="font-size:16px;color:#94A3B8;margin-bottom:48px;text-align:center;">
  Digite o código da sua tela para ativar
</div>
<input id="code" type="text" placeholder="Ex: BARBE332" maxlength="20" autofocus>
<button id="btn">ATIVAR TELA</button>
<div id="status"></div>
<div style="margin-top:32px;font-size:13px;color:#475569;text-align:center;max-width:380px;line-height:1.6;">
  O código foi enviado por WhatsApp ou email no momento do cadastro
</div>
<script>
var input  = document.getElementById('code');
var btn    = document.getElementById('btn');
var status = document.getElementById('status');

setTimeout(function() { try { input.focus(); } catch(e){} }, 300);

btn.addEventListener('click', ativar);

input.addEventListener('keydown', function(e) {
  if (e.keyCode === 13 || e.keyCode === 23) {
    e.preventDefault();
    btn.focus();
  }
});

btn.addEventListener('keydown', function(e) {
  if (e.keyCode === 13 || e.keyCode === 23) {
    e.preventDefault();
    ativar();
  }
});

document.addEventListener('keydown', function(e) {
  if ((e.keyCode === 13 || e.keyCode === 23) && document.activeElement !== input) {
    e.preventDefault();
    ativar();
  }
});

function ativar() {
  var code = input.value.trim().toUpperCase();
  if (!code) {
    status.className = 'error';
    status.textContent = 'Digite o código da sua tela';
    input.focus();
    return;
  }
  if (btn.disabled) return;

  status.className = '';
  status.textContent = 'Verificando...';
  btn.disabled = true;

  fetch('https://doohplay.com.br/api/client/validate?code=' + encodeURIComponent(code))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.valid) {
        status.className = 'success';
        status.textContent = '✓ ' + data.name + ' — Ativando...';
        setTimeout(function() {
          try {
            if (typeof AndroidPlayer !== 'undefined') {
              AndroidPlayer.saveCode(code);
            } else {
              window.location.href = '/player?screen=' + code;
            }
          } catch(e) {
            status.className = 'error';
            status.textContent = 'Erro: ' + e.message;
            btn.disabled = false;
          }
        }, 1000);
      } else {
        status.className = 'error';
        status.textContent = 'Código inválido. Verifique e tente novamente.';
        btn.disabled = false;
        input.focus();
      }
    })
    .catch(function() {
      status.className = 'error';
      status.textContent = 'Erro de conexão. Verifique a internet.';
      btn.disabled = false;
    });
}
</script>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
