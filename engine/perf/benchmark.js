import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import fs from 'fs';

function run(cmd){
  const t0 = performance.now();
  execSync(cmd, { stdio: 'ignore' });
  const t1 = performance.now();
  return (t1 - t0).toFixed(2);
}

const results = [];

results.push({ step: "npm_ci", ms: run("npm ci --ignore-scripts --no-audit --no-fund") });
results.push({ step: "npm_test", ms: run("npm test") });

const report = {
  timestamp: new Date().toISOString(),
  node: process.version,
  platform: process.platform,
  results
};

fs.writeFileSync("perf/performance-report.json", JSON.stringify(report, null, 2));
console.log("PERF_OK");
