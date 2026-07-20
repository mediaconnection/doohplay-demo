# Gerador de Peças — Canal DOOHPLAY

Compõe headline/subline/CTA sobre foto de fundo, no padrão visual do
DOOHPLAY (fonte Inter, gradiente escuro pra contraste, paleta de marca).
Saída: PNG 1920x1080, pronto pra subir no admin (institutional-media).

Usa o mesmo motor que o `generate-creative` do produto já usa em produção
(Puppeteer renderizando HTML → screenshot) — resultado visualmente
consistente com o resto do sistema.

## 1. Preencher o conteúdo

Edite `pecas.json`. Cada objeto é uma peça:

```json
{
  "id": "beleza-1",
  "canal": "Beleza & Estética",
  "cor": "#EC4899",
  "headline": "Texto grande, a chamada principal",
  "subline": "Texto de apoio, uma linha",
  "cta": "Texto do botão (ex: Saiba mais)",
  "imagem": "https://... ou caminho local pra foto de fundo"
}
```

Já vem com os 6 canais ativos (Beleza, Saúde, Alimentação, Fitness,
Varejo, Pet) como esqueleto — troque o texto `SUBSTITUA...` pelo conteúdo
real da planilha `canal_doohplay_10_pecas.xlsx`. Pra completar as 10,
duplique um bloco e ajuste o `id`.

**Onde pegar a foto**: se ainda não tiver as fotos escolhidas, me diga e eu
busco candidatas (mesma abordagem já usada na sessão de 15/07).

## 2. Rodar

```bash
npm install puppeteer
node gerar.js
```

Se o ambiente bloquear o download automático do Chrome do Puppeteer (like
no Render, já documentado no projeto):
```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer --ignore-scripts
# e usar o Chrome já instalado no sistema, ajustando em gerar.js:
# puppeteer.launch({ executablePath: '/usr/bin/chromium', ... })
```

## 3. Resultado

10 arquivos em `./saida/*.png` — subir manualmente no admin
(`app/api/admin/institutional-media`) ou, se quiser, posso estender o
script pra já fazer upload direto no R2 e criar os registros no banco
(mesmo padrão do `publishMedia.ts`).

## Reaproveitar no futuro

Esse script não é específico das 10 peças de hoje — qualquer conteúdo
institucional novo (mais widgets, mais peças de canal, os pedidos dos 3
clientes prospectados) pode usar o mesmo `template.html` + um novo
`pecas.json`. Não precisa mexer no `gerar.js`.
