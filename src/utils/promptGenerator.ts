import { ISolutionRoadmap } from "@/db/interface/problem.interface";

export function generateHintPrompt({
  problemTitle,
  problemDescription,
  language,
  userCode,
  solutionRoadmap
}: {
  problemTitle: string;
  problemDescription: string;
  language: string;
  userCode: string;
  solutionRoadmap: ISolutionRoadmap[];
}): string {
  // Ensure exactly 5 steps are used – fill empty ones if fewer
  const steps = Array.from({ length: 5 }, (_, i) => {
    const step = solutionRoadmap.find((s) => s.level === i + 1);
    return step ? step.description : `Step ${i + 1} description missing`;
  });

  // Escape any ``` inside user code so it doesn't break the markdown code block

  const template = `
### SYSTEM INSTRUCTION
You are a Code Hinting Assistant for a LeetCode-style coding platform.
Your primary goal is to help the user make progress toward the solution by giving ONLY the next step as a hint. You must NOT reveal the complete solution or provide actual code.

### CONTEXT
**Problem Title:** {{PROBLEM_TITLE}}
**Problem Description:** {{PROBLEM_DESCRIPTION}}
**Language:** {{LANGUAGE}}

### SOLUTION ROADMAP (Logical Steps)
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}
4. {{STEP_4}}
5. {{STEP_5}}

### USER'S CURRENT CODE
language : {{LANGUAGE}}
user code starts here
{{USER_CODE}}
user code ends here


###  INSTRUCTIONS FOR THE ASSISTANT

1. **Analyze** what parts of the roadmap the user has already implemented.
2. **Determine** which step they are currently working on or have last completed.
3. **Identify** what needs to be done next to progress toward the full solution.
4. **Generate a HINT** that:
    - ✔ Is a short, plain English sentence.
    - ✔ Suggests only the next step (not future steps).
    - ✔ Is concise (under **20 words**).
    - ✔ Does NOT provide code or pseudocode.
    - ✔ Does NOT reveal the full solution.
    - Avoids multiple steps or detailed algorithms.
    - Avoids mentioning future steps beyond the next immediate one.
5. If a previously implemented step seems incorrect, hint to fix that instead of moving forward.
6. If unsure, assume guidance is needed for **Step 1**.
7. If the code is completely wrong, hint about the first step and tell to rewrite the code if required.
8. Final output **must be valid JSON ONLY**, following this exact format:

{
  "current_step_analysis": "Start with 'You...'. Explain clearly what was done right and what is still incomplete (under 20 words)..",
  "current_step_number": 1,
  "hint_message": "Your short, helpful hint here for the immediate next step only (under 20 words).."
}

Do NOT include any additional text, explanation, or formatting outside the JSON.  
Do NOT write any code.  
Do NOT mention the solution roadmap in the hint.

---

### 🔍 NOW PRODUCE THE OUTPUT

Respond only with valid JSON as specified above, no markdown, no code blocks, no extra text.
`.trim();

  // Replace placeholders safely using function form to avoid $ issues in values
  return template
    .replace(/{{PROBLEM_TITLE}}/g, () => problemTitle)
    .replace(/{{PROBLEM_DESCRIPTION}}/g, () => problemDescription)
    .replace(/{{LANGUAGE}}/g, () => language)
    .replace(/{{STEP_1}}/g, () => steps[0])
    .replace(/{{STEP_2}}/g, () => steps[1])
    .replace(/{{STEP_3}}/g, () => steps[2])
    .replace(/{{STEP_4}}/g, () => steps[3])
    .replace(/{{STEP_5}}/g, () => steps[4])
    .replace(/{{USER_CODE}}/g, () => userCode);
}

export function generateFullSolutionPrompt({
  problemTitle,
  problemDescription,
  language,
  functionStructure
}: {
  problemTitle: string;
  problemDescription: string;
  language: string;
  functionStructure: string; 
}): string {
  return `
### SYSTEM INSTRUCTION
You are an expert coding assistant for a LeetCode-style platform.  
The user wants the **complete and optimal code solution**.  
Return **only the final code**, without explanation, comments, markdown, or formatting.  
Do NOT write anything else.

### PROBLEM
Title: ${problemTitle}
Description: ${problemDescription}
Language: ${language}

### FUNCTION SIGNATURE
${functionStructure}

### RULES
- Output must be **only working code**.
- Do **not** include any comments, explanation, or markdown.
- Do **not** wrap in code blocks (no \`\`\`).
- Return ONLY the complete function as plain code with no markdown, 
  no comments, no explanation, no extra text. 
  Start directly with 'function ...' and end after the closing bracket.
- Solution must be **clean and optimized**.
- Follow best coding practices.

---

### OUTPUT FORMAT
🔹 Return **only the final code implementation**.

`.trim();
}
