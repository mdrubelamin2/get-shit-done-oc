// skills.js
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { ensureDir, parseFrontmatter, extractAgentName } = require('./utils');
const { rewriteResourcePaths, makeContentPlatformAgnostic } = require('./transformers');

function compileAgentToSkill(agentPath) {
  const content = fs.readFileSync(agentPath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);
  const agentName = extractAgentName(path.basename(agentPath));

  // Create skill directory
  const skillDir = path.join(CONFIG.outputDir, 'skills', agentName);
  ensureDir(skillDir);

  // Process body for platform-agnosticism
  let processedBody = body;
  processedBody = rewriteResourcePaths(processedBody);
  processedBody = makeContentPlatformAgnostic(processedBody);

  // Generate SKILL.md
  const skillContent = `---
name: ${agentName}
description: ${frontmatter.description || 'GSD Agent'}
---

${processedBody}
`;

  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent);

  console.log(`✓ Created skill: ${agentName}`);
  return agentName;
}

function compileAllAgents() {
  const agentsPath = path.join(CONFIG.sourceDir, CONFIG.agentsDir);
  const agentFiles = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));

  console.log(`\n📦 Compiling ${agentFiles.length} agents to skills...\n`);

  const skills = [];
  for (const file of agentFiles) {
    const skillName = compileAgentToSkill(path.join(agentsPath, file));
    skills.push(skillName);
  }

  return skills;
}

module.exports = {
  compileAgentToSkill,
  compileAllAgents
};
