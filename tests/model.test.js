import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSlides, wrapText } from '../src/model.js';
test('genera il numero richiesto di slide con apertura e chiusura',()=>{
 for(let count=3;count<=8;count++){const slides=generateSlides('Mobilità',count);assert.equal(slides.length,count);assert.equal(slides[0].title,'Mobilità');assert.match(slides.at(-1).body,/mobilità/);}
 assert.throws(()=>generateSlides('  '));
});
test('il testo rispetta larghezza e interruzioni esplicite anche con parole lunghe',()=>{
 const ctx={measureText: text=>({width:text.length})};
 const lines=wrapText(ctx,'Una frase molto lunga\nabcdefghijklmnop',8);
 assert.ok(lines.every(line=>line.length<=8));assert.deepEqual(wrapText(ctx,'Ciao\nmondo',20),['Ciao','mondo']);
 assert.equal(lines.slice(-2).join(''),'abcdefghijklmnop');
});
