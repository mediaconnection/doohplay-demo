// app/ativar/page.tsx
export const dynamic = "force-dynamic"

export default function AtivarPage() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ativar DOOHPLAY</title>
        <style>{`
          * { margin:0; padding:0; box-sizing:border-box; }
          body {
            background:#0F172A;
            color:#F1F5F9;
            font-family:system-ui,sans-serif;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:100vh;
            padding:24px;
          }
          input {
            width:100%; max-width:420px;
            padding:22px 28px;
            font-size:32px; font-weight:700;
            text-align:center; letter-spacing:8px;
            background:#1E293B; color:#F1F5F9;
            border:2px solid #334155; border-radius:14px;
            outline:none; margin-bottom:20px;
            text-transform:uppercase;
            display:block;
          }
          input:focus { border-color:#3B82F6; }
          #btn {
            width:100%; max-width:420px;
            padding:22px; font-size:20px; font-weight:700;
            background:linear-gradient(135deg,#3B82F6,#6366F1);
            color:white; border:none; border-radius:14px;
            cursor:pointer; margin-bottom:20px;
            display:block;
          }
          #btn:focus { outline:3px solid #93C5FD; }
          #btn:disabled { opacity:0.5; }
          #status { font-size:15px; color:#94A3B8; min-height:24px; text-align:center; }
          .error { color:#EF4444 !important; }
          .success { color:#22C55E !important; }
        `}</style>
      </head>
      <body>
        <div style={{fontSize:42,fontWeight:900,marginBottom:8,letterSpacing:-1}}>
          DOOH<span style={{color:"#3B82F6"}}>PLAY</span>
        </div>
        <div style={{fontSize:16,color:"#94A3B8",marginBottom:48,textAlign:"center"}}>
          Digite o código da sua tela para ativar
        </div>

        <input
          id="code"
          type="text"
          placeholder="Ex: BARBE332"
          maxLength={20}
          autoFocus
        />

        <button id="btn">ATIVAR TELA</button>

        <div id="status"></div>

        <div style={{marginTop:32,fontSize:13,color:"#475569",textAlign:"center",maxWidth:380,lineHeight:1.6}}>
          O código foi enviado por WhatsApp ou email no momento do cadastro
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          var input  = document.getElementById('code');
          var btn    = document.getElementById('btn');
          var status = document.getElementById('status');

          setTimeout(function() { try { input.focus(); } catch(e){} }, 500);

          // Clique no botão
          btn.addEventListener('click', ativar);

          // Enter no input — move foco para o botão
          input.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter' || e.keyCode === 23) {
              e.preventDefault();
              btn.focus();
            }
          });

          // OK/Enter quando botão está focado
          btn.addEventListener('keydown', function(e) {
            if (e.keyCode === 13 || e.key === 'Enter' || e.keyCode === 23) {
              e.preventDefault();
              ativar();
            }
          });

          // Tecla OK global — só quando foco NÃO está no input
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
        `}} />
      </body>
    </html>
  )
}
