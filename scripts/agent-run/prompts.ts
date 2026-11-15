/** Prompts handed to `claude -p`. Kept in one file so wording changes (retro D13) do not touch the flow. */
import type { ReviewFinding } from './schemas';
import type { TaskKind } from './spec';

export const REPORT_HEADING = '## Đề xuất cho môi trường';

export const plannerPrompt = (taskDir: string): string =>
  `Plan the task in ${taskDir} (use the plan-task skill). Write ${taskDir}/plan.md, or return need_info / blocked as the skill says. Final answer: only the JSON object.`;

export const implementerPrompt = (taskDir: string, resumed: boolean): string =>
  resumed
    ? `You are RESUMING task ${taskDir} in a fresh session: a person answered the open questions or approved the blocked items in spec.md, and earlier work may already be in the working tree. Read spec.md (including any answers) and plan.md, check what exists with Read/Glob/Grep, finish the remaining plan steps test-first, write report.md, and return the final JSON.`
    : `Implement task ${taskDir}. Read spec.md and plan.md first and follow your instructions. Final answer: only the JSON object.`;

export const fixPrompt = (reason: string, details: string): string =>
  `${reason}\n\n${details}\n\nUse the mattpocock-skills:diagnosing-bugs skill, fix the cause (not the symptom), re-run the relevant checks, update report.md if the work changed, and return the final JSON again.`;

export const reviewerPrompt = (taskDir: string): string =>
  `Review the current branch against dev with the mattpocock-skills:code-review skill. Task directory: ${taskDir} (spec.md is the spec; the fixed point is dev). Final answer: only the JSON object.`;

// --- UI checks (D30). Deliberately minimal: step 8 tunes this against a real UI task. ---
export const uiCheckPrompt = (taskDir: string, url: string): string =>
  `The dev server for this branch is running at ${url}. Using the browser tools, check the pages this task touches (see ${taskDir}/spec.md and plan.md) with the mobile-native, break-ui and impeccable (audit) skills. Report only real defects as findings (severity blocker/major only when the acceptance criteria or usability on mobile is broken). Do not change files. Final answer: only the JSON object (reviewer schema).`;

export const retroPrompt = (taskDir: string, kind: TaskKind | null = null): string =>
  `/mattpocock-skills:retro\n\nReview THIS session (the work on task ${taskDir}); include the skills and agents used. Do not stop to present candidates interactively: append the candidate list, in severity order, as bullets under the heading "${REPORT_HEADING}" at the end of ${taskDir}/report.md (create the heading if missing). Touch no other file.${
    kind === 'ui'
      ? ` This was a UI task: after the retro, also run the learn-taste skill on this session and append what it would record as further bullets under the same heading (it must not write anywhere else).`
      : ''
  }`;

/** D12/skill table: after a stop in situation 7 or 8, the implementer session writes a handoff for whoever continues. */
export const handoffPrompt = (taskDir: string): string =>
  `/mattpocock-skills:handoff The next session continues task ${taskDir} by hand or in a fresh agent run: what is done, what still fails or is unfinished, what you tried.\n\nDo NOT write any file (writes are blocked in this phase). Reply with the complete handoff document as your final answer text; the runner saves it as handoff.md in the task directory.`;

export const retroNeedPrompt = (): string =>
  'You ran out of turns before finishing the retro. Without doing more work, say how many more turns you need to finish (turns_needed) and why (reason).';

export const prBodyPrompt = (args: {
  taskDir: string;
  branch: string;
  commitSubject: string;
  minorFindings: ReviewFinding[];
  bundleNote: string;
}): string =>
  [
    `Write the pull request body for branch ${args.branch} (title: "${args.commitSubject}") into the dev branch.`,
    `Use the mattpocock-skills:pr skill for ideas, but .github/PULL_REQUEST_TEMPLATE.md wins: keep every heading of the template exactly, tick exactly one "Type" box, fill every field or write "Không", write in Vietnamese like the template, keep the "## 💬 Notes" section.`,
    `Facts: task spec ${args.taskDir}/spec.md, report ${args.taskDir}/report.md, diff via git diff dev...HEAD.`,
    args.minorFindings.length
      ? `Review left these non-blocking findings (mention under "Gap và lưu ý"):\n${args.minorFindings.map((f) => `- [${f.severity}] ${f.file ?? ''} ${f.message}`).join('\n')}`
      : '',
    args.bundleNote,
    'Never mention AI tools, assistants or model names, and do not write the names of the agent configuration folder or the root guidance file; say "thư mục cấu hình agent" or "file hướng dẫn gốc" instead.',
    'Final answer: only the JSON object {"body": "..."}.',
  ]
    .filter(Boolean)
    .join('\n\n');

export const prBodyFixPrompt = (errors: string): string =>
  `The PR body failed validation:\n${errors}\nFix exactly these problems (keep template headings, tick exactly one type, no forbidden words) and return {"body": "..."} again.`;
