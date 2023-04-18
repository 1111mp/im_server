import { dirname } from 'path';
import { existsSync, mkdirSync, remove } from 'fs-extra';

export function removeFiles(
  files: Record<string, Express.Multer.File | Express.Multer.File[]>,
) {
  for (let name in files) {
    const file = files[name];
    if (Array.isArray(file)) {
      file.forEach((f) => remove(f.originalname));
    } else {
      remove(file.originalname);
    }
  }
}

export function mkdirsSync(path: string) {
  if (existsSync(path)) return true;

  if (mkdirsSync(dirname(path))) {
    mkdirSync(path);
    return true;
  }
}
