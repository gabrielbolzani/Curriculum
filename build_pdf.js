const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Iniciando a geração do PDF...');

// 1. Executa o npx marked para converter README.md para HTML
let rawHtml;
try {
  rawHtml = execSync('npx -y marked -i README.md --gfm').toString();
  console.log('Markdown convertido para HTML com sucesso.');
} catch (error) {
  console.error('Erro ao converter Markdown com marked:', error.message);
  process.exit(1);
}

// 2. Transforma a lista de contatos em uma div estilizada
// Encontra a primeira lista <ul> que contém o contato (identificada por "📍")
let finalHtmlBody = rawHtml;
const ulContactRegex = /<ul>\s*<li>📍[\s\S]*?<\/ul>/;
const contactMatch = rawHtml.match(ulContactRegex);

if (contactMatch) {
  const contactList = contactMatch[0];
  // Reconstrói a estrutura de contatos de forma horizontal e elegante
  const contactDiv = `
<div class="contacts">
  <span>📍 Colatina / Vitória – ES</span>
  <span>📧 <a href="mailto:gabriel.bolzani@hotmail.com">gabriel.bolzani@hotmail.com</a></span>
  <span>📞 <a href="https://wa.me/5527999514334?text=Olá%20Gabriel,%20Achei%20seu%20curriculo%20fantástico,%20vamos%20conversar%3F!">(27) 99951-4334</a></span>
  <span>🔗 <a href="https://www.linkedin.com/in/gabrielbolzani/" target="_blank">LinkedIn</a></span>
  <span>💻 <a href="https://github.com/gabrielbolzani" target="_blank">GitHub</a></span>
</div>
`;
  finalHtmlBody = finalHtmlBody.replace(ulContactRegex, contactDiv);
  // Remove a tag <p><br></p> ou </br> que sobra no topo
  finalHtmlBody = finalHtmlBody.replace(/<p>\s*<\/br>\s*<\/p>/g, '');
  finalHtmlBody = finalHtmlBody.replace(/<p>\s*<br>\s*<\/p>/g, '');
}

// 3. Monta o documento HTML completo com CSS premium para impressão
const pageTitle = "Currículo - Gabriel Forza Juliatti Bolzani";
const fullHtmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #1e293b; /* Slate 800 */
      line-height: 1.45;
      margin: 0;
      padding: 0;
      font-size: 9.5pt; /* Otimizado para caber bem no A4 */
      background-color: #ffffff;
    }
    
    h1, h2, h3, h4 {
      color: #0f172a; /* Slate 900 */
      margin-top: 0;
      font-weight: 700;
    }
    
    h1 {
      font-size: 20pt;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: -0.02em;
    }
    
    h2 {
      font-size: 11.5pt;
      border-bottom: 1.5px solid #cbd5e1; /* Borda cinza clara */
      padding-bottom: 3px;
      margin-top: 14px;
      margin-bottom: 8px;
      color: #1e3a8a; /* Azul marinho elegante */
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    h3 {
      font-size: 10pt;
      margin-top: 10px;
      margin-bottom: 2px;
      color: #0f172a;
    }
    
    /* Datas e locais */
    h3 + p {
      font-size: 8.5pt;
      color: #64748b; /* Slate 500 */
      margin-top: 0;
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    p {
      margin-top: 0;
      margin-bottom: 8px;
      text-align: justify;
    }
    
    ul {
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 15px;
    }
    
    li {
      margin-bottom: 3px;
      text-align: justify;
    }
    
    a {
      color: #2563eb;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 12px 0;
    }
    
    /* Container de contatos */
    .contacts {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 8.5pt;
      color: #475569;
    }
    
    .contacts span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    /* Ajustes específicos para impressão */
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page-break {
        page-break-before: always;
        break-before: page;
        display: block;
        height: 0;
        margin: 0;
        border: none;
      }
    }
  </style>
</head>
<body>
  ${finalHtmlBody}
</body>
</html>`;

const htmlPath = path.join(__dirname, 'curriculum.html');
fs.writeFileSync(htmlPath, fullHtmlContent);
console.log('HTML temporário gerado em:', htmlPath);

// 4. Executa o Chrome ou Edge para converter o HTML em PDF
const pdfPath = path.join(__dirname, 'curriculum.pdf');
const chromePath = 'C:\\Program Files\\Google\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

let browserPath = fs.existsSync(chromePath) ? chromePath : (fs.existsSync(edgePath) ? edgePath : null);

if (!browserPath) {
  console.error('Erro: Não foi possível localizar o Google Chrome nem o Microsoft Edge nos caminhos padrão.');
  process.exit(1);
}

console.log(`Usando navegador em: ${browserPath}`);

const chromeCmd = `& "${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

try {
  execSync(chromeCmd, { shell: 'powershell.exe' });
  console.log('PDF gerado com sucesso em:', pdfPath);
} catch (error) {
  console.error('Erro ao gerar o PDF com o navegador:', error.message);
  process.exit(1);
}

// 5. Remove o HTML temporário para não poluir o repositório
try {
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
    console.log('HTML temporário removido com sucesso.');
  }
} catch (err) {
  console.warn('Aviso: Não foi possível remover o HTML temporário:', err.message);
}
