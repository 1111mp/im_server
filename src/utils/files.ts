import { dirname } from "path";
import * as fs from "fs-extra";
import { Files } from "formidable";

export function removeFiles(files: Files) {
  for (let name in files) {
    const file = files[name];
    if (Array.isArray(file)) {
      file.forEach((f) => fs.remove(f.path));
    } else {
      fs.remove(file.path);
    }
  }
}

export function mkdirsSync(path: string) {
  if (fs.existsSync(path)) {
    return true;
  } else {
    if (mkdirsSync(dirname(path))) {
      fs.mkdirSync(path);
      return true;
    }
  }
}
