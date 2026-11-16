import fs from 'fs/promises';
import path from 'path';

function getVaultPath(): string {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (!vaultPath) {
    throw new Error('OBSIDIAN_VAULT_PATH environment variable is required.');
  }
  return vaultPath;
}

function resolveVaultPath(filename: string): string {
  const vaultPath = path.resolve(getVaultPath());
  const targetPath = path.resolve(vaultPath, filename);
  const rel = path.relative(vaultPath, targetPath);

  if (!rel || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    throw new Error('Invalid path. Cannot access outside the vault.');
  }

  return targetPath;
}

export async function searchNotes(query: string): Promise<string[]> {
  const files = await fs.readdir(getVaultPath(), { recursive: true });
  return files.filter(f => f.includes(query) && f.endsWith('.md'));
}

export async function readNote(filename: string): Promise<string> {
  const safePath = resolveVaultPath(filename);
  return await fs.readFile(safePath, 'utf-8');
}

export async function editNote(filename: string, content: string): Promise<void> {
  const safePath = resolveVaultPath(filename);
  await fs.writeFile(safePath, content, 'utf-8');
}

export async function addNote(filename: string, content: string): Promise<void> {
  const safePath = resolveVaultPath(filename);
  await fs.writeFile(safePath, content, { encoding: 'utf-8', flag: 'wx' });
}
