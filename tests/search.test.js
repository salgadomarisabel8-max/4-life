import assert from 'node:assert/strict';
import { KB, search } from '../assets/search.js';

assert.ok(KB.length >= 50, 'La base debe tener al menos 50 fragmentos');
assert.equal(search('ingredientes Lung')[0].title, 'Transfer Factor Lung');
assert.equal(search('¿Cuánto cuesta Transfer Factor Plus?')[0].title, 'Transfer Factor Plus Tri-Factor');
assert.ok(search('los suplementos curan enfermedades').some((d) => d.cat === 'Cumplimiento'));
assert.deepEqual(search(''), []);
console.log('OK: pruebas de búsqueda superadas');
