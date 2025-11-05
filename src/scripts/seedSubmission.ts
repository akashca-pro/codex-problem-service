// scripts/generateSubmissions.js
import 'module-alias/register.js';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { SubmissionModel } from '@/db/models/submission.model';
import { ProblemModel } from '@/db/models/problem.model';
import { SUBMISSION_STATUS_TYPES } from '@/const/SubmissionStatus.const.js';
import { Language } from '@/enums/language.enum.js';
import { DIFFICULTY } from '@/const/Difficulty.const.js';

dotenv.config();

async function main() {
  console.log("🚀 Starting submission generation...");

  // --- Connect to MongoDB ---
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("✅ Connected to MongoDB");

  // --- Fetch existing problems ---
  const problems = await ProblemModel.find({});
  if (problems.length === 0) {
    console.error("❌ No problems found in DB. Please add some problems first.");
    process.exit(1);
  }

  console.log(`📚 Found ${problems.length} problems in DB`);

  // --- Generate fake users (you can also use your actual user IDs here) ---
  const fakeUsers = Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    country: faker.location.countryCode('alpha-3'),
  }));

  // --- Generate submissions ---
  const submissions = [];
  for (const user of fakeUsers) {
    // each user solves random problems
    const userProblems = faker.helpers.arrayElements(problems, faker.number.int({ min: 3, max: problems.length }));
    for (const problem of userProblems) {
      const status = faker.helpers.arrayElement(Object.values(SUBMISSION_STATUS_TYPES));
      submissions.push({
        problemId: problem._id,
        userId: user.id,
        title: problem.title,
        status,
        score: 0, // you can update it later
        language: faker.helpers.arrayElement(Object.values(Language)),
        userCode: faker.lorem.paragraph(),
        executionResult: {
          stats: {
            totalTestCase: faker.number.int({ min: 5, max: 10 }),
            passedTestCase: faker.number.int({ min: 0, max: 5 }),
            failedTestCase: faker.number.int({ min: 0, max: 5 }),
            executionTimeMs: faker.number.int({ min: 10, max: 200 }),
            memoryMB: faker.number.int({ min: 10, max: 100 }),
          },
          failedTestCase: {
            index: 1,
            input: '1 2',
            output: '3',
            expectedOutput: '4',
          },
        },
        difficulty: problem.difficulty || faker.helpers.arrayElement(Object.values(DIFFICULTY)),
        isFirst: faker.datatype.boolean(),
        country: user.country,
      });
    }
  }

  // --- Insert into DB ---
  await SubmissionModel.insertMany(submissions);
  console.log(`✅ Inserted ${submissions.length} fake submissions successfully`);

  await mongoose.disconnect();
  console.log("🧹 MongoDB disconnected");
}

main().catch(err => {
  console.error("❌ Error generating submissions:", err);
  process.exit(1);
});