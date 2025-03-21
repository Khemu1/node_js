import fs from "fs";
import path from "path";

function copyFolderSync(source, target) {
  fs.mkdirSync(target, { recursive: true });
  fs.readdirSync(source).forEach((file) => {
    const srcFile = path.join(source, file);
    const destFile = path.join(target, file);

    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFolderSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

const sourceDirs = ["views", "public"];
const targetDir = "dist";

sourceDirs.forEach((dir) => {
  copyFolderSync(dir, path.join(targetDir, dir));
});

console.log("Static files copied successfully!");
