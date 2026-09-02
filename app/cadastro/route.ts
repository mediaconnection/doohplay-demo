// app/cadastro/route.ts
import { BUSINESS_TYPES } from "@/lib/businessTypes"

export const dynamic = "force-dynamic"

export function GET() {
  const businessTypeOptions = BUSINESS_TYPES.map(t => `<option>${t}</option>`).join("\n          ")
  const html = String.raw`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>Cadastro — DOOHPLAY</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui,-apple-system,sans-serif; background:#0F172A; color:#F1F5F9; min-height:100vh; }

nav { background:#1E293B; border-bottom:1px solid #334155; padding:0 24px; height:56px; display:flex; align-items:center; justify-content:space-between; }
.logo { font-size:18px; font-weight:900; color:#F9FAFB; text-decoration:none; }
.logo span { color:#3B82F6; }

.container { max-width:520px; margin:0 auto; padding:32px 20px 60px; }

/* STEPS */
.steps-bar { display:flex; align-items:center; margin-bottom:32px; }
.step-item { display:flex; align-items:center; gap:8px; flex:1; }
.step-circle { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; flex-shrink:0; border:2px solid #334155; color:#64748B; background:transparent; transition:all .3s; }
.step-circle.active { background:#3B82F6; border-color:#3B82F6; color:white; }
.step-circle.done { background:#10B981; border-color:#10B981; color:white; }
.step-label { font-size:12px; color:#64748B; transition:all .3s; }
.step-label.active { color:#F1F5F9; font-weight:600; }
.step-line { flex:1; height:1px; background:#334155; margin:0 8px; }

/* SECTIONS */
.section { display:none; }
.section.active { display:block; }

.section-title { font-size:22px; font-weight:800; color:#F1F5F9; margin-bottom:6px; }
.section-sub { font-size:14px; color:#64748B; margin-bottom:24px; line-height:1.5; }

/* FORM */
label { font-size:12px; font-weight:600; color:#94A3B8; display:block; margin-bottom:6px; }
input, select { width:100%; background:#1E293B; border:1px solid #334155; border-radius:10px; padding:12px 14px; color:#F1F5F9; font-size:15px; outline:none; transition:border .2s; font-family:inherit; }
input:focus, select:focus { border-color:#3B82F6; }
input::placeholder { color:#475569; }
.field { margin-bottom:16px; }
.field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

/* PLANOS */
.plans { display:flex; flex-direction:column; gap:12px; margin-bottom:24px; }
.plan-card { background:#1E293B; border:2px solid #334155; border-radius:14px; padding:18px 20px; cursor:pointer; transition:all .2s; display:flex; justify-content:space-between; align-items:center; }
.plan-card:hover { border-color:#3B82F6; }
.plan-card.selected { border-color:#3B82F6; background:#1e3a5f; }
.plan-card.featured { position:relative; }
.plan-badge { position:absolute; top:-10px; left:20px; background:#3B82F6; color:white; font-size:10px; font-weight:700; padding:2px 10px; border-radius:10px; }
.plan-name { font-size:16px; font-weight:700; color:#F1F5F9; margin-bottom:3px; }
.plan-desc { font-size:12px; color:#64748B; }
.plan-price { text-align:right; }
.plan-value { font-size:22px; font-weight:900; color:#3B82F6; }
.plan-period { font-size:11px; color:#64748B; }

/* TRIAL */
.trial-box { background:linear-gradient(135deg,#052e16,#0a1628); border:1px solid #166534; border-radius:12px; padding:16px 18px; margin-bottom:20px; display:flex; align-items:center; gap:12px; }
.trial-icon { font-size:24px; flex-shrink:0; }
.trial-text { font-size:13px; color:#86efac; line-height:1.5; }
.trial-text strong { color:#4ade80; display:block; margin-bottom:2px; }

/* BOTÕES */
.btn { width:100%; padding:14px; border-radius:12px; font-size:16px; font-weight:700; cursor:pointer; border:none; transition:all .2s; font-family:inherit; }
.btn-primary { background:linear-gradient(135deg,#3B82F6,#6366F1); color:white; }
.btn-primary:hover { opacity:0.9; }
.btn-primary:disabled { opacity:0.5; cursor:not-allowed; }
.btn-secondary { background:transparent; border:1px solid #334155; color:#94A3B8; margin-top:10px; }
.btn-secondary:hover { border-color:#3B82F6; color:#3B82F6; }

/* ERROR */
.error { background:#450a0a; border:1px solid #ef444433; border-radius:8px; padding:10px 14px; font-size:13px; color:#EF4444; margin-bottom:16px; display:none; }
.error.show { display:block; }

/* SUCCESS */
.success-card { text-align:center; padding:20px 0; }
.success-icon { font-size:64px; margin-bottom:16px; }
.success-title { font-size:24px; font-weight:900; color:#4ade80; margin-bottom:8px; }
.success-sub { font-size:14px; color:#94A3B8; line-height:1.6; margin-bottom:24px; }
.code-display { background:#0F172A; border:2px solid #3B82F6; border-radius:14px; padding:16px 24px; display:inline-block; font-size:32px; font-weight:900; color:#3B82F6; letter-spacing:6px; margin-bottom:24px; }
.next-steps { text-align:left; background:#1E293B; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:20px; }
.next-steps-title { font-size:13px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px; }
.next-step { display:flex; gap:12px; margin-bottom:12px; align-items:flex-start; }
.next-step:last-child { margin-bottom:0; }
.next-step-num { width:24px; height:24px; border-radius:50%; background:#3B82F6; color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
.next-step-text { font-size:13px; color:#CBD5E1; line-height:1.5; }
.next-step-text strong { color:#F1F5F9; display:block; }

.install-btn { display:block; width:100%; padding:14px; background:#10B981; border:none; border-radius:12px; color:white; font-size:15px; font-weight:700; text-align:center; text-decoration:none; cursor:pointer; font-family:inherit; }

/* LOADING */
.spinner { width:20px; height:20px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin .8s linear infinite; display:inline-block; margin-right:8px; vertical-align:middle; }
@keyframes spin { to { transform:rotate(360deg); } }
</style>
</head>
<body>

<nav>
  <a href="/" class="logo">DOOH<span>PLAY</span></a>
  <span style="font-size:12px;color:#64748B">Cadastro gratuito</span>
</nav>

<div class="container">

  <!-- STEPS BAR -->
  <div class="steps-bar">
    <div class="step-item">
      <div class="step-circle active" id="s1">1</div>
      <div class="step-label active" id="sl1">Seus dados</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
      <div class="step-circle" id="s2">2</div>
      <div class="step-label" id="sl2">Plano</div>
    </div>
    <div class="step-line"></div>
    <div class="step-item">
      <div class="step-circle" id="s3">3</div>
      <div class="step-label" id="sl3">Confirmar</div>
    </div>
  </div>

  <!-- STEP 1 — DADOS -->
  <div class="section active" id="step1">
    <div class="section-title">Vamos começar! 🚀</div>
    <div class="section-sub">Preencha os dados do seu estabelecimento para criar sua conta</div>

    <div style="background:#1E293B;border:1px solid #3B82F640;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:#94A3B8;line-height:1.5;">
      💡 Este cadastro é para quem <strong style="color:#F1F5F9">tem um estabelecimento e quer colocar a própria TV no ar</strong>.
      Se você quer <strong style="color:#F1F5F9">anunciar nas telas de outros parceiros</strong> sem ter uma tela própria, o cadastro certo é o
      <a href="/anunciante/novo" style="color:#3B82F6;text-decoration:underline;">cadastro de anunciante</a>.
      (Já tem uma tela com a gente e quer também anunciar em outras telas? Sem problema, pode fazer os dois cadastros.)
    </div>

    <div class="error" id="err1"></div>

    <div class="field">
      <label>Nome do estabelecimento *</label>
      <input type="text" id="name" placeholder="Ex: Barbearia do João" autocomplete="organization">
    </div>

    <div class="field-row">
      <div class="field">
        <label>Tipo de negócio *</label>
        <select id="business_type">
          <option value="">Selecione...</option>
          ${businessTypeOptions}
        </select>
      </div>
      <div class="field">
        <label>Cidade *</label>
        <input type="text" id="city" placeholder="São Paulo" autocomplete="address-level2">
      </div>
    </div>

    <div class="field">
      <label>WhatsApp *</label>
      <input type="tel" id="phone" placeholder="(11) 9 9999-9999" autocomplete="tel">
    </div>

    <div class="field">
      <label>Email *</label>
      <input type="email" id="email" placeholder="seu@email.com" autocomplete="email">
    </div>

    <div class="field">
      <label>CPF *</label>
      <input type="text" id="cpf" placeholder="000.000.000-00" maxlength="14">
    </div>

    <button class="btn btn-primary" onclick="goStep2()">Continuar →</button>
  </div>

  <!-- STEP 2 — PLANO -->
  <div class="section" id="step2">
    <div class="section-title">Escolha seu plano</div>
    <div class="section-sub">Todos os planos incluem 7 dias grátis. Cancele quando quiser.</div>

    <div class="trial-box">
      <div class="trial-icon">🎁</div>
      <div class="trial-text">
        <strong>7 dias grátis para experimentar</strong>
        Instale, teste e veja funcionando. Só começa a cobrar depois do período de teste.
      </div>
    </div>

    <div class="error" id="err2"></div>

    <div class="plans">
      <div class="plan-card featured selected" onclick="selectPlan('starter',this)" id="plan-starter">
        <span class="plan-badge">Mais popular</span>
        <div>
          <div class="plan-name">Starter</div>
          <div class="plan-desc">1 TV · Suporte básico · Dashboard completo</div>
        </div>
        <div class="plan-price">
          <div class="plan-value">R$97</div>
          <div class="plan-period">/mês</div>
        </div>
      </div>

      <div class="plan-card" onclick="selectPlan('pro',this)" id="plan-pro">
        <div>
          <div class="plan-name">Pro</div>
          <div class="plan-desc">3 TVs · Relatórios avançados · Prioridade</div>
        </div>
        <div class="plan-price">
          <div class="plan-value">R$290</div>
          <div class="plan-period">/mês</div>
        </div>
      </div>

      <div class="plan-card" onclick="selectPlan('business',this)" id="plan-business">
        <div>
          <div class="plan-name">Business</div>
          <div class="plan-desc">Até 5 TVs · Suporte dedicado · Agência</div>
        </div>
        <div class="plan-price">
          <div class="plan-value">R$620</div>
          <div class="plan-period">/mês</div>
        </div>
      </div>
    </div>

    <button class="btn btn-primary" onclick="goStep3()">Continuar →</button>
    <button class="btn btn-secondary" onclick="goBack(1)">← Voltar</button>
  </div>

  <!-- STEP 3 — CONFIRMAR -->
  <div class="section" id="step3">
    <div class="section-title">Confirme seus dados</div>
    <div class="section-sub">Revise as informações antes de criar sua conta</div>

    <div class="error" id="err3"></div>

    <div style="background:#1E293B;border:1px solid #334155;border-radius:14px;padding:20px;margin-bottom:20px;">
      <div style="font-size:12px;color:#64748B;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">Resumo</div>
      <div id="summary" style="font-size:14px;color:#CBD5E1;line-height:2;"></div>
    </div>

    <div class="trial-box">
      <div class="trial-icon">✅</div>
      <div class="trial-text">
        <strong>7 dias grátis — sem cobrança agora</strong>
        Após o período de teste, cobramos via PIX ou boleto automaticamente.
      </div>
    </div>

    <button class="btn btn-primary" id="btn-confirm" onclick="confirm()">
      Criar minha conta grátis 🚀
    </button>
    <button class="btn btn-secondary" onclick="goBack(2)">← Voltar</button>
  </div>

  <!-- SUCESSO -->
  <div class="section" id="step-success">
    <div class="success-card">
      <div class="success-icon">🎉</div>
      <div class="success-title">Bem-vindo ao DOOHPLAY!</div>
      <div class="success-sub">Sua conta foi criada com sucesso. Você receberá as instruções por WhatsApp e email.</div>
      <div class="code-display" id="success-code">...</div>
      <div class="next-steps">
        <div class="next-steps-title">Próximos passos</div>
        <div class="next-step">
          <div class="next-step-num">1</div>
          <div class="next-step-text"><strong>Instale o app na sua TV</strong>Clique no botão abaixo e siga as instruções</div>
        </div>
        <div class="next-step">
          <div class="next-step-num">2</div>
          <div class="next-step-text"><strong>Digite seu código na TV</strong>O app vai pedir o código que aparece acima</div>
        </div>
        <div class="next-step">
          <div class="next-step-num">3</div>
          <div class="next-step-text"><strong>Seu conteúdo aparece automaticamente</strong>Em segundos a TV começa a exibir</div>
        </div>
      </div>
      <a id="install-link" href="#" class="install-btn">📱 Instalar app na TV agora</a>
    </div>
  </div>

</div>

<script>
var selectedPlan = 'starter'
var formData = {}

// Máscara CPF
document.getElementById('cpf').addEventListener('input', function(e) {
  var v = e.target.value.replace(/\D/g,'').slice(0,11)
  if (v.length > 9) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9)
  else if (v.length > 6) v = v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6)
  else if (v.length > 3) v = v.slice(0,3)+'.'+v.slice(3)
  e.target.value = v
})

// Máscara telefone
document.getElementById('phone').addEventListener('input', function(e) {
  var v = e.target.value.replace(/\D/g,'').slice(0,11)
  if (v.length > 10) v = '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7)
  else if (v.length > 6) v = '('+v.slice(0,2)+') '+v.slice(2,6)+'-'+v.slice(6)
  else if (v.length > 2) v = '('+v.slice(0,2)+') '+v.slice(2)
  e.target.value = v
})

function selectPlan(plan, el) {
  selectedPlan = plan
  document.querySelectorAll('.plan-card').forEach(function(c) { c.classList.remove('selected') })
  el.classList.add('selected')
}

function showErr(id, msg) {
  var el = document.getElementById(id)
  el.textContent = msg
  el.classList.add('show')
  el.scrollIntoView({ behavior:'smooth', block:'center' })
}
function hideErr(id) { document.getElementById(id).classList.remove('show') }

function goStep2() {
  hideErr('err1')
  var name = document.getElementById('name').value.trim()
  var bt   = document.getElementById('business_type').value
  var city = document.getElementById('city').value.trim()
  var phone= document.getElementById('phone').value.trim()
  var email= document.getElementById('email').value.trim()
  var cpf  = document.getElementById('cpf').value.replace(/\D/g,'')

  if (!name) return showErr('err1','Por favor, informe o nome do estabelecimento')
  if (!bt)   return showErr('err1','Selecione o tipo de negócio')
  if (!city) return showErr('err1','Informe a cidade')
  if (!phone || phone.replace(/\D/g,'').length < 10) return showErr('err1','Informe um WhatsApp válido')
  if (!email || !email.includes('@')) return showErr('err1','Informe um email válido')
  if (cpf.length !== 11) return showErr('err1','Informe um CPF válido (11 dígitos)')

  formData = { name, business_type: bt, city, phone, email, cpf }
  setStep(2)
}

function goStep3() {
  hideErr('err2')
  if (!selectedPlan) return showErr('err2','Selecione um plano')

  const plans = { starter:'Starter — R$ 97/mês', pro:'Pro — R$ 290/mês', business:'Business — R$ 620/mês' }
  document.getElementById('summary').innerHTML =
    '<b style="color:#F1F5F9">'+formData.name+'</b><br>' +
    formData.business_type + ' · ' + formData.city + '<br>' +
    '📱 ' + formData.phone + '<br>' +
    '📧 ' + formData.email + '<br>' +
    '📦 Plano: <b style="color:#3B82F6">' + plans[selectedPlan] + '</b><br>' +
    '🎁 <b style="color:#4ade80">7 dias grátis</b>'

  setStep(3)
}

function goBack(to) { setStep(to) }

function setStep(n) {
  document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active') })
  document.getElementById('step'+n).classList.add('active')
  window.scrollTo(0,0)

  for (var i = 1; i <= 3; i++) {
    var circle = document.getElementById('s'+i)
    var label  = document.getElementById('sl'+i)
    circle.classList.remove('active','done')
    label.classList.remove('active')
    if (i < n) { circle.classList.add('done'); circle.textContent = '✓' }
    else if (i === n) { circle.classList.add('active'); circle.textContent = i; label.classList.add('active') }
    else { circle.textContent = i }
  }
}

async function confirm() {
  hideErr('err3')
  var btn = document.getElementById('btn-confirm')
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span>Criando sua conta...'

  try {
    var res = await fetch('/api/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, plan: selectedPlan })
    })
    var data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao criar conta')

    document.getElementById('success-code').textContent = data.code
    document.getElementById('install-link').href = '/instalar/' + data.code
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active') })
    document.getElementById('step-success').classList.add('active')
    window.scrollTo(0,0)
  } catch(e) {
    showErr('err3', e.message)
    btn.disabled = false
    btn.innerHTML = 'Criar minha conta grátis 🚀'
  }
}
</script>
</body>
</html>`

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  })
}
