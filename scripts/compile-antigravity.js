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

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  sourceDir: path.join(__dirname, '..'),
  outputDir: path.join(__dirname, '..', '.agent'),
  agentsDir: 'agents',
  commandsDir: 'commands/gsd',
  templatesDir: 'get-shit-done/templates',

  // Workflow size limits (Antigravity constraint)
  maxWorkflowSize: 10000,  // 10K chars safety limit
  splitThreshold: 0.9,     // Split when reaching 90% (9K chars)
};

// ============================================================================
// Utilities
// ============================================================================

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

// ============================================================================
// Skills Compiler
// ============================================================================

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

// ============================================================================
// Workflow Compiler
// ============================================================================

function compileTaskInvocation(taskMatch, agentType, prompt) {
  const promptStr = prompt || 'Follow the skill instructions';
  const skillName = agentType.replace(/^gsd-/, '');

  return `
## ${skillName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}

**Context:** You are operating in the user's PROJECT DIRECTORY.
**CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.

**Task Context:**
${promptStr}

**How to proceed:**
1. Read the ${skillName} skill:
   \`\`\`
   View file: .agent/skills/${skillName}/SKILL.md
   \`\`\`
2. Follow the skill's instructions, applying them to the task context above. Note: You are Antigravity, follow the instructions as Antigravity.
3. Create outputs as specified in the skill
`;
}


function addTurboAnnotations(content) {
  // Add // turbo to safe read-only commands
  const safePatterns = [
    /```bash\n(\[ -[fd] .*?\].*?\n)```/g,  // File/dir checks
    /```bash\n(git status.*?\n)```/g,      // Git status
    /```bash\n(ls .*?\n)```/g,             // List files
    /```bash\n(cat .*?\n)```/g,            // Read files
    /```bash\n(echo .*?\n)```/g,           // Echo
  ];

  let result = content;
  for (const pattern of safePatterns) {
    result = result.replace(pattern, (match, command) => {
      return `// turbo\n\`\`\`bash\n${command}\`\`\``;
    });
  }

  return result;
}

