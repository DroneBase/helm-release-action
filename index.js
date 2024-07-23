const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const fs = require('fs');

const HELM = 'helm';
const REPO_ALIAS = 'repo';
const RELEASE_DIR = '.release/';

// Returns argument required to generate the chart package.
function package() {
  const args = [
    'package',
    core.getInput('chart'),
    '--dependency-update',
    '--destination',
    RELEASE_DIR,
    // ...core.getInput('packageExtraArgs').split(/\s+/),
  ];

  const version = core.getInput('version');
  if (version) {
    args.push('--version=' + version);
  }

  const appVersion = core.getInput('appVersion');
  if (appVersion) {
    args.push('--app-version=' + appVersion);
  }

  return args;
}

// Returns argument required to push the chart release to OCI repository.
function push() {
  const releaseFile = path.join(RELEASE_DIR, fs.readdirSync(RELEASE_DIR)[0]);
  const repo = core.getInput('repo', { required: true });
  const args = [
    'push',
    releaseFile,
    repo,
  ];
  
  const forceRelease = core.getInput('forceRelease', { required: true }) === 'true';
  if (forceRelease) {
    args.push('--force');
  } else {
    args.push('--ignore-if-exists');
  }

  return args;
}

async function main() {
  try {
    await exec.exec(HELM, package()),
    await exec.exec(HELM, push())
  } catch (err) {
    core.error(err);
    core.setFailed(err.message);
  }
}

main();
