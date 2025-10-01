import { ProblemModel } from '@/infra/db/models/problem.model';

export async function addRunWrapperCodeToTemplateCodes() {
  const problems = await ProblemModel.find({ 'templateCodes': { $exists: true, $ne: [] } });

  let updatedCount = 0;

  for (const problem of problems) {
    if (!Array.isArray(problem.templateCodes)) continue;

    let updated = false;

    problem.templateCodes = problem.templateCodes.map((template: any) => {
      if (template.runWrapperCode === undefined) {
        updated = true;
        return {
          ...template,
          runWrapperCode: '',
        };
      }
      return template;
    });

    if (updated) {
      await problem.save();
      updatedCount++;
    }
  }

  console.log(`Added runWrapperCode to ${updatedCount} problems.`);
}
