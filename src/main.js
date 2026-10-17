import JSZip from 'jszip';
import { palettes, generateSlides, wrapText } from './model.js';
import './style.css';

const initial = {topic: 'Allenarsi con costanza', brand: '@fitnessforme', palette: {...palettes[0]}, slides: generateSlides('Allenarsi con costanza'), selected: 0};
let state = structuredClone(initial);
try { const saved = JSON.parse(localStorage.getItem('forma-project')); if (saved && Array.isArray(saved.slides) && saved.slides.length >= 3 && saved.slides.length <= 8 && saved.slides.every(s=>['title','body','label'].every(k=>typeof s[k]==='string')) && saved.palette && ['bg','accent','text'].every(k=>/^#[0-9a-f]{6}$/i.test(saved.palette[k]))) state = {...initial,...saved, selected:0}; } catch {}
const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="logo" href="./" aria-label="Forma home"><span class="logo-icon">f.</span>forma<span class="logo-dot">/</span></a><span class="header-note">IL TUO FITNESS. IL TUO STILE.</span><span class="save-state" id="save-state">● Salvato sul dispositivo</span></header>
<main><div class="intro"><div><div class="eyebrow">IL TUO PICCOLO CONTENT STUDIO</div><h1>Buone idee.<br><span>In ottima forma.</span></h1><p>Trasforma un argomento in un carosello da condividere.</p></div><div class="intro-mark" aria-hidden="true">✳</div></div>
<div class="workspace"><aside class="settings"><div class="section-heading"><span class="step">01</span><h2>Parti da un’idea</h2></div>
<form id="generate-form"><label for="topic">Di cosa parliamo?</label><textarea id="topic" rows="2" maxlength="120" required placeholder="Es. Mobilità per chi lavora alla scrivania"></textarea><div class="form-row"><label for="count">Numero di slide</label><select id="count">${[3,4,5,6,7,8].map(n=>`<option value="${n}" ${n===5?'selected':''}>${n} slide</option>`).join('')}</select></div><button class="primary" type="submit">Genera una bozza <span>↗</span></button><p class="hint">Bozza da modelli locali, senza AI o chiavi API. Personalizzala per il tuo argomento.</p><div id="regenerate-confirm" hidden><p class="hint">Sostituire i testi attuali con una nuova bozza?</p><button type="button" id="confirm-generate" class="small-button">Sì, sostituisci</button> <button type="button" id="cancel-generate" class="small-button">Annulla</button></div></form>
<div class="divider"></div><div class="section-heading"><span class="step">02</span><h2>Trova il tuo stile</h2></div><label>Palette</label><div class="palettes" id="palettes"></div><div class="color-fields">${[['bg','Sfondo'],['accent','Accento'],['text','Testo']].map(([key,name])=>`<label><input type="color" id="color-${key}" aria-label="${name}"><span>${name}</span></label>`).join('')}</div><label for="brand">Firma del profilo</label><input id="brand" type="text" maxlength="36" placeholder="@il_tuo_profilo"><div class="tip"><span>✧</span><p>Una slide, un’idea.<br>Lascia spazio al tuo messaggio.</p></div></aside>
<section class="studio" aria-label="Editor carosello"><div class="studio-top"><div><span class="live-dot"></span> ANTEPRIMA <span class="format">1080 × 1350 PX</span></div><button id="export" class="export-button">↓ <span>Esporta tutte</span></button></div><div class="preview-area"><button class="nav-arrow" id="previous" aria-label="Slide precedente">←</button><canvas id="preview" width="1080" height="1350" role="img" aria-label="Anteprima della slide selezionata"></canvas><button class="nav-arrow" id="next" aria-label="Slide successiva">→</button></div><div class="preview-caption"><span id="slide-number"></span><button id="export-single" class="text-button">Scarica questa slide ↗</button></div><div id="thumbnails" class="thumbnails" aria-label="Seleziona slide"></div></section>
<aside class="editor"><div class="section-heading"><span class="step">03</span><h2>Falla tua</h2></div><p class="editor-caption">Modifica la slide selezionata.<br>L’anteprima si aggiorna subito.</p><label for="slide-label">Sopratitolo</label><input id="slide-label" maxlength="45"><div class="label-row"><label for="slide-title">Titolo</label><span id="title-count"></span></div><textarea id="slide-title" rows="3" maxlength="100"></textarea><label for="slide-body">Testo</label><textarea id="slide-body" rows="7" maxlength="420"></textarea><div class="editor-footer"><span class="mini-badge">↗ PRONTO PER INSTAGRAM</span><p>PNG in formato verticale 4:5.<br>Tutte le slide in un unico file ZIP.</p></div></aside></div><div class="bottom-note"><span>CREA CON INTENZIONE. CONDIVIDI CON ENERGIA.</span><span>forma studio / 01</span></div><div id="status" class="toast" role="status" aria-live="polite" hidden></div></main>`;
const $ = s=>document.querySelector(s);
let saveTimer;
function save() { try { localStorage.setItem('forma-project',JSON.stringify(state)); $('#save-state').textContent='● Salvato sul dispositivo'; } catch { $('#save-state').textContent='Salvataggio locale non disponibile'; } }
function notify(message) { clearTimeout(saveTimer); $('#status').textContent=message; $('#status').hidden=false; saveTimer=setTimeout(()=>$('#status').hidden=true,4500); }
function draw(canvas, slide, index) {
  const ctx=canvas.getContext('2d'), {bg,accent,text}=state.palette;
  ctx.fillStyle=bg; ctx.fillRect(0,0,1080,1350);
  ctx.strokeStyle=accent; ctx.globalAlpha=.13; ctx.lineWidth=2;
  for(let r=160;r<600;r+=70){ctx.beginPath();ctx.arc(1000,130,r,0,Math.PI*2);ctx.stroke();}
  ctx.globalAlpha=1;
  ctx.fillStyle=accent;ctx.font='bold 23px Arial';ctx.fillText('FORMA / FITNESS NOTES',80,90);
  ctx.textAlign='right';ctx.fillStyle=text;ctx.font='24px Arial';ctx.fillText(`${String(index+1).padStart(2,'0')} / ${String(state.slides.length).padStart(2,'0')}`,1000,90);ctx.textAlign='left';
  ctx.fillStyle=accent;ctx.font='bold 22px Arial';ctx.fillText(slide.label.toLocaleUpperCase('it'),80,282);
  let size=index===0?100:86, titleLines;
  do {ctx.font=`bold ${size}px Arial`;titleLines=wrapText(ctx,slide.title,900);if(titleLines.length*size*1.08<=440)break;size-=2;}while(size>38);
  ctx.fillStyle=text;titleLines.forEach((line,i)=>ctx.fillText(line,80,385+i*size*1.08));
  const bodyY=Math.max(640,385+(titleLines.length-1)*size*1.08+100);
  let bodySize=34,bodyLines;
  do {ctx.font=`${bodySize}px Arial`;bodyLines=wrapText(ctx,slide.body,880);if(bodyLines.length*bodySize*1.45<1130-bodyY)break;bodySize-=1;}while(bodySize>20);
  ctx.globalAlpha=.85;bodyLines.forEach((line,i)=>ctx.fillText(line,80,bodyY+i*bodySize*1.45));ctx.globalAlpha=1;
  ctx.fillStyle=accent;ctx.fillRect(80,1185,920,2);ctx.fillStyle=text;ctx.font='bold 25px Arial';ctx.fillText(state.brand,80,1250);ctx.textAlign='right';ctx.fillStyle=accent;ctx.font='38px Arial';ctx.fillText(index===state.slides.length-1?'✳':'→',1000,1255);ctx.textAlign='left';
}
function render() {
  draw($('#preview'),state.slides[state.selected],state.selected);
  $('#preview').setAttribute('aria-label',`Slide ${state.selected+1}: ${state.slides[state.selected].title}`);
  $('#slide-number').textContent=`SLIDE ${String(state.selected+1).padStart(2,'0')} DI ${String(state.slides.length).padStart(2,'0')}`;
  $('#previous').disabled=state.selected===0;$('#next').disabled=state.selected===state.slides.length-1;
  $('#title-count').textContent=`${state.slides[state.selected].title.length}/100`;
  const container=$('#thumbnails');container.replaceChildren();
  state.slides.forEach((slide,i)=>{const button=document.createElement('button');button.className='thumbnail'+(i===state.selected?' active':'');button.setAttribute('aria-label',`Modifica slide ${i+1}: ${slide.title}`);button.setAttribute('aria-pressed',String(i===state.selected));const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;draw(canvas,slide,i);const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');button.append(canvas,number);button.onclick=()=>select(i);container.append(button);});
}
function select(index) {state.selected=index;for(const key of ['title','body','label'])$(`#slide-${key}`).value=state.slides[index][key];render();save();}
$('#topic').value=state.topic;$('#brand').value=state.brand;$('#count').value=state.slides.length;
for(const key of ['bg','accent','text']) {const input=$(`#color-${key}`);input.value=state.palette[key];input.oninput=()=>{state.palette[key]=input.value;render();save();updatePalettes();};}
function updatePalettes(){const root=$('#palettes');root.replaceChildren();palettes.forEach(p=>{const button=document.createElement('button');button.type='button';button.className='palette';button.title=p.name;button.setAttribute('aria-label',p.name);button.setAttribute('aria-pressed',String(['bg','accent','text'].every(k=>state.palette[k]===p[k])));for(const key of ['bg','accent','text']){const dot=document.createElement('span');dot.style.background=p[key];button.append(dot);}button.onclick=()=>{state.palette={...p};for(const k of ['bg','accent','text'])$(`#color-${k}`).value=p[k];render();save();updatePalettes();};root.append(button);});}
updatePalettes();
for(const key of ['title','body','label'])$(`#slide-${key}`).oninput=e=>{state.slides[state.selected][key]=e.target.value;render();save();};
$('#brand').oninput=e=>{state.brand=e.target.value;render();save();};
$('#generate-form').onsubmit=e=>{e.preventDefault();if(!$('#topic').value.trim()){notify('Inserisci un argomento.');return;}$('#regenerate-confirm').hidden=false;};
$('#cancel-generate').onclick=()=>$('#regenerate-confirm').hidden=true;
$('#confirm-generate').onclick=()=>{const topic=$('#topic').value.trim();if(!topic){notify('Inserisci un argomento.');return;}state.topic=topic;state.slides=generateSlides(topic,Number($('#count').value));select(0);$('#regenerate-confirm').hidden=true;notify('Bozza creata. Ora aggiungi la tua voce!');};
$('#previous').onclick=()=>select(Math.max(0,state.selected-1));$('#next').onclick=()=>select(Math.min(state.slides.length-1,state.selected+1));
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Impossibile creare il PNG.')),'image/png'));}
function download(blob,name){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('#export-single').onclick=async()=>{try {download(await canvasBlob($('#preview')),`forma-slide-${String(state.selected+1).padStart(2,'0')}.png`);}catch{notify('Esportazione non riuscita. Riprova.');}};
$('#export').onclick=async()=>{const button=$('#export');button.disabled=true;button.textContent='Esportazione…';try{const zip=new JSZip();const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;for(let i=0;i<state.slides.length;i++){draw(canvas,state.slides[i],i);zip.file(`slide-${String(i+1).padStart(2,'0')}.png`,await canvasBlob(canvas));}download(await zip.generateAsync({type:'blob'}),'forma-carosello.zip');notify('Carosello esportato: un PNG per ogni slide.');}catch{notify('Esportazione non riuscita. Riprova.');}finally{button.disabled=false;button.innerHTML='↓ <span>Esporta tutte</span>';}};
select(0);
