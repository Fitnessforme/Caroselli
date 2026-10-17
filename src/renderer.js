import { wrapText } from './model.js';

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
  const values = hex.slice(1).match(/../g).map(v => {
    const n = parseInt(v,16)/255; return n <= .04045 ? n/12.92 : ((n+.055)/1.055)**2.4;
  });
  return values[0]*.2126 + values[1]*.7152 + values[2]*.0722;
}
function readable(color) { return luminance(color) > .179 ? '#241321' : '#ffffff'; }
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
export function drawSlide(canvas, slide, index, state) {
  const ctx=canvas.getContext('2d');
  const {bg,accent,text}=state.palette;
  const bold=index%2===0;
  const background=bold?accent:bg;
  const ink=bold?readable(accent):text;
  const highlight=bold?ink:accent;
  ctx.fillStyle=background;ctx.fillRect(0,0,1080,1350);
  ctx.save();ctx.strokeStyle=highlight;ctx.globalAlpha=.22;ctx.lineWidth=3;
  for(let r=170;r<=440;r+=85){ctx.beginPath();ctx.arc(1090,-30,r,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
  ctx.fillStyle=ink;ctx.font='bold 25px Arial';ctx.fillText('FORMA / MOVEMENT CLUB',76,83);
  ctx.textAlign='right';ctx.font='bold 28px Arial';ctx.fillText(`${String(index+1).padStart(2,'0')} / ${String(state.slides.length).padStart(2,'0')}`,1004,83);ctx.textAlign='left';
  ctx.fillStyle=highlight;ctx.globalAlpha=.85;ctx.font='bold 21px Arial';ctx.fillText(slide.label.toLocaleUpperCase('it'),76,178,920);ctx.globalAlpha=1;
  const title=fit(ctx,slide.title,920,320,index===0?112:102,42,'bold',1.02);
  ctx.font=`bold ${title.size}px Arial`;ctx.fillStyle=ink;
  title.lines.forEach((line,i)=>ctx.fillText(line,70,226+title.size+i*title.step));
  const bodyY=Math.max(555,226+title.lines.length*title.step+55);
  const body=fit(ctx,slide.body,505,1120-bodyY,35,21,'normal',1.4);
  ctx.font=`${body.size}px Arial`;ctx.fillStyle=ink;
  body.lines.forEach((line,i)=>ctx.fillText(line,78,bodyY+body.size+i*body.step));
  // The artwork is a local transparent sprite: no external image service is needed.
  if(artwork.complete&&artwork.naturalWidth){
    const n=illustrationFor(slide,index,state.slides.length);
    const w=artwork.naturalWidth/3,h=artwork.naturalHeight/2;
    ctx.drawImage(artwork,(n%3)*w,Math.floor(n/3)*h,w,h,575,670,470,470);
    canvas.dataset.artwork='ready';
  }
  ctx.save();ctx.strokeStyle=highlight;ctx.globalAlpha=.25;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,1160);ctx.bezierCurveTo(220,1000,315,1220,570,1115);ctx.stroke();ctx.restore();
  ctx.fillStyle=highlight;ctx.fillRect(76,1200,928,2);
  ctx.fillStyle=ink;ctx.font='bold 23px Arial';ctx.fillText(state.brand,76,1260,830);
  ctx.textAlign='right';ctx.font='40px Arial';ctx.fillText(index===state.slides.length-1?'♥':'→',1004,1266);ctx.textAlign='left';
}
