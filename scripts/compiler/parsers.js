// parsers.js

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

function parseAndReplaceTaskCalls(content) {
  let result = '';
  let i = 0;

  while (i < content.length) {
    // Look for "Task("
    if (content.substring(i).startsWith('Task(')) {
      const startIndex = i;
      i += 5; // Skip 'Task('

      let nesting = 1;
      let inString = null; // null, "'", '"', or "`"
      let escaped = false;
      let closingIndex = -1;

      // Find matching closing parenthesis
      let j = i;
      while (j < content.length) {
        const char = content[j];

        if (escaped) {
          escaped = false;
          j++;
          continue;
        }

        if (char === '\\') {
          escaped = true;
          j++;
          continue;
        }

        if (inString) {
          if (char === inString) {
            inString = null;
          }
        } else {
          if (char === '"' || char === "'" || char === '`') {
            inString = char;
          } else if (char === '(') {
            nesting++;
          } else if (char === ')') {
            nesting--;
            if (nesting === 0) {
              closingIndex = j;
              break;
            }
          }
        }
        j++;
      }

      if (closingIndex !== -1) {
        // We found a complete Task(...) calls
        const body = content.substring(i, closingIndex);

        // Parse the body for keys
        const startPos = i;

        let promptValue = null;
        let subagentType = null;

        // Helper to extract value starting at index k until comma or end
        const extractValue = (k) => {
          let valNesting = 0;
          let valInString = null;
          let valEscaped = false;
          let m = k;

          while (m < body.length) {
            const c = body[m];

            if (valEscaped) { valEscaped = false; m++; continue; }
            if (c === '\\') { valEscaped = true; m++; continue; }

            if (valInString) {
              if (c === valInString) valInString = null;
            } else {
              if (c === '"' || c === "'" || c === '`') valInString = c;
              else if (c === '(' || c === '{' || c === '[') valNesting++;
              else if (c === ')' || c === '}' || c === ']') valNesting--;
              else if (c === ',' && valNesting === 0) {
                return { value: body.substring(k, m).trim(), end: m };
              }
            }
            m++;
          }
          return { value: body.substring(k).trim(), end: m };
        };

        let k = 0;
        while (k < body.length) {
          // Skip whitespace
          if (/\s/.test(body[k])) { k++; continue; }

          // Check for keys
          if (body.substring(k).startsWith('prompt=')) {
            const { value, end } = extractValue(k + 7); // skip prompt=
            promptValue = value;
            k = end + 1; // skip comma
          } else if (body.substring(k).startsWith('subagent_type=')) {
            const { value, end } = extractValue(k + 14); // skip subagent_type=
            // Extract string content: "foo" -> foo
            if (value.startsWith('"') && value.endsWith('"')) {
              subagentType = value.slice(1, -1);
            } else {
              subagentType = value;
            }
            k = end + 1;
          } else {
            // Unknown char or other keys, skip to next comma
            const { end } = extractValue(k);
            k = end + 1;
          }
        }

        if (subagentType) {
          // Cleanup prompt value if it's a simple string literal
          if (promptValue && promptValue.startsWith('"') && promptValue.endsWith('"') && !promptValue.includes('+')) {
            promptValue = promptValue.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
          }

          result += compileTaskInvocation(`Task(${body})`, subagentType, promptValue);
          i = closingIndex + 1;
          continue;
        }
      }
    }

    result += content[i];
    i++;
  }

  return result;
}

module.exports = {
  compileTaskInvocation,
  parseAndReplaceTaskCalls
};
