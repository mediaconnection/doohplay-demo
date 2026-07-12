import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  const html = [
    '<!DOCTYPE html>',
    '<html lang="pt-BR">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Guia de Instalacao - DOOHPLAY</title>',
    '<style>',
    '* { margin:0; padding:0; box-sizing:border-box; }',
    'body { font-family:system-ui,sans-serif; background:#0F172A; color:#F1F5F9; min-height:100vh; }',
    '.header { background:#1E293B; padding:40px 24px; text-align:center; border-bottom:1px solid #334155; }',
    '.logo { font-size:28px; font-weight:900; color:#F9FAFB; margin-bottom:16px; }',
    '.logo span { color:#3B82F6; }',
    'h1 { font-size:22px; font-weight:700; margin-bottom:8px; }',
    '.sub { font-size:14px; color:#94A3B8; }',
    '.container { max-width:680px; margin:0 auto; padding:32px 24px; }',
    '.section { margin-bottom:36px; }',
    '.section-title { font-size:12px; font-weight:700; color:#3B82F6; text-transform:uppercase; letter-spacing:1px; margin-bottom:20px; }',
    '.step { display:flex; gap:16px; margin-bottom:20px; }',
    '.num { width:36px; height:36px; border-radius:50%; background:#3B82F6; color:white; font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
    '.content { flex:1; padding-top:4px; }',
    '.step-title { font-size:16px; font-weight:700; color:#F1F5F9; margin-bottom:6px; }',
    '.step-desc { font-size:14px; color:#94A3B8; line-height:1.6; }',
    '.step-desc b { color:#F1F5F9; }',
    '.code-box { background:#0F172A; border:1px solid #334155; border-radius:10px; padding:16px; margin-top:12px; font-size:24px; color:#3B82F6; font-weight:900; letter-spacing:4px; text-align:center; }',
    '.tip { background:#1E293B; border-left:3px solid #3B82F6; border-radius:8px; padding:12px 14px; margin-top:12px; font-size:13px; color:#94A3B8; line-height:1.6; }',
    '.warn { background:#1E293B; border-left:3px solid #F59E0B; border-radius:8px; padding:12px 14px; margin-top:12px; font-size:13px; color:#94A3B8; line-height:1.6; }',
    '.divider { height:1px; background:#1E293B; margin:28px 0; }',
    '.success { background:#052e16; border:1px solid #166534; border-radius:12px; padding:24px; text-align:center; }',
    '.success h3 { font-size:18px; font-weight:700; color:#4ade80; margin-bottom:8px; }',
    '.success p { font-size:14px; color:#86efac; line-height:1.6; }',
    '.contact { background:#1E293B; border-radius:12px; padding:24px; text-align:center; margin-top:32px; }',
    '.contact h3 { font-size:16px; font-weight:700; margin-bottom:8px; }',
    '.contact p { font-size:14px; color:#94A3B8; line-height:1.6; }',
    '.contact a { color:#3B82F6; text-decoration:none; }',
    '</style>',
    '</head>',
    '<body>',
    '<div class="header">',
    '<div class="logo">DOOH<span>PLAY</span></div>',
    '<h1>Guia de Instalacao</h1>',
    '<p class="sub">Conecte sua TV em menos de 10 minutos</p>',
    '</div>',
    '<div class="container">',

    '<div class="section">',
    '<div class="section-title">Antes de comecar</div>',
    '<div class="step"><div class="num">1</div><div class="content"><div class="step-title">TV compativel</div><div class="step-desc">Android TV, Fire TV Stick, ou qualquer dispositivo com Android 5.0 ou superior</div></div></div>',
    '<div class="step"><div class="num">2</div><div class="content"><div class="step-title">Internet Wi-Fi</div><div class="step-desc">Sua TV precisa estar conectada ao Wi-Fi do estabelecimento</div></div></div>',
    '<div class="step"><div class="num">3</div><div class="content"><div class="step-title">Seu codigo de tela</div><div class="step-desc">Voce recebeu este codigo por WhatsApp ou email</div><div class="code-box">SEU-CODIGO</div><div class="tip">Guarde este codigo! Voce vai precisar dele na ativacao.</div></div></div>',
    '</div>',

    '<div class="divider"></div>',

    '<div class="section">',
    '<div class="section-title">Passo 1 - Habilitar fontes desconhecidas</div>',
    '<div class="step"><div class="num">1</div><div class="content"><div class="step-title">Abra as Configuracoes</div><div class="step-desc">Pressione <b>Home</b> no controle e va em <b>Configuracoes</b></div></div></div>',
    '<div class="step"><div class="num">2</div><div class="content"><div class="step-title">Ative o modo desenvolvedor</div><div class="step-desc">Va em <b>Sobre</b>, encontre <b>Numero da versao</b> e clique <b>7 vezes</b> ate aparecer "Voce e um desenvolvedor"</div></div></div>',
    '<div class="step"><div class="num">3</div><div class="content"><div class="step-title">Permita fontes desconhecidas</div><div class="step-desc">Va em <b>Opcoes do desenvolvedor</b> e ative <b>Fontes desconhecidas</b></div><div class="warn">Em alguns modelos: Configuracoes > Seguranca > Fontes desconhecidas</div></div></div>',
    '</div>',

    '<div class="divider"></div>',

    '<div class="section">',
    '<div class="section-title">Passo 2 - Baixar e instalar o app</div>',
    '<div class="step"><div class="num">1</div><div class="content"><div class="step-title">Acesse a pagina de instalacao</div><div class="step-desc">No browser da TV, acesse:</div><div class="code-box" style="font-size:13px;letter-spacing:0;">doohplay.com.br/instalar/SEU-CODIGO</div></div></div>',
    '<div class="step"><div class="num">2</div><div class="content"><div class="step-title">Baixe o app</div><div class="step-desc">Clique em <b>Baixar App DOOHPLAY</b></div></div></div>',
    '<div class="step"><div class="num">3</div><div class="content"><div class="step-title">Instale o arquivo</div><div class="step-desc">Abra o arquivo em <b>Downloads</b> ou no app <b>Files</b> e clique em <b>Instalar</b></div><div class="tip">Se aparecer aviso de seguranca, clique em "Configuracoes" e ative a permissao</div></div></div>',
    '</div>',

    '<div class="divider"></div>',

    '<div class="section">',
    '<div class="section-title">Passo 3 - Ativar sua tela</div>',
    '<div class="step"><div class="num">1</div><div class="content"><div class="step-title">Abra o app DOOHPLAY</div><div class="step-desc">Encontre o app na lista de aplicativos e abra</div></div></div>',
    '<div class="step"><div class="num">2</div><div class="content"><div class="step-title">Digite seu codigo</div><div class="step-desc">Digite o codigo da sua tela</div><div class="code-box">SEU-CODIGO</div></div></div>',
    '<div class="step"><div class="num">3</div><div class="content"><div class="step-title">Confirme e pronto!</div><div class="step-desc">Clique em <b>ATIVAR TELA</b> e em alguns segundos seu conteudo aparece na TV!</div></div></div>',
    '</div>',

    '<div class="divider"></div>',

    '<div class="success">',
    '<div style="font-size:40px;margin-bottom:12px;">🎉</div>',
    '<h3>Instalacao concluida!</h3>',
    '<p>Sua TV esta conectada ao DOOHPLAY. O conteudo vai aparecer automaticamente e se atualizar sempre que voce enviar novas midias pelo dashboard.</p>',
    '</div>',

    '<div class="contact">',
    '<h3>Precisa de ajuda?</h3>',
    '<p>WhatsApp: <a href="https://wa.me/5511962050987">(11) 9 6205-0987</a><br>',
    'Acesse: <a href="https://doohplay.com.br">doohplay.com.br</a></p>',
    '</div>',

    '</div>',
    '</body>',
    '</html>'
  ].join('\n')

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
