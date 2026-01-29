// workflows.js
const fs = require('fs');
const path = require('path');
const CONFIG = require('./config');
const { parseFrontmatter, extractCommandName } = require('./utils');
const { rewriteResourcePaths, makeContentPlatformAgnostic, addTurboAnnotations } = require('./transformers');
const { parseAndReplaceTaskCalls } = require('./parsers');

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
    console.log(`  ⚠ Cannot split ${commandName}: no phase markers found`);
    return null;
  }

  const threshold = CONFIG.maxWorkflowSize * CONFIG.splitThreshold;
  let mainContent = '';
  let mainSize = 0;
  const splitPhases = [];

  const firstPhaseStart = phases[0].startChar;
  const preamble = body.substring(0, firstPhaseStart);
  mainContent = preamble;
  mainSize = preamble.length;

  for (const phase of phases) {
    if (mainSize + phase.size > threshold && splitPhases.length === 0) {
      splitPhases.push(phase);
    } else if (splitPhases.length > 0) {
      splitPhases.push(phase);
    } else {
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

  // Transform pipeline
  let transformedBody = body;
  transformedBody = rewriteResourcePaths(transformedBody);
  transformedBody = makeContentPlatformAgnostic(transformedBody);

  // Use custom parser instead of regex
  transformedBody = parseAndReplaceTaskCalls(transformedBody);

  transformedBody = addTurboAnnotations(transformedBody);

  // Workflow splitting logic
  const fullContent = `---\ndescription: ${frontmatter.description || commandName}\n---\n\n${transformedBody}`;

  if (shouldSplitWorkflow(fullContent)) {
    console.log(`  ⚠ Workflow too large (${fullContent.length} chars), splitting...`);

    const splitResult = splitWorkflowIntoPhases(commandName, frontmatter, transformedBody);

    if (splitResult) {
      const { mainContent, splitPhases } = splitResult;

      for (let i = 0; i < splitPhases.length; i++) {
        createSubWorkflow(commandName, splitPhases[i], i, splitPhases.length);
      }

      let finalMainContent = mainContent;
      for (const phase of splitPhases) {
        finalMainContent += createPhaseReference(commandName, phase);
      }

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

  // Normal workflow
  const workflowPath = path.join(CONFIG.outputDir, 'workflows', `gsd:${commandName}.md`);
  fs.writeFileSync(workflowPath, fullContent);

  console.log(`✓ Created workflow: gsd:${commandName} (${fullContent.length} chars)`);
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

module.exports = {
  compileCommandToWorkflow,
  compileAllCommands
};
