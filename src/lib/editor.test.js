import test from 'node:test';
import assert from 'node:assert/strict';
import { isEditorContentEmpty } from './editor.js';

test('treats empty Tiptap content as empty', () => {
  assert.equal(isEditorContentEmpty(''), true);
  assert.equal(isEditorContentEmpty('<p></p>'), true);
  assert.equal(isEditorContentEmpty('<p><br></p>'), true);
  assert.equal(isEditorContentEmpty('<p>   </p>'), true);
});

test('treats real content as non-empty', () => {
  assert.equal(isEditorContentEmpty('<p>Hello world</p>'), false);
  assert.equal(isEditorContentEmpty('<h2>Heading</h2>'), false);
});
