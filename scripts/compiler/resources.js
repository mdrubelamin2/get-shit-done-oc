// resources.js
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { ensureDir, countFiles } = require('./utils');
const { rewriteResourcePaths, makeContentPlatformAgnostic } = require('./transformers');
const { parseAndReplaceTaskCalls } = require('./parsers');

function copyResourceDirectories() {
  console.log(`\n📚 Copying resource directories...\n`);

  const resourcesDir = path.join(CONFIG.outputDir, 'resources');
  ensureDir(resourcesDir);

  const resourceDirs = [
    { src: 'get-shit-done/templates', dest: 'templates' },
    { src: 'get-shit-done/references', dest: 'references' },
    { src: 'get-shit-done/workflows', dest: 'workflows' }
  ];

  for (const { src, dest } of resourceDirs) {
    const srcPath = path.join(CONFIG.sourceDir, src);
    const destPath = path.join(resourcesDir, dest);

    if (fs.existsSync(srcPath)) {
      copyDirRecursive(srcPath, destPath);
      const fileCount = countFiles(destPath);
      console.log(`✓ Copied ${dest}: ${fileCount} files`);
    } else {
      console.log(`⚠ Skipped ${dest}: source not found`);
    }
  }
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      if (entry.name.endsWith('.md')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = rewriteResourcePaths(content);
        content = makeContentPlatformAgnostic(content);
        // Correctly apply parser replacement to resources too
        content = parseAndReplaceTaskCalls(content);
        fs.writeFileSync(destPath, content);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function generateGeminiInstructions() {
  const sourcePath = path.join(CONFIG.sourceDir, 'antigravity', 'GEMINI.md');
  if (!fs.existsSync(sourcePath)) {
    console.log('⚠ Source rules not found at: antigravity/GEMINI.md');
    return;
  }

  const content = fs.readFileSync(sourcePath, 'utf8');

  const rulesDir = path.join(CONFIG.outputDir, 'rules');
  ensureDir(rulesDir);
  const outputPath = path.join(rulesDir, 'GEMINI.md');
  fs.writeFileSync(outputPath, content);
  console.log('✓ Created strict instructions: rules/GEMINI.md');
}

module.exports = {
  copyResourceDirectories,
  generateGeminiInstructions
};
