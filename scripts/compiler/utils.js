const fs = require('fs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim();
    }
  }

  return { frontmatter, body: match[2] };
}

function extractAgentName(filename) {
  // gsd-project-researcher.md → project-researcher
  return filename.replace(/^gsd-/, '').replace(/\.md$/, '');
}

function extractCommandName(filename) {
  // new-project.md → new-project
  return filename.replace(/\.md$/, '');
}

function countFiles(dir) {
  let count = 0;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }

  return count;
}

const path = require('path'); // countFiles needs path but helper signature isn't passing it? No, countFiles impl uses path.join
// We need to require path here
const pathModule = require('path');

// Re-implement countFiles correctly with path dependency
function countFilesWithDeps(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFilesWithDeps(pathModule.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}


module.exports = {
  ensureDir,
  parseFrontmatter,
  extractAgentName,
  extractCommandName,
  countFiles: countFilesWithDeps
};
