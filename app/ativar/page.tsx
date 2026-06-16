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
          .logo {
            font-size:42px;
            font-weight:900;
            margin-bottom:8px;
            letter-spacing:-1px;
          }
          .logo span { color:#3B82F6; }
          .sub {
            font-size:16px;
            color:#94A3B8;
            margin-bottom:48px;
            text-align:center;
          }
          input {
            width:100%;
            max-width:420px;
            padding:22px 28px;
            font-size:32px;
            font-weight:700;
            text-align:center;
            letter-spacing:8px;
            background:#1E293B;
            color:#F1F5F9;
            border:2px solid #334155;
            border-radius:14px;
            outline:none;
            margin-bottom:16px;
            text-transform:uppercase;
          }
          input:focus { border-color:#3B82F6; }
          button {
            width:100%;
            max-width:420px;
            padding:22px;
            font-size:20px;
            font-weight:700;
            background:linear-gradient(135deg,#3B82F6,#6366F1);
            color:white;
            border:none;
            border-radius:14px;
            cursor:pointer;
            margin-bottom:20px;
          }
          button:disabled { opacity:0.5; cursor:not-allowed; }
          #status {
            font-size:15px;
            color:#94A3B8;
            min-height:24px;
            text-align:center;
          }
          .error { color:#EF4444 !important; }
          .success { color:#22C55E !important; }
          .hint {
            margin-top:32px;
            font-size:13px;
            color:#475569;
            text-align:center;
            max-width:380px;
            line-height:1.6;
          }
        `}</style>
      </head>
      <body>
        <div className="logo" style={{fontSize:42,fontWeight:900,marginBottom:8,letterSpacing:-1}}>
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
          style={{
            width:"100%",maxWidth:420,padding:"22px 28px",
            fontSize:32,fontWeight:700,textAlign:"center",
            letterSpacing:8,background:"#1E293B",color:"#F1F5F9",
            border:"2px solid #334155",borderRadius:14,outline:"none",
            marginBottom:16,textTransform:"uppercase"
          }}
        />

        <button
          id="btn"
          style={{
            width:"100%",maxWidth:420,padding:22,fontSize:20,fontWeight:700,
            background:"linear-gradient(135deg,#3B82F6,#6366F1)",color:"white",
            border:"none",borderRadius:14,cursor:"pointer",marginBottom:20
          }}
        >
          ATIVAR TELA
        </button>

        <div id="status" style={{fontSize:15,color:"#94A3B8",minHeight:24,textAlign:"center"}}></div>

        <div style={{marginTop:32,fontSize:13,color:"#475569",textAlign:"center",maxWidth:380,lineHeight:1.6}}>
          O código foi enviado por WhatsApp ou email no momento do cadastro
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          var input = document.getElementById('code');
          var btn   = document.getElementById('btn');
          var status = document.getElementById('status');

          // Foco automático no input
          setTimeout(function() { input.focus(); }, 300);

          btn.addEventListener('click', ativar);
          input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') ativar();
          });

          function ativar() {
            var code = input.value.trim().toUpperCase();
            if (!code) {
              status.className = 'error';
              status.textContent = 'Digite o código da sua tela';
              return;
            }

            status.className = '';
            status.textContent = 'Verificando...';
            btn.disabled = true;

            fetch('/api/client/validate?code=' + code)
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.valid) {
                  status.className = 'success';
                  status.textContent = '✓ ' + data.name + ' — Ativando...';

                  // Salva o código via interface Android
                  setTimeout(function() {
                    try {
                      if (typeof AndroidPlayer !== 'undefined') {
                        AndroidPlayer.saveCode(code);
                      } else {
                        // Fallback: salva em localStorage para teste no browser
                        localStorage.setItem('screen_code', code);
                        window.location.href = '/player?screen=' + code;
                      }
                    } catch(e) {
                      status.textContent = 'Erro ao ativar: ' + e.message;
                    }
                  }, 1000);
                } else {
                  status.className = 'error';
                  status.textContent = 'Código inválido. Verifique e tente novamente.';
                  btn.disabled = false;
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
