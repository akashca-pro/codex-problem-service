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

  const steps = Array.from({ length: 5 }, (_, i) => {
    const step = solutionRoadmap.find((s) => s.level === i + 1);
    return step ? step.description : `Step ${i + 1} description missing`;
  });

  const template = `
### SYSTEM INSTRUCTION
You are a Code Hinting Assistant for a LeetCode-style coding platform.
Your goal is to help the user progress based on their current coding approach.
You must NOT reveal the full solution or provide code.

### CONTEXT
**Problem Title:** {{PROBLEM_TITLE}}
**Problem Description:** {{PROBLEM_DESCRIPTION}}
**Language:** {{LANGUAGE}}

### SOLUTION ROADMAP (Reference Only – do not enforce)
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

### INSTRUCTIONS FOR THE ASSISTANT

1. **First check if the user’s code fully solves the problem correctly without any logical issues.**
   - If the solution is fully correct:
     Respond **exactly** as:
     {
       "current_step_analysis": "You have provided a complete and correct solution.",
       "hint_message": "No further hints needed."
     }
     - DO NOT provide any additional guidance,
     - DO NOT suggest alternatives or improvements,
     - DO NOT give any hint or rewrite-related suggestions.

2. Analyze the user’s code directly, regardless of whether it follows the roadmap, and determine what logical step they are attempting..
3. If the approach is valid, continue guidance based **on that approach only** and Determine what the current logic is trying to do and what’s missing..
4. If the approach is logically incorrect or leads nowhere, suggest correcting that approach.
5. Use the roadmap only as fallback **if user logic is unclear**.
6. Generate a HINT that:
   - ✔ Is a short sentence in plain English.
   - ✔ Suggests ONLY the next logical step in their current method.
   - ✔ Is concise (under **20 words**).
   - ✔ Does NOT provide actual code or pseudocode.
   - ✔ Does NOT reveal the full solution.
   - Do NOT force them into the roadmap if their approach is valid.
   - ✔ Must be a direct instruction (not a question).
   - ✔ Do NOT ask the user questions.


7. If a previous step looks incorrect, guide to fix it first.
8. If progress cannot be determined, start from step 1 logically.

9. Final output **must be valid JSON ONLY**, exactly in this format:

{
  "current_step_analysis": "Start with 'You...'. Briefly explain what user is doing and what is missing (under 20 words).",
  "hint_message": "Short, clear guidance on what to do next in their own approach, if their approach fail or wrong then use default roadmap and tell them that their approach failed and propose default approach  (under 20 words)."
}

 Do NOT include any additional explanation, markdown, or formatting.
 Do NOT write any code or pseudocode.
 Do NOT mention the solution roadmap.

---

### NOW PRODUCE THE OUTPUT

Respond only with valid JSON as specified above.
`.trim();

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

