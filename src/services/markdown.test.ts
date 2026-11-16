import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { addNote, editNote, readNote, searchNotes } from './markdown.js';

describe('markdown service', () => {
  let tempVault: string;
  let originalVaultEnv: string | undefined;

  before(async () => {
    originalVaultEnv = process.env.OBSIDIAN_VAULT_PATH;
    tempVault = await fs.mkdtemp(path.join(os.tmpdir(), 'second-brain-test-'));
    await fs.mkdir(path.join(tempVault, 'nested'));
    await fs.writeFile(path.join(tempVault, 'nested', 'sub-note.md'), '# Sub', 'utf-8');
    await fs.writeFile(path.join(tempVault, 'ignore.txt'), 'not markdown', 'utf-8');
    process.env.OBSIDIAN_VAULT_PATH = tempVault;
  });

  after(async () => {
    if (originalVaultEnv === undefined) {
      delete process.env.OBSIDIAN_VAULT_PATH;
    } else {
      process.env.OBSIDIAN_VAULT_PATH = originalVaultEnv;
    }
    await fs.rm(tempVault, { recursive: true, force: true });
  });

  it('adds a new note and refuses to overwrite an existing one', async () => {
    await addNote('hello.md', '# Hello');
    assert.equal(await readNote('hello.md'), '# Hello');
    await assert.rejects(() => addNote('hello.md', '# Overwrite'), { code: 'EEXIST' });
  });

  it('edits an existing note', async () => {
    await editNote('hello.md', '# Updated');
    assert.equal(await readNote('hello.md'), '# Updated');
  });

  it('searches markdown notes recursively by filename', async () => {
    const matches = await searchNotes('sub-note');
    assert.deepEqual(matches, [path.join('nested', 'sub-note.md')]);
    const txtMatches = await searchNotes('ignore');
    assert.deepEqual(txtMatches, []);
  });

  it('rejects path traversal and prefix attacks in readNote, editNote, and addNote', async () => {
    const siblingName = `${path.basename(tempVault)}-other`;
    const badPaths = [
      '../outside.md',
      `../${siblingName}/outside.md`,
      path.resolve(tempVault, '..', 'abs.md'),
      '.',
    ];

    for (const badPath of badPaths) {
      await assert.rejects(() => readNote(badPath), /Invalid path/);
      await assert.rejects(() => editNote(badPath, 'x'), /Invalid path/);
      await assert.rejects(() => addNote(badPath, 'x'), /Invalid path/);
    }
  });
});
