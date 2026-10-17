import { wrapText } from './model.js';
import { getPhoto, photoFor } from './photos.js';

const artwork = new Image();
export const artworkReady = new Promise((resolve, reject) => {
  artwork.onload = () => resolve();
  artwork.onerror = () => reject(new Error('Illustrazioni non disponibili. Ricarica la pagina.'));
});
artwork.src = new URL('./assets/fitness-illustrations.png', import.meta.url).href;
export const illustrationNames = ['Stretching', 'Respirazione', 'Spalle', 'Anche', 'Caviglie', 'Energia'];
export function illustrationFor(slide, index, count) {
  if (Number.isInteger(slide.illustration) && slide.illustration >= 0 && slide.illustration < 6) return slide.illustration;
  if (index === count - 1) return 5;
  const text = `${slide.title} ${slide.body}`;
  if (/cavigli|tallon|pied/i.test(text)) return 4;
  if (/anch[ea]|ginocchio/i.test(text)) return 3;
  if (/spall/i.test(text)) return 2;
  if (/respir|paus|recuper|ripos/i.test(text)) return 1;
  return index === 0 ? 0 : 5;
}
function luminance(hex) {
  const v = hex.slice(1).match(/../g).map(v => {
    const n = parseInt(v,16)/255; return n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4;
  });
  return v[0]*.2126 + v[1]*.7152 + v[2]*.0722;
}
function readable(color) { return luminance(color) > .179 ? '#35122b' : '#ffffff'; }
function mix(a,b,amount) {
  const values=[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-amount)+parseInt(b.slice(i,i+2),16)*amount));
  return '#'+values.map(v=>v.toString(16).padStart(2,'0')).join('');
}
function fit(ctx, text, width, height, start, min, weight='normal', spacing=1.2) {
  let size=start, lines;
  for (;;) {
    ctx.font=`${weight} ${size}px Arial`;
    lines=wrapText(ctx,text,width);
    if (lines.length*size*spacing<=height || size<=min) break;
    size-=1;
  }
  return {size,lines,step:size*spacing};
}
function pill(ctx,x,y,w,h,fill) {
  ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,h/2);ctx.fill();
}
function star(ctx,x,y,r,color) {
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.beginPath();
  for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r*.22:r;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();ctx.restore();
}
function editorialArrow(ctx,x,y,color,accent) {
  ctx.save();ctx.translate(x,y);
  // A drawn motion mark, not a font glyph: open orbit, sweeping shaft and cut-out head.
  ctx.strokeStyle=color;ctx.globalAlpha=.3;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,43,.15,Math.PI*1.5);ctx.stroke();ctx.globalAlpha=1;
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=6;
  ctx.beginPath();ctx.moveTo(-30,20);ctx.bezierCurveTo(-9,24,10,8,25,-16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-13);ctx.lineTo(29,-22);ctx.lineTo(30,4);ctx.stroke();
  ctx.fillStyle=accent;ctx.beginPath();ctx.arc(-31,-22,4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
export function drawSlide(canvas, slide, index, state) {
  if(state.visualStyle==='photo')return drawPhotoSlide(canvas,slide,index,state);
  const ctx=canvas.getContext('2d');
  delete canvas.dataset.photo;
  const {bg,accent,text}=state.palette;
  const bold=index%2===0;
  const background=bold?accent:bg;
  const ink=bold?readable(accent):text;
  const highlight=bold?ink:accent;
  const dark=mix(accent,'#1d1028',.65);
  const pale=mix(accent,'#ffffff',.85);
  ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);

  // Oversized cut-paper shapes and motion lines form a complete editorial background.
  ctx.fillStyle=bold?mix(accent,'#ffffff',.13):pale;
  ctx.beginPath();ctx.ellipse(900,925,640,450,-.65,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=bold?mix(accent,'#35122b',.12):mix(accent,'#ffffff',.94);
  ctx.beginPath();ctx.moveTo(0,1075);ctx.bezierCurveTo(240,925,390,1190,640,1080);ctx.bezierCurveTo(850,995,970,1090,1080,1015);ctx.lineTo(1080,1350);ctx.lineTo(0,1350);ctx.fill();
  ctx.save();ctx.strokeStyle=highlight;ctx.globalAlpha=.25;ctx.lineWidth=3;
  for(let r=140;r<=400;r+=70){ctx.beginPath();ctx.arc(1100,-80,r,0,Math.PI*2);ctx.stroke();}
  for(let y=195;y<435;y+=22)for(let x=1000;x<1080;x+=22){ctx.fillStyle=highlight;ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  ctx.fillStyle=ink;ctx.font='bold 19px Arial';ctx.fillText('FITNESS / MOVEMENT CLUB',64,89);
  pill(ctx,871,54,145,54,bold?'#ffffff':dark);ctx.fillStyle=bold?accent:'#ffffff';ctx.font='bold 24px Arial';ctx.textAlign='center';ctx.fillText(`${String(index+1).padStart(2,'0')} / ${String(state.slides.length).padStart(2,'0')}`,943,90);ctx.textAlign='left';
  ctx.font='bold 20px Arial';const labelWidth=Math.min(850,ctx.measureText(slide.label.toLocaleUpperCase('it')).width+38);
  pill(ctx,64,151,labelWidth,43,bold?mix(accent,'#ffffff',.2):pale);ctx.fillStyle=bold?ink:dark;ctx.fillText(slide.label.toLocaleUpperCase('it'),83,180,labelWidth-38);

  // Artwork occupies most of the lower composition; body text sits on its own readable card.
  if(artwork.complete&&artwork.naturalWidth){
    const n=illustrationFor(slide,index,state.slides.length);
    const w=artwork.naturalWidth/3;
    // The upper and lower rows of this illustrated sheet have different art bounds.
    const sy=n<3?0:artwork.naturalHeight*.475;
    const sh=artwork.naturalHeight*(n<3?.47:.525);
    ctx.save();ctx.beginPath();ctx.rect(0,500,1080,725);ctx.clip();
    ctx.drawImage(artwork,(n%3)*w,sy,w,sh,270,480,800,745);
    ctx.restore();
    canvas.dataset.artwork='ready';
  }
  const title=fit(ctx,slide.title,925,310,index===0?111:104,40,'bold',1.01);
  ctx.font=`bold ${title.size}px Arial`;ctx.fillStyle=ink;
  title.lines.forEach((line,i)=>ctx.fillText(line,60,226+title.size+i*title.step));
  const bodyY=Math.max(575,226+title.lines.length*title.step+48);
  const body=fit(ctx,slide.body,410,1050-bodyY,33,18,'normal',1.36);
  const cardHeight=body.lines.length*body.step+55;
  ctx.save();ctx.shadowColor=dark+'20';ctx.shadowBlur=35;ctx.shadowOffsetY=10;
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(64,bodyY-6,478,cardHeight,24);ctx.fill();ctx.restore();
  ctx.fillStyle=accent;ctx.fillRect(91,bodyY+21,44,5);
  ctx.font=`${body.size}px Arial`;ctx.fillStyle=dark;
  body.lines.forEach((line,i)=>ctx.fillText(line,91,bodyY+53+i*body.step));
  // Decorative callouts and a bold branded footer complete each slide.
  star(ctx,933,460,35,bold?'#ffffff':accent);
  ctx.save();ctx.translate(135,1150);ctx.rotate(-.1);pill(ctx,-8,-30,185,52,dark);ctx.fillStyle='#ffffff';ctx.font='bold 20px Arial';ctx.fillText(index===state.slides.length-1?'SALVA LA GUIDA':'UN PASSO ALLA VOLTA',10,3,151);ctx.restore();
  ctx.fillStyle=ink;ctx.font='bold 23px Arial';ctx.fillText(state.brand,64,1283,800);
  editorialArrow(ctx,970,1267,ink,highlight);
}

function drawPhotoSlide(canvas,slide,index,state) {
  const ctx=canvas.getContext('2d'),accent=state.palette.accent;
  const image=getPhoto(slide,index);
  ctx.fillStyle='#1c1720';ctx.fillRect(0,0,1080,1350);
  if(image){
    const zoom=Math.max(1,Math.min(1.8,Number(slide.photoZoom)||1));
    const scale=Math.max(1080/image.naturalWidth,1350/image.naturalHeight)*zoom;
    const width=image.naturalWidth*scale,height=image.naturalHeight*scale;
    const position=Math.max(0,Math.min(100,Number.isFinite(slide.photoPosition)?slide.photoPosition:50))/100;
    ctx.drawImage(image,-(width-1080)*position,-(height-1350)*position,width,height);
    canvas.dataset.photo='ready';delete canvas.dataset.artwork;
  } else { delete canvas.dataset.photo; }
  const veil=ctx.createLinearGradient(0,0,0,1350);
  veil.addColorStop(0,'rgba(10,5,18,.85)');veil.addColorStop(.36,'rgba(10,5,18,.28)');
  veil.addColorStop(.55,'rgba(10,5,18,.08)');veil.addColorStop(.72,'rgba(10,5,18,.72)');veil.addColorStop(1,'rgba(10,5,18,.97)');
  ctx.fillStyle=veil;ctx.fillRect(0,0,1080,1350);
  ctx.fillStyle='#ffffff';ctx.font='bold 18px Arial';ctx.globalAlpha=.8;ctx.fillText(photoFor(slide,index).kind==='ai'?'IMMAGINE AI / FITNESS STORIES':'FITNESS / PHOTO STORIES',64,88);ctx.globalAlpha=1;
  ctx.textAlign='right';ctx.fillStyle='#ffffff';ctx.font='bold 27px Arial';ctx.fillText(`${String(index+1).padStart(2,'0')} / ${String(state.slides.length).padStart(2,'0')}`,1016,91);ctx.textAlign='left';
  ctx.fillStyle='#ffffff';ctx.font='bold 22px Arial';ctx.fillText(slide.label.toLocaleUpperCase('it'),64,182,930);
  const title=fit(ctx,slide.title,940,300,105,40,'bold',1.02);
  ctx.fillStyle='#ffffff';ctx.font=`bold ${title.size}px Arial`;
  title.lines.forEach((line,i)=>ctx.fillText(line,60,222+title.size+i*title.step));
  if(!image){ctx.font='28px Arial';ctx.fillStyle='#ffffff';ctx.fillText('Foto in caricamento…',64,720);}
  // Keep the photograph visible through the middle; place copy over an opaque dark panel.
  const body=fit(ctx,slide.body,878,280,35,21,'normal',1.34);
  const panelHeight=body.lines.length*body.step+60;
  const panelTop=1190-panelHeight;
  ctx.fillStyle='rgba(18,12,23,.94)';ctx.beginPath();ctx.roundRect(64,panelTop,952,panelHeight,22);ctx.fill();
  ctx.fillStyle=accent;ctx.fillRect(89,panelTop+24,52,5);
  ctx.fillStyle='#ffffff';ctx.font=`${body.size}px Arial`;
  body.lines.forEach((line,i)=>ctx.fillText(line,91,panelTop+57+i*body.step));
  ctx.font='bold 24px Arial';ctx.fillStyle='#ffffff';ctx.fillText(state.brand,64,1290,850);
  editorialArrow(ctx,970,1267,'#ffffff',accent);
}
