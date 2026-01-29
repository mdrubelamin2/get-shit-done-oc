// transformers.js

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
  const modelProfilePattern = /## \d+\. Resolve Model Profile[\s\S]*?(?=## \d+\.|$)/g;
  result = result.replace(modelProfilePattern, '');
  result = result.replace(/## Resolve Model Profile[\s\S]*?(?=## |$)/g, '');

  // "Model lookup table:" pattern specifically
  result = result.replace(/\*\*Model lookup table:\*\*[\s\S]*?(?=## |$)/g, '');

  // Replace "Claude" with "Antigravity" in instructional contexts
  // Clean specific product names first to avoid "Antigravity Code" or "Antigravity.ai"
  result = result.replace(/\bClaude Code\b/gi, 'Antigravity');
  result = result.replace(/\bClaude\.ai\b/gi, 'Antigravity');

  // Generic replacements
  result = result.replace(/\bClaude\b/g, 'Antigravity');
  result = result.replace(/\bCLAUDE\b/g, 'ANTIGRAVITY');

  // General replacements
  result = result.replace(/\bCLAUDE\.md\b/g, 'GEMINI.md');

  // Inject explicit CWD instruction into <process> blocks
  if (result.includes('<process>') && !result.includes('**CRITICAL:** Execute all commands')) {
    result = result.replace(/<process>/g, `<process>\n\n> [!IMPORTANT]\n> **Context:** You are operating in the user's PROJECT DIRECTORY.\n> **CRITICAL:** Execute all commands (ls, cat, mkdir) in the current working directory. DO NOT cd into the workflow source directories.\n`);
  }

  return result;
}

module.exports = {
  addTurboAnnotations,
  rewriteResourcePaths,
  makeContentPlatformAgnostic
};
