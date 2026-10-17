import JSZip from 'jszip';
import { palettes, generateSlides } from './model.js';
import { drawSlide, artworkReady, illustrationNames } from './renderer.js';
import { photos, photoFor, photosReady, loadPhoto } from './photos.js';
import './style.css';

const initial = {visualStyle: 'photo', topic: 'Mobilità per principianti', brand: '@fitnessforme', palette: {...palettes[0]}, slides: generateSlides('Mobilità per principianti',6), selected: 0};
let state = structuredClone(initial);
try { const saved = JSON.parse(localStorage.getItem('forma-project')); if (saved && Array.isArray(saved.slides) && saved.slides.length >= 3 && saved.slides.length <= 8 && saved.slides.every(s=>['title','body','label'].every(k=>typeof s[k]==='string')) && saved.palette && ['bg','accent','text'].every(k=>/^#[0-9a-f]{6}$/i.test(saved.palette[k]))) state = {...initial,...saved, selected:0}; } catch {}
const requestedStyle=new URLSearchParams(location.search).get('stile');
if(requestedStyle==='foto'||requestedStyle==='ai')state.visualStyle='photo';
if(requestedStyle==='ai'){state.slides.forEach((slide,i)=>{slide.photo=photos[i%6].id;slide.photoZoom=1;slide.photoPosition=50;});const cleanUrl=new URL(location.href);cleanUrl.searchParams.delete('stile');history.replaceState(null,'',cleanUrl);}
const app = document.querySelector('#app');
app.innerHTML = `
<header><a class="logo" href="./" aria-label="Forma home"><span class="logo-icon">f.</span>forma<span class="logo-dot">/</span></a><span class="header-note">FOTOREALISMO AI + GRAFICA</span><span class="save-state" id="save-state">● Salvato sul dispositivo</span></header>
<main><div class="intro"><div><div class="eyebrow">IL TUO PICCOLO CONTENT STUDIO</div><h1>Buone idee.<br><span>In ottima forma.</span></h1><p>Trasforma un argomento in un carosello da condividere.</p><a class="example-link" href="./mobilita/">Guarda l’esempio illustrato sulla mobilità ↗</a></div><div class="intro-mark" aria-hidden="true">✳</div></div>
<div class="workspace"><aside class="settings"><div class="section-heading"><span class="step">01</span><h2>Parti da un’idea</h2></div>
<form id="generate-form"><label for="topic">Di cosa parliamo?</label><textarea id="topic" rows="2" maxlength="120" required placeholder="Es. Mobilità per chi lavora alla scrivania"></textarea><div class="form-row"><label for="count">Numero di slide</label><select id="count">${[3,4,5,6,7,8].map(n=>`<option value="${n}" ${n===5?'selected':''}>${n} slide</option>`).join('')}</select></div><button class="primary" type="submit">Genera una bozza <span>↗</span></button><p class="hint">Bozza da modelli locali, senza AI o chiavi API. Personalizzala per il tuo argomento.</p><div id="regenerate-confirm" hidden><p class="hint">Sostituire i testi attuali con una nuova bozza?</p><button type="button" id="confirm-generate" class="small-button">Sì, sostituisci</button> <button type="button" id="cancel-generate" class="small-button">Annulla</button></div></form>
<div class="divider"></div><div class="section-heading"><span class="step">02</span><h2>Trova il tuo stile</h2></div><label for="visual-style">Stile delle slide</label><select id="visual-style"><option value="photo">Immagini fotografiche</option><option value="illustration">Illustrazioni</option></select><button type="button" id="different-photos" class="small-button">6 immagini AI diverse</button><p id="photo-state" class="hint" role="status"></p><button type="button" id="retry-photos" class="small-button" hidden>Riprova caricamento foto</button><label class="palette-label">Palette</label><div class="palettes" id="palettes"></div><div class="color-fields">${[['bg','Sfondo'],['accent','Accento'],['text','Testo']].map(([key,name])=>`<label><input type="color" id="color-${key}" aria-label="${name}"><span>${name}</span></label>`).join('')}</div><label for="brand">Firma del profilo</label><input id="brand" type="text" maxlength="36" placeholder="@il_tuo_profilo"><div class="tip"><span>✧</span><p>Una slide, un’idea.<br>Lascia spazio al tuo messaggio.</p></div></aside>
<section class="studio" aria-label="Editor carosello"><div class="studio-top"><div><span class="live-dot"></span> ANTEPRIMA <span class="format">1080 × 1350 PX</span></div><button id="export" class="export-button">↓ <span>Esporta tutte</span></button></div><div class="preview-area"><button class="nav-arrow" id="previous" aria-label="Slide precedente"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M25 20C18 23 12 20 7 10M7 10l-1 10M7 10l10 1"/></svg></button><canvas id="preview" width="1080" height="1350" role="img" aria-label="Anteprima della slide selezionata"></canvas><button class="nav-arrow" id="next" aria-label="Slide successiva"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 24C16 24 21 18 25 8M25 8l-10 3M25 8l1 10"/></svg></button></div><div class="preview-caption"><span id="slide-number"></span><button id="export-single" class="text-button">Scarica questa slide ↗</button></div><div id="thumbnails" class="thumbnails" aria-label="Seleziona slide"></div></section>
<aside class="editor"><div class="section-heading"><span class="step">03</span><h2>Falla tua</h2></div><p class="editor-caption">Modifica la slide selezionata.<br>L’anteprima si aggiorna subito.</p><div id="photo-controls"><label for="photo">Immagine</label><select id="photo">${photos.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')}</select><label for="photo-position">Inquadratura</label><input id="photo-position" type="range" min="0" max="100" value="50"><label for="photo-zoom">Zoom</label><input id="photo-zoom" type="range" min="100" max="180" value="100"><p class="hint">Le voci AI sono immagini generate. Le altre sono foto di repertorio. <a id="photo-source" href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Fonte Unsplash ↗</a></p></div><div id="illustration-controls"><label for="illustration">Illustrazione</label><select id="illustration"><option value="auto">Automatica</option>${illustrationNames.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></div><label for="slide-label">Sopratitolo</label><input id="slide-label" maxlength="45"><div class="label-row"><label for="slide-title">Titolo</label><span id="title-count"></span></div><textarea id="slide-title" rows="3" maxlength="100"></textarea><label for="slide-body">Testo</label><textarea id="slide-body" rows="7" maxlength="420"></textarea><div class="editor-footer"><span class="mini-badge">↗ PRONTO PER INSTAGRAM</span><p>PNG in formato verticale 4:5.<br>Tutte le slide in un unico file ZIP.</p></div></aside></div><div class="bottom-note"><span>CREA CON INTENZIONE. CONDIVIDI CON ENERGIA.</span><span>forma studio / 01</span></div><div id="status" class="toast" role="status" aria-live="polite" hidden></div></main>`;
const $ = s=>document.querySelector(s);
let saveTimer;
function save() { try { localStorage.setItem('forma-project',JSON.stringify(state)); $('#save-state').textContent='● Salvato sul dispositivo'; } catch { $('#save-state').textContent='Salvataggio locale non disponibile'; } }
function notify(message) { clearTimeout(saveTimer); $('#status').textContent=message; $('#status').hidden=false; saveTimer=setTimeout(()=>$('#status').hidden=true,4500); }
function draw(canvas, slide, index) { drawSlide(canvas,slide,index,state); }
function render() {
  draw($('#preview'),state.slides[state.selected],state.selected);
  $('#preview').setAttribute('aria-label',`Slide ${state.selected+1}: ${state.slides[state.selected].title}`);
  $('#slide-number').textContent=`SLIDE ${String(state.selected+1).padStart(2,'0')} DI ${String(state.slides.length).padStart(2,'0')}`;
  $('#previous').disabled=state.selected===0;$('#next').disabled=state.selected===state.slides.length-1;
  $('#title-count').textContent=`${state.slides[state.selected].title.length}/100`;
  const container=$('#thumbnails');container.replaceChildren();
  state.slides.forEach((slide,i)=>{const button=document.createElement('button');button.className='thumbnail'+(i===state.selected?' active':'');button.setAttribute('aria-label',`Modifica slide ${i+1}: ${slide.title}`);button.setAttribute('aria-pressed',String(i===state.selected));const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;draw(canvas,slide,i);const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');button.append(canvas,number);button.onclick=()=>select(i);container.append(button);});
}
function select(index) {state.selected=index;updateVisualControls();$('#illustration').value=Number.isInteger(state.slides[index].illustration)?String(state.slides[index].illustration):'auto';for(const key of ['title','body','label'])$(`#slide-${key}`).value=state.slides[index][key];render();save();}
$('#visual-style').value=state.visualStyle==='photo'?'photo':'illustration';
$('#topic').value=state.topic;$('#brand').value=state.brand;$('#count').value=state.slides.length;
for(const key of ['bg','accent','text']) {const input=$(`#color-${key}`);input.value=state.palette[key];input.oninput=()=>{state.palette[key]=input.value;render();save();updatePalettes();};}
function updatePalettes(){const root=$('#palettes');root.replaceChildren();palettes.forEach(p=>{const button=document.createElement('button');button.type='button';button.className='palette';button.title=p.name;button.setAttribute('aria-label',p.name);button.setAttribute('aria-pressed',String(['bg','accent','text'].every(k=>state.palette[k]===p[k])));for(const key of ['bg','accent','text']){const dot=document.createElement('span');dot.style.background=p[key];button.append(dot);}button.onclick=()=>{state.palette={...p};for(const k of ['bg','accent','text'])$(`#color-${k}`).value=p[k];render();save();updatePalettes();};root.append(button);});}
updatePalettes();
for(const key of ['title','body','label'])$(`#slide-${key}`).oninput=e=>{state.slides[state.selected][key]=e.target.value;render();save();};
$('#brand').oninput=e=>{state.brand=e.target.value;render();save();};
$('#generate-form').onsubmit=e=>{e.preventDefault();if(!$('#topic').value.trim()){notify('Inserisci un argomento.');return;}$('#regenerate-confirm').hidden=false;};
$('#cancel-generate').onclick=()=>$('#regenerate-confirm').hidden=true;
$('#confirm-generate').onclick=()=>{const topic=$('#topic').value.trim();if(!topic){notify('Inserisci un argomento.');return;}state.topic=topic;state.slides=generateSlides(topic,Number($('#count').value));select(0);refreshAssets();$('#regenerate-confirm').hidden=true;notify('Bozza creata. Ora aggiungi la tua voce!');};
$('#previous').onclick=()=>select(Math.max(0,state.selected-1));$('#next').onclick=()=>select(Math.min(state.slides.length-1,state.selected+1));
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Impossibile creare il PNG.')),'image/png'));}
function download(blob,name){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
$('#export-single').onclick=async()=>{try {await (state.visualStyle==='photo'?loadPhoto(photoFor(state.slides[state.selected],state.selected)):artworkReady);draw($('#preview'),state.slides[state.selected],state.selected);download(await canvasBlob($('#preview')),`forma-slide-${String(state.selected+1).padStart(2,'0')}.png`);}catch{notify('Esportazione non riuscita. Riprova.');}};
$('#export').onclick=async()=>{const button=$('#export');button.disabled=true;button.textContent='Esportazione…';try{await currentAssetsReady();const zip=new JSZip();const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;for(let i=0;i<state.slides.length;i++){draw(canvas,state.slides[i],i);zip.file(`slide-${String(i+1).padStart(2,'0')}.png`,await canvasBlob(canvas));}download(await zip.generateAsync({type:'blob'}),'forma-carosello.zip');notify('Carosello esportato: un PNG per ogni slide.');}catch{notify('Esportazione non riuscita. Riprova.');}finally{button.disabled=false;button.innerHTML='↓ <span>Esporta tutte</span>';}};
$('#illustration').onchange=e=>{if(e.target.value==='auto')delete state.slides[state.selected].illustration;else state.slides[state.selected].illustration=Number(e.target.value);render();save();};
function updateVisualControls(){
  const photographic=state.visualStyle==='photo',slide=state.slides[state.selected];
  $('#different-photos').hidden=!photographic;$('#photo-controls').hidden=!photographic;$('#illustration-controls').hidden=photographic;
  $('#photo').value=photoFor(slide,state.selected).id;
  $('#photo-position').value=Number.isFinite(slide.photoPosition)?slide.photoPosition:50;
  $('#photo-zoom').value=(Number(slide.photoZoom)||1)*100;
  const image=photoFor(slide,state.selected);$('#photo-source').hidden=image.kind==='ai';if(image.source)$('#photo-source').href=image.source;
}
function currentAssetsReady(){return state.visualStyle==='photo'?photosReady(state):artworkReady;}
async function refreshAssets(){
  const photographic=state.visualStyle==='photo';
  $('#photo-state').textContent=photographic?'Caricamento immagini…':'';
  $('#retry-photos').hidden=true;
  try{await currentAssetsReady();render();if(photographic&&state.visualStyle==='photo')$('#photo-state').textContent='Foto pronte · immagini incluse nei PNG';}
  catch(e){if(photographic&&state.visualStyle==='photo'){$('#photo-state').textContent=e.message;$('#retry-photos').hidden=false;}else if(!photographic)notify(e.message);}
}
$('#visual-style').onchange=e=>{state.visualStyle=e.target.value;updateVisualControls();render();save();refreshAssets();};
$('#photo').onchange=e=>{state.slides[state.selected].photo=e.target.value;updateVisualControls();render();save();refreshAssets();};
$('#photo-position').oninput=e=>{state.slides[state.selected].photoPosition=Number(e.target.value);render();save();};
$('#photo-zoom').oninput=e=>{state.slides[state.selected].photoZoom=Number(e.target.value)/100;render();save();};
$('#different-photos').onclick=()=>{state.slides.forEach((slide,i)=>{slide.photo=photos[i%6].id;slide.photoPosition=50;slide.photoZoom=1;});updateVisualControls();render();save();refreshAssets();notify(state.slides.length<=6?'6 immagini AI diverse.': 'Distribuite le 6 foto disponibili: dalla settima si ripetono.');};
$('#retry-photos').onclick=refreshAssets;
select(0);refreshAssets();
