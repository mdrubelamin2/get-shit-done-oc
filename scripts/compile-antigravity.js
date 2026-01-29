#!/usr/bin/env node

/**
 * GSD-to-Antigravity Compiler
 * 
 * Transforms Get-Shit-Done's agents and commands into native Antigravity
 * Skills and Workflows.
 * 
 * Architecture:
 * - agents to .agent/skills
 * - commands/gsd to .agent/workflows
 * - Task() calls to Skill invocation patterns
 */

const path = require('path');
const CONFIG = require('./compiler/config');
const { ensureDir } = require('./compiler/utils');
const { compileAllAgents } = require('./compiler/skills');
const { compileAllCommands } = require('./compiler/workflows');
const { copyResourceDirectories, generateGeminiInstructions } = require('./compiler/resources');

function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' GSD → Antigravity Compiler');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Create output directories
  ensureDir(path.join(CONFIG.outputDir, 'skills'));
  ensureDir(path.join(CONFIG.outputDir, 'workflows'));

  // Compile agents to skills
  const skills = compileAllAgents();

  // Compile commands to workflows
  const workflows = compileAllCommands();

  // Copy resource directories
  copyResourceDirectories();

  // Generate strict instructions
  generateGeminiInstructions();

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' ✓ Compilation Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Summary:`);
  console.log(`   Skills:    ${skills.length}`);
  console.log(`   Workflows: ${workflows.length}`);
  console.log(`   Resources: templates, references, workflows`);
  console.log(`   Strictness: GEMINI.md generated`);
  console.log(`\n📁 Output: ${CONFIG.outputDir}`);
  console.log(`\n📖 Next Steps:`);
  console.log(`   1. Review compiled files in .agent/`);
  console.log(`   2. Rules source template: antigravity/GEMINI.md`);
  console.log(`   3. Installation: npm run install:antigravity`);
  console.log(`   4. Uninstallation: npm run uninstall:antigravity (Selective Cleanup)`);
  console.log(`   5. Documentation: ANTIGRAVITY_GUIDE.md`);
  console.log('');
}

if (require.main === module) {
  main();
}

module.exports = { compileAllAgents, compileAllCommands };
