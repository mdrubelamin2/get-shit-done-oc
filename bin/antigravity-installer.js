#!/usr/bin/env node

/**
 * Antigravity GSD Installer
 * 
 * Provides automated installation of GSD content into Antigravity
 * environments, supporting both local (per-project) and global modes.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// ============================================================================
// Configuration (Target Paths)
// ============================================================================

const ANTIGRAVITY_CONFIG = {
  // Global mapping (Standard Antigravity paths)
  global: {
    baseDir: path.join(os.homedir(), '.gemini'),
    antigravityDir: path.join(os.homedir(), '.gemini', 'antigravity'),
    workflows: path.join(os.homedir(), '.gemini', 'antigravity', 'global_workflows'),
    skills: path.join(os.homedir(), '.gemini', 'antigravity', 'global_skills'),
    resources: path.join(os.homedir(), '.gemini', 'antigravity', 'gsd_resources'),
    mainRules: path.join(os.homedir(), '.gemini', 'GEMINI.md'),
  },
  // Local mapping (Relative to project root)
  local: {
    workflows: '.agent/workflows',
    skills: '.agent/skills',
    resources: '.agent/resources',
    mainRules: '.agent/rules/GSD_GEMINI.md',
  }
};

const SOURCE_DIR = path.join(__dirname, '..', '.agent');

// Rule source prioritization
function getRuleSource() {
  const projectRules = path.join(__dirname, '..', 'antigravity', 'GEMINI.md');
  const compiledRules = path.join(SOURCE_DIR, 'rules', 'GSD_GEMINI.md');
  return fs.existsSync(projectRules) ? projectRules : compiledRules;
}

function smartMergeRules(srcPath, destPath) {
  const srcContent = fs.readFileSync(srcPath, 'utf8').trim();
  let destContent = '';
  if (fs.existsSync(destPath)) {
    destContent = fs.readFileSync(destPath, 'utf8');
  }

  const startMarker = '<!-- GSD_START -->';
  const endMarker = '<!-- GSD_END -->';

  if (destContent.includes(startMarker) && destContent.includes(endMarker)) {
    console.log(`  ${cyan}↺ GSD block detected. Performing smart replacement...${reset}`);
    const startIndex = destContent.indexOf(startMarker);
    const endIndex = destContent.indexOf(endMarker) + endMarker.length;

    const before = destContent.substring(0, startIndex);
    const after = destContent.substring(endIndex);

    const mergedContent = (before.trim() + '\n\n' + srcContent + '\n\n' + after.trim()).trim();
    fs.writeFileSync(destPath, mergedContent);
    return true;
  }

  console.log(`  ${cyan}+ No GSD block detected. Merging (appending) rules...${reset}`);
  const mergedContent = destContent.trim() + '\n\n' + srcContent;
  fs.writeFileSync(destPath, mergedContent);
  return true;
}

function selectiveRuleRemoval(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  const startMarker = '<!-- GSD_START -->';
  const endMarker = '<!-- GSD_END -->';

  if (content.includes(startMarker) && content.includes(endMarker)) {
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker) + endMarker.length;

    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);

    // Clean up extra whitespace
    const result = (before.trim() + '\n\n' + after.trim()).trim();

    if (result === '') {
      console.log(`  - [DELETE] ${path.basename(filePath)} (empty after GSD removal)`);
      fs.unlinkSync(filePath);
    } else {
      console.log(`  - [CLEAN] Removed GSD block from ${path.basename(filePath)}`);
      fs.writeFileSync(filePath, result);
    }
    return true;
  }
  return false;
}

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

// ============================================================================
// Utilities
// ============================================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirRecursive(src, dest, transform = null) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, transform);
    } else {
      if (transform && entry.name.endsWith('.md')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = transform(content);
        fs.writeFileSync(destPath, content);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function deleteManifestItems(targetDir, manifestSubDir) {
  const manifestPath = path.join(SOURCE_DIR, manifestSubDir);
  if (!fs.existsSync(manifestPath)) return;

  const items = fs.readdirSync(manifestPath);
  for (const item of items) {
    const targetPath = path.join(targetDir, item);
    if (fs.existsSync(targetPath)) {
      console.log(`  - [DELETE] ${item}`);
      if (fs.lstatSync(targetPath).isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// ============================================================================
// Path Rewriter for Global Installation
// ============================================================================

function globalPathTransform(content) {
  let result = content;

  // Rewrite skill references
  // .agent/skills/X/SKILL.md -> ~/.gemini/antigravity/global_skills/X/SKILL.md
  result = result.replace(
    /\.agent\/skills\//g,
    ANTIGRAVITY_CONFIG.global.skills + '/'
  );

  // Rewrite resource references
  // .agent/resources/X -> ~/.gemini/antigravity/gsd_resources/X
  result = result.replace(
    /\.agent\/resources\//g,
    ANTIGRAVITY_CONFIG.global.resources + '/'
  );

  // Rewrite workflow references if they use relative paths starting with gsd:
  // @gsd:X -> @~/.gemini/antigravity/global_workflows/gsd:X.md
  // This is tricky as Antigravity handles @ references. We'll leave gsd: prefixed ones
  // as they are usually resolved within the same directory, but if they are absolute
  // in the user's mind we might need to point them to global_workflows.

  return result;
}

// ============================================================================
// Installation Orchestration
// ============================================================================

async function installLocal() {
  console.log(`\n📦 ${cyan}Installing locally to this project...${reset}`);

  const projectRoot = process.cwd();

  // Copy skills
  console.log('  - Copying skills...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'skills'),
    path.join(projectRoot, '.agent', 'skills')
  );

  // Copy workflows
  console.log('  - Copying workflows...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'workflows'),
    path.join(projectRoot, '.agent', 'workflows')
  );

  // Copy resources
  console.log('  - Copying resources...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'resources'),
    path.join(projectRoot, '.agent', 'resources')
  );

  // Rule management - Local keeping rules isolated in GSD_GEMINI.md
  const ruleSrc = getRuleSource();
  if (fs.existsSync(ruleSrc)) {
    console.log('  - Copying methodology rules to .agent/rules/GSD_GEMINI.md...');
    ensureDir(path.join(projectRoot, '.agent', 'rules'));
    fs.copyFileSync(ruleSrc, path.join(projectRoot, '.agent', 'rules', 'GSD_GEMINI.md'));
  }

  console.log(`\n${green}✓ Local installation complete!${reset}\n`);
}

async function uninstallLocal() {
  console.log(`\n🗑️  ${cyan}Uninstalling GSD locally from this project...${reset}`);
  const projectRoot = process.cwd();

  console.log('  - Removing GSD assets...');
  deleteManifestItems(path.join(projectRoot, '.agent', 'skills'), 'skills');
  deleteManifestItems(path.join(projectRoot, '.agent', 'workflows'), 'workflows');
  deleteManifestItems(path.join(projectRoot, '.agent', 'resources'), 'resources');

  // Clean up isolated rules
  const ruleFile = path.join(projectRoot, '.agent', 'rules', 'GSD_GEMINI.md');
  if (fs.existsSync(ruleFile)) {
    console.log('  - [DELETE] .agent/rules/GSD_GEMINI.md');
    fs.unlinkSync(ruleFile);
  }

  // Also clean up legacy GEMINI.md if it exists in .gemini
  const legacyRules = path.join(projectRoot, '.gemini', 'GEMINI.md');
  if (fs.existsSync(legacyRules)) {
    console.log('  - [DELETE] .gemini/GEMINI.md (legacy)');
    fs.unlinkSync(legacyRules);
  }

  console.log(`\n${green}✓ Local uninstallation complete!${reset}\n`);
}

async function installGlobal() {
  console.log(`\n🌍 ${cyan}Installing globally to ~/.gemini/antigravity...${reset}`);

  // Check GEMINI.md conflict
  if (fs.existsSync(ANTIGRAVITY_CONFIG.global.mainRules)) {
    console.log(`\n${yellow}⚠ Conflict detected: ~/.gemini/GEMINI.md already exists.${reset}`);
    console.log('  1) Overwrite  - Replace existing rules with GSD rules');
    console.log('  2) Smart Merge - Append GSD rules to your existing rules');
    console.log('  3) Cancel     - Stop global installation');

    const answer = await question('\nChoice (1-3): ');

    if (answer === '1') {
      console.log('  Overwriting global rules...');
      fs.copyFileSync(getRuleSource(), ANTIGRAVITY_CONFIG.global.mainRules);
    } else if (answer === '2') {
      console.log('  Merging GSD rules into ~/.gemini/GEMINI.md...');
      const success = smartMergeRules(getRuleSource(), ANTIGRAVITY_CONFIG.global.mainRules);
      if (success) console.log(`  ${green}✓ Rules merged successfully!${reset}`);
    } else {
      console.log(`\n${yellow}Installation cancelled.${reset}`);
      console.log(`💡 ${cyan}Tip: You can still install GSD locally to this project by choosing "Local" in the main menu.${reset}\n`);
      return; // Stop installation
    }
  } else {
    console.log('  - Copying global rules...');
    ensureDir(ANTIGRAVITY_CONFIG.global.baseDir);
    fs.copyFileSync(
      getRuleSource(),
      ANTIGRAVITY_CONFIG.global.mainRules
    );
  }

  // Copy skills with translation
  console.log('  - Copying global skills...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'skills'),
    ANTIGRAVITY_CONFIG.global.skills,
    globalPathTransform
  );

  // Copy workflows with translation
  console.log('  - Copying global workflows...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'workflows'),
    ANTIGRAVITY_CONFIG.global.workflows,
    globalPathTransform
  );

  // Copy resources
  console.log('  - Copying global resources...');
  copyDirRecursive(
    path.join(SOURCE_DIR, 'resources'),
    ANTIGRAVITY_CONFIG.global.resources,
    globalPathTransform
  );

  console.log(`\n${green}✓ Global installation complete!${reset}`);
  console.log(`  Workflows at: ${ANTIGRAVITY_CONFIG.global.workflows}`);
  console.log(`  Skills at:    ${ANTIGRAVITY_CONFIG.global.skills}\n`);
}

async function uninstallGlobal() {
  console.log(`\n🌍 🗑️  ${cyan}Uninstalling GSD globally from ~/.gemini/antigravity...${reset}`);

  // Selective delete based on manifest
  console.log('  - Removing global skills...');
  deleteManifestItems(ANTIGRAVITY_CONFIG.global.skills, 'skills');

  console.log('  - Removing global workflows...');
  deleteManifestItems(ANTIGRAVITY_CONFIG.global.workflows, 'workflows');

  console.log('  - Removing global resources...');
  // Since gsd_resources is a dedicated GSD folder, we remove the main types
  deleteManifestItems(ANTIGRAVITY_CONFIG.global.resources, 'resources');

  // Rule 0 removal
  if (fs.existsSync(ANTIGRAVITY_CONFIG.global.mainRules)) {
    if (!selectiveRuleRemoval(ANTIGRAVITY_CONFIG.global.mainRules)) {
      console.log('  - [DELETE] ~/.gemini/GEMINI.md');
      fs.unlinkSync(ANTIGRAVITY_CONFIG.global.mainRules);
    }
  }

  console.log(`\n${green}✓ Global uninstallation complete!${reset}\n`);
}

async function main() {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(` ${cyan}Antigravity GSD Manager${reset}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.log(`${red}Error: .agent/ directory not found. Please run 'npm run build:antigravity' first.${reset}`);
    process.exit(1);
  }

  // Handle flash flags
  const args = process.argv.slice(2);
  const isUninstall = args.includes('--uninstall') || args.includes('-u');

  if (args.includes('--local') || args.includes('-l')) {
    if (isUninstall) await uninstallLocal();
    else await installLocal();
  } else if (args.includes('--global') || args.includes('-g')) {
    if (isUninstall) await uninstallGlobal();
    else await installGlobal();
  } else {
    // Interactive
    if (isUninstall) {
      console.log(`\nWhere would you like to uninstall GSD from?`);
      console.log(`1) ${cyan}Local${reset}  - Only from this project`);
      console.log(`2) ${cyan}Global${reset} - Cross-project (cleans ~/.gemini/antigravity/)`);
      console.log(`3) ${red}Cancel${reset}`);

      const choice = await question('\nChoice (1-3): ');
      if (choice === '1') await uninstallLocal();
      else if (choice === '2') await uninstallGlobal();
      else console.log('Uninstallation cancelled.');
    } else {
      console.log(`\nWhere would you like to install GSD?`);
      console.log(`1) ${cyan}Local${reset}  - Only in this project (copies to .agent/)`);
      console.log(`2) ${cyan}Global${reset} - Cross-project (copies to ~/.gemini/antigravity/)`);
      console.log(`3) ${red}Cancel${reset}`);

      const choice = await question('\nChoice (1-3): ');

      if (choice === '1') {
        await installLocal();
      } else if (choice === '2') {
        await installGlobal();
      } else {
        console.log('Installation cancelled.');
      }
    }
  }

  rl.close();
}

main();
