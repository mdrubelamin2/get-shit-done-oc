const path = require('path');

const CONFIG = {
  sourceDir: path.join(__dirname, '..', '..'),
  outputDir: path.join(__dirname, '..', '..', '.agent'),
  agentsDir: 'agents',
  commandsDir: 'commands/gsd',
  templatesDir: 'get-shit-done/templates',

  // Workflow size limits (Antigravity constraint)
  maxWorkflowSize: 10000,  // 10K chars safety limit
  splitThreshold: 1,
};

module.exports = CONFIG;
