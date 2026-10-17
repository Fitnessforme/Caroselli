import { test } from 'node:test';
import assert from 'node:assert/strict';
import { photos, photoFor } from '../src/photos.js';
test('le prime sei slide ricevono sei fotografie diverse',()=>{
 const ids=Array.from({length:6},(_,i)=>photoFor({title:'Mobilità',body:'Respira e riposa'},i).id);
 assert.equal(new Set(ids).size,6);assert.equal(new Set(photos.slice(0,6).map(p=>p.asset)).size,6);
});
test('la scelta manuale viene preservata; oltre la sesta la libreria si ripete',()=>{
 assert.equal(photoFor({photo:'calm'},0).id,'calm');assert.equal(photoFor({},6).id,photoFor({},0).id);
});
