import * as core from '@actions/core';

import { github, inputs, octokit } from './constants';
import { Annotations } from './types';

export async function checkInProgress(): Promise<number> {
  const response = await octokit.rest.checks.create({
    owner: github.owner,
    repo: github.repository,
    started_at: new Date().toISOString(),
    head_sha: github.sha,
    status: 'in_progress',
    name: inputs.title,
  });

  return response.data.id;
}

export function checkComplete(
  checkId: number,
  status: string,
  summary: string,
  text: string | undefined,
): Promise<unknown> {
  return octokit.rest.checks.update({
    owner: github.owner,
    repo: github.repository,
    completed_at: new Date().toISOString(),
    conclusion: status,
    status: 'completed',
    check_run_id: checkId,
    output: {
      title: inputs.title,
      summary,
      text,
    },
  });
}

export async function checkAnnotations(
  checkId: number,
  summary: string,
  annotations: Annotations,
): Promise<void> {
  try {
    if (annotations.length === 0) return;
    if (annotations.length < inputs.totalProblems) {
      await octokit.rest.checks.update({
        owner: github.owner,
        repo: github.repository,
        status: 'in_progress',
        check_run_id: checkId,
        output: {
          title: inputs.title,
          summary,
          annotations,
        },
      });

      return;
    }

    const batchSize = 50;
    const jobs = Math.ceil(inputs.totalProblems / batchSize);
    const promises: unknown[] = [];

    for (let i = 0; i < jobs; i += 1) {
      const annotationBatch = annotations.splice(0, batchSize);
      core.info(`Batch ${i + 1} of ${jobs}`);

      const promise = await octokit.rest.checks.update({
        owner: github.owner,
        repo: github.repository,
        status: 'in_progress',
        check_run_id: checkId,
        output: {
          title: inputs.title,
          summary: `${summary}. Batch ${i + 1} of ${jobs}`,
          annotations: annotationBatch,
        },
      });

      promises.push(promise);
    }

    await Promise.all(promises);
  } catch (error: unknown) {
    core.notice(error as Error);
  }
}
