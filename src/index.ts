import * as core from '@actions/core';

import {
  checkAnnotations,
  checkComplete,
  checkInProgress,
} from './checkStatus';
import { inputs } from './constants';
import { getMarkdown, getMarkdownDetails } from './markdown';
import {
  convertReportJsonToESLintReport,
  createAnnotations,
  createDetails,
  createTotals,
  getStatus,
  getSummary,
  getTotalProblems,
} from './report';
import { createSummaryByRules } from './rules';

(async () => {
  try {
    const checkId = await checkInProgress();

    const report = convertReportJsonToESLintReport(inputs.report || '');
    const totals = createTotals(report);
    const details = createDetails(report);
    const rules = createSummaryByRules(details);
    const annotations = createAnnotations(details);
    const status = getStatus(totals);
    const summary = getSummary(totals, status);
    const totalProblems = getTotalProblems(details);
    const markdown = getMarkdown(summary, totals, rules);
    const markdownDetails = getMarkdownDetails(details, totalProblems);

    await checkAnnotations(checkId, summary, annotations);
    await checkComplete(checkId, status, markdown, markdownDetails);

    if (status === 'failure') {
      core.error(summary);
      process.exit(1);
    } else if (status === 'success' && totals.warnings > 0) {
      core.warning(summary);
      if (inputs.failOnWarning) process.exit(1);
    } else {
      core.notice(summary);
    }
  } catch (error: unknown) {
    core.setFailed((error as Error).message);
  }
})();
