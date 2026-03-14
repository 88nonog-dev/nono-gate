import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function readRoot(runId){
  const p = path.join(".nono","evidence",runId,"BUNDLE_ROOT_SHA256.txt");
  return fs.readFileSync(p,"utf8").trim();
}

function runEnterprise(runId){
  try{
    execSync(`node ./bin/nono.js enterprise --staging examples/acceptance/staging_good --policy examples/acceptance/policy.json --run-id ${runId}`);
  }catch(e){
    // ignore non-zero exit (policy FAIL allowed)
  }
}

test("enterprise determinism across two runs", () => {
  const runA = "DET_TEST_A";
  const runB = "DET_TEST_B";

  runEnterprise(runA);
  runEnterprise(runB);

  const rootA = readRoot(runA);
  const rootB = readRoot(runB);

  expect(rootA).toBe(rootB);
});
