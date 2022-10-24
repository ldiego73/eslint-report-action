import { getBooleanInput, getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

interface Inputs {
  token: string;
  report?: string;
  title?: string;
  viewRules: boolean;
  failOnWarning: boolean;
  totalProblems: number;
}

interface Github {
  isAction: boolean;
  owner: string;
  repository: string;
  sha: string;
  workspace?: string;
}

export const inputs: Inputs = {
  token: getInput('token', { required: true }),
  report: getInput('report', { required: true }),
  title: getInput('title'),
  viewRules: getBooleanInput('view-rules'),
  failOnWarning: getBooleanInput('fail-on-warning'),
  totalProblems: Number(getInput('total-problems')),
};
export const github: Github = {
  isAction: !!process.env.GITHUB_ACTIONS,
  owner: context.repo.owner,
  repository: context.repo.repo,
  sha: context.sha,
  workspace: process.env.GITHUB_WORKSPACE,
};

export const octokit = getOctokit(inputs.token);
