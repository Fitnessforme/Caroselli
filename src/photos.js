// First six assets are AI-generated; remaining assets are real stock photos. See PHOTO-CREDITS.md.
export const photos = [
  {id:'ai-cover',kind:'ai',asset:new URL('./assets/ai-photos/cover.png',import.meta.url).href,name:'AI · Stretching',source:null},
  {id:'ai-breathing',kind:'ai',asset:new URL('./assets/ai-photos/breathing.png',import.meta.url).href,name:'AI · Respirazione',source:null},
  {id:'ai-shoulders',kind:'ai',asset:new URL('./assets/ai-photos/shoulders.png',import.meta.url).href,name:'AI · Spalle',source:null},
  {id:'ai-hips',kind:'ai',asset:new URL('./assets/ai-photos/hips.png',import.meta.url).href,name:'AI · Anche',source:null},
  {id:'ai-ankles',kind:'ai',asset:new URL('./assets/ai-photos/ankles.png',import.meta.url).href,name:'AI · Caviglie',source:null},
  {id:'ai-finish',kind:'ai',asset:new URL('./assets/ai-photos/finish.png',import.meta.url).href,name:'AI · Energia',source:null},
  {id:'yoga',asset:new URL('./assets/photos/yoga.jpg',import.meta.url).href,name:'Yoga e mobilità',source:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'},
  {id:'studio',asset:new URL('./assets/photos/studio.jpg',import.meta.url).href,name:'Allenamento in studio',source:'https://images.unsplash.com/photo-1518611012118-696072aa579a'},
  {id:'training',asset:new URL('./assets/photos/training.jpg',import.meta.url).href,name:'Forza e allenamento',source:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'},
  {id:'calm',asset:new URL('./assets/photos/calm.jpg',import.meta.url).href,name:'Respiro e benessere',source:'https://images.unsplash.com/photo-1506126613408-eca07ce68773'},
  {id:'flow',asset:new URL('./assets/photos/flow.jpg',import.meta.url).href,name:'Mobilità sul tappetino',source:'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0'},
  {id:'stretch',asset:new URL('./assets/photos/stretch.jpg',import.meta.url).href,name:'Equilibrio e movimento',source:'https://images.unsplash.com/photo-1599447421416-3414500d18a5'},
];
const images = new Map();
const requests = new Map();
export function photoFor(slide,index) {
  const chosen=photos.find(p=>p.id===slide.photo);
  if(chosen)return chosen;
  return photos[index%6];
}
export function getPhoto(slide,index) { return images.get(photoFor(slide,index).id); }
export function loadPhoto(photo) {
  if(images.has(photo.id))return Promise.resolve(images.get(photo.id));
  if(requests.has(photo.id))return requests.get(photo.id);
  const promise=new Promise((resolve,reject)=>{
    const image=new Image();image.crossOrigin='anonymous';
    image.onload=()=>{images.set(photo.id,image);resolve(image);};
    image.onerror=()=>{requests.delete(photo.id);reject(new Error('Impossibile caricare le foto. Controlla la connessione e premi Riprova.'));};
    image.src=photo.asset;
  });
  requests.set(photo.id,promise);return promise;
}
export function photosReady(state) {return Promise.all(state.slides.map((slide,i)=>loadPhoto(photoFor(slide,i))));}