function rewriteResourcePaths(content) {
  // Rewrite GSD resource paths to Antigravity paths
  let result = content;

  // Pattern: [optional @]~/.claude/get-shit-done/(templates|references|workflows)/path
  result = result.replace(
    /(@?)~\/\.claude\/get-shit-done\/(templates|references|workflows)\//g,
    '.agent/resources/$2/'
  );

  // Handle: [optional @]~/.claude/agents/X → .agent/skills/X/SKILL.md
  result = result.replace(
    /(@?)~\/\.claude\/agents\/gsd-([a-z-]+)\.md/g,
    '.agent/skills/$2/SKILL.md'
  );

  // Handle any other ~/.claude/ paths to at least point to local resources
  result = result.replace(
    /~\/\.claude\/get-shit-done\//g,
    '.agent/resources/'
  );

  // Generic cleanup for any remaining ~/.claude paths
  result = result.replace(/~\/\.claude\//g, '.agent/resources/');

  return result;
}

function makeContentPlatformAgnostic(content) {
  // Remove Claude-specific references to make content work in any AI environment
  let result = content;

  // Remove "Resolve Model Profile" sections and Model Lookup Tables
  // These are model-specific and irrelevant for Antigravity workflows
  const modelProfilePattern = /## \d+\. Resolve Model Profile[\s\S]*?(?=## \d+\.|$)/g;
  result = result.replace(modelProfilePattern, '');

  // Also catch variations without numbering if they exist
  result = result.replace(/## Resolve Model Profile[\s\S]*?(?=## |$)/g, '');

  // "Model lookup table:" pattern specifically
  result = result.replace(/\*\*Model lookup table:\*\*[\s\S]*?(?=## |$)/g, '');

  // Replace "Claude" with "Antigravity" in instructional contexts

  // "Claude Code" or "Claude.ai" references
  result = result.replace(/\bClaude Code\b/gi, 'Antigravity');
  result = result.replace(/\bClaude\.ai\b/gi, 'Antigravity');

  // "Claude is the builder" → "Antigravity is the builder"
  result = result.replace(/\bClaude is the (builder|implementer|executor)\b/gi, 'Antigravity is the $1');

  // "Claude does X" → "Antigravity does X"
  result = result.replace(/\bClaude (does|can|should|must|will|has|reads|needs|starts|records|presents)\b/gi, 'Antigravity $1');

  // "for Claude" → "for Antigravity"
  result = result.replace(/\bfor Claude\b/gi, 'for Antigravity');

  // "Claude's X" → "Antigravity's X"
  result = result.replace(/\bClaude's ([a-z]+)\b/gi, "Antigravity's $1");

  // "a different Claude instance" → "a different Antigravity instance"
  result = result.replace(/\ba different Claude instance\b/gi, 'a different Antigravity instance');

  // "Claude (subagent)" or "Claude (gsd-X)"
  result = result.replace(/\bClaude \(subagent\)/gi, 'Antigravity (subagent)');
  result = result.replace(/\bClaude \(gsd-/gi, 'Antigravity (gsd-');

  // "CLAUDE.md" -> "ANTIGRAVITY.md" or generic "CLAUDE" -> "ANTIGRAVITY"
  result = result.replace(/\bCLAUDE\.md\b/g, 'GEMINI.md');
  result = result.replace(/\bCLAUDE\b/g, 'ANTIGRAVITY');

  // Generic "Claude" at word boundaries that weren't caught
  result = result.replace(/\bClaude\b/g, 'Antigravity');


  // Inject explicit CWD instruction into <process> blocks
  if (result.includes('<process>') && !result.includes('**CRITICAL:** Execute all commands')) {
    result = result.replace(/<process>/g, `<process>\n\n> [!IMPORTANT]\n> **Context:** You are operating in the user's PROJECT DIRECTORY.\n> **CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.\n`);
  }

  return result;
}

// ============================================================================
// Workflow Splitting (for size limits)
// ============================================================================

function extractPhases(content) {
  // Extract all phase markers and their positions
  const phases = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^## Phase (\d+(?:\.\d+)?):?\s*(.+)/);
    if (match) {
      phases.push({
        number: match[1],
        title: match[2].trim(),
        startLine: i,
        startChar: lines.slice(0, i).join('\n').length,
      });
    }
  }

  // Calculate end positions and sizes
  for (let i = 0; i < phases.length; i++) {
    const nextStart = i < phases.length - 1 ? phases[i + 1].startChar : content.length;
    phases[i].endChar = nextStart;
    phases[i].size = nextStart - phases[i].startChar;
    phases[i].content = content.substring(phases[i].startChar, nextStart);
  }

  return phases;
}

function shouldSplitWorkflow(content) {
  return content.length > CONFIG.maxWorkflowSize;
}

function splitWorkflowIntoPhases(commandName, frontmatter, body) {
  const phases = extractPhases(body);

  if (phases.length === 0) {
    // No phases found, can't split intelligently
    console.log(`  ⚠ Cannot split ${commandName}: no phase markers found`);
    return null;
  }

  // Determine which phases to split out
  const threshold = CONFIG.maxWorkflowSize * CONFIG.splitThreshold;
  let mainContent = '';
  let mainSize = 0;
  const splitPhases = [];

  // Extract frontmatter and content before first phase
  const firstPhaseStart = phases[0].startChar;
  const preamble = body.substring(0, firstPhaseStart);
  mainContent = preamble;
  mainSize = preamble.length;

  for (const phase of phases) {
    // Check if adding this phase would exceed threshold
    if (mainSize + phase.size > threshold && splitPhases.length === 0) {
      // Start splitting from this phase
      splitPhases.push(phase);
    } else if (splitPhases.length > 0) {
      // Already splitting, continue splitting remaining phases
      splitPhases.push(phase);
    } else {
      // Keep in main workflow
      mainContent += phase.content;
      mainSize += phase.size;
    }
  }

  return {
    mainContent,
    splitPhases,
    preamble,
  };
}

function createSubWorkflow(commandName, phase, phaseIndex, totalPhases) {
  const subWorkflowName = `${commandName}-phase-${phase.number.replace('.', '-')}`;

  const content = `---
description: ${commandName} - Phase ${phase.number}: ${phase.title}
parent: gsd:${commandName}
---

${phase.content.trim()}

---

> [!NOTE]
> **Phase ${phase.number} of ${totalPhases} complete**
> 
> Return to the main workflow to continue: \`@gsd:${commandName}.md\`
`;

  const workflowPath = path.join(CONFIG.outputDir, 'workflows', `gsd:${subWorkflowName}.md`);
  fs.writeFileSync(workflowPath, content);

  console.log(`  ↳ Created sub-workflow: gsd:${subWorkflowName} (${content.length} chars)`);
  return `gsd:${subWorkflowName}`;
}

function createPhaseReference(commandName, phase) {
  const subWorkflowName = `${commandName}-phase-${phase.number.replace('.', '-')}`;

  return `## Phase ${phase.number}: ${phase.title}

> [!NOTE]
> This phase has been extracted to a separate workflow for size management.

**To continue this phase:**
\`\`\`
@gsd:${subWorkflowName}.md
\`\`\`

After completing Phase ${phase.number}, return here to proceed.

`;
}

function compileCommandToWorkflow(commandPath) {
  const content = fs.readFileSync(commandPath, 'utf8');
  const { frontmatter, body } = parseFrontmatter(content);
  const commandName = extractCommandName(path.basename(commandPath));

  // Transform Task() calls to skill invocations
  let transformedBody = body;

  // Rewrite resource paths first
  transformedBody = rewriteResourcePaths(transformedBody);

  // Make content platform-agnostic
  transformedBody = makeContentPlatformAgnostic(transformedBody);

  // Match Task() calls with multiline support - handle both quoted and variable prompts
  const taskPattern = /Task\s*\(\s*(?:prompt\s*=\s*(?:"([^"]*(?:(?:\n|.)*?[^\\])?)"|([^,)\s]+))[\s\S]*?)?subagent_type\s*=\s*"([^"]+)"[\s\S]*?\)/g;

  transformedBody = transformedBody.replace(taskPattern, (match, quotedPrompt, varPrompt, agentType) => {
    const promptValue = quotedPrompt || (varPrompt ? `{${varPrompt}}` : null);
    return compileTaskInvocation(match, agentType, promptValue);
  });

  // Add turbo annotations
  transformedBody = addTurboAnnotations(transformedBody);

  // Check if workflow needs splitting
  const fullContent = `---\ndescription: ${frontmatter.description || commandName}\n---\n\n${transformedBody}`;

  if (shouldSplitWorkflow(fullContent)) {
    console.log(`  ⚠ Workflow too large (${fullContent.length} chars), splitting...`);

    const splitResult = splitWorkflowIntoPhases(commandName, frontmatter, transformedBody);

    if (splitResult) {
      const { mainContent, splitPhases } = splitResult;

      // Create sub-workflows for split phases
      const subWorkflows = [];
      for (let i = 0; i < splitPhases.length; i++) {
        const subName = createSubWorkflow(commandName, splitPhases[i], i, splitPhases.length);
        subWorkflows.push(subName);
      }

      // Build main workflow with phase references
      let finalMainContent = mainContent;
      for (const phase of splitPhases) {
        finalMainContent += createPhaseReference(commandName, phase);
      }

      // Generate main workflow
      const workflowContent = `---
description: ${frontmatter.description || commandName}
---

${finalMainContent}
`;

      const workflowPath = path.join(CONFIG.outputDir, 'workflows', `gsd:${commandName}.md`);
      fs.writeFileSync(workflowPath, workflowContent);

      console.log(`✓ Created workflow: gsd:${commandName} (${workflowContent.length} chars, split into ${splitPhases.length} sub-workflows)`);
      return `gsd:${commandName}`;
    }
  }

  // Normal workflow (no splitting needed)
  const workflowContent = fullContent;
  const workflowPath = path.join(CONFIG.outputDir, 'workflows', `gsd:${commandName}.md`);
  fs.writeFileSync(workflowPath, workflowContent);

  console.log(`✓ Created workflow: gsd:${commandName} (${workflowContent.length} chars)`);
  return `gsd:${commandName}`;
}

function compileAllCommands() {
  const commandsPath = path.join(CONFIG.sourceDir, CONFIG.commandsDir);
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.md'));

  console.log(`\n📝 Compiling ${commandFiles.length} commands to workflows...\n`);

  const workflows = [];
  for (const file of commandFiles) {
    const workflowName = compileCommandToWorkflow(path.join(commandsPath, file));
    workflows.push(workflowName);
  }

  return workflows;
}

// ============================================================================
// Resource Compiler
// ============================================================================

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
      // Copy directory recursively
      copyDirRecursive(srcPath, destPath);

      // Count files
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
      // Process file content for platform-agnosticism if it's a markdown file
      if (entry.name.endsWith('.md')) {
        let content = fs.readFileSync(srcPath, 'utf8');
        content = rewriteResourcePaths(content);
        content = makeContentPlatformAgnostic(content);
        fs.writeFileSync(destPath, content);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
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

// ============================================================================
// Instruction Generator (GEMINI.md for strict mode)
// ============================================================================

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

// ============================================================================
// Main
// ============================================================================

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
  const resourceFiles = copyResourceDirectories();

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

module.exports = { compileAgentToSkill, compileCommandToWorkflow };
