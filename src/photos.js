// Real stock photographs, not AI-generated imagery. See PHOTO-CREDITS.md.
export const photos = [
  {id:'yoga',asset:new URL('./assets/photos/yoga.jpg',import.meta.url).href,name:'Yoga e mobilità',source:'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'},
  {id:'studio',asset:new URL('./assets/photos/studio.jpg',import.meta.url).href,name:'Allenamento in studio',source:'https://images.unsplash.com/photo-1518611012118-696072aa579a'},
  {id:'training',asset:new URL('./assets/photos/training.jpg',import.meta.url).href,name:'Forza e allenamento',source:'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'},
  {id:'calm',asset:new URL('./assets/photos/calm.jpg',import.meta.url).href,name:'Respiro e benessere',source:'https://images.unsplash.com/photo-1506126613408-eca07ce68773'},
];
const images = new Map();
const requests = new Map();
export function photoFor(slide,index) {
  const chosen=photos.find(p=>p.id===slide.photo);
  if(chosen)return chosen;
  const words=`${slide.title} ${slide.body}`;
  if(/forza|carico|pesi|bilancier/i.test(words))return photos[2];
  if(/respir|ripos|recuper/i.test(words))return photos[3];
  return [photos[0],photos[1],photos[3]][index%3];
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
