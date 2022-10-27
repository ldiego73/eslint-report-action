import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { github, inputs } from './constants';
import { Annotations, Details, ESLintReport, Status, Totals } from './types';

export function convertReportJsonToESLintReport(url: string): ESLintReport {
  const file = resolve(url);

  if (!existsSync(file)) throw new Error(`The report ${url} doesn't exists`);

  const json = readFileSync(file, 'utf-8');

  return JSON.parse(json);
}

export function createTotals(report: ESLintReport): Totals {
  let files = 0;
  let filesWithError = 0;
  let errors = 0;
  let warnings = 0;

  for (const file of report) {
    const { messages } = file;

    files += 1;
    if (!messages.length) continue;
    filesWithError += 1;

    for (const message of messages) {
      const { severity } = message;

      if (severity < 2) warnings += 1;
      else errors += 1;
    }
  }

  return {
    files,
    filesWithError,
    errors,
    warnings,
    problems: errors + warnings,
  };
}

export function createDetails(report: ESLintReport) {
  const details: Details = [];
  let i = 0;

  for (const file of report) {
    const { messages, filePath } = file;
    if (!messages.length) continue;

    details.push({ file: filePath, issues: [], errors: 0, warnings: 0 });
    i = details.length - 1;

    let errors = 0;
    let warnings = 0;

    for (const m of messages) {
      const { line, column, message, ruleId, severity, fix } = m;

      details[i].issues.push({
        position: `${line}:${column}`,
        message,
        rule: ruleId,
        issue: severity < 2 ? 'Warning' : 'Error',
        fixable: !!fix,
      });

      if (severity < 2) warnings += 1;
      else errors += 1;
    }

    details[i].warnings = warnings;
    details[i].errors = errors;
  }

  return details.sort((a, b) => b.errors - a.errors || b.warnings - a.warnings);
}

export function createAnnotations(details: Details): Annotations {
  const annotations: Annotations = [];

  for (const detail of details) {
    const { file, issues } = detail;
    const path = file.replace(`${github.workspace}/`, '');

    for (const i of issues) {
      const { position, issue, message, rule } = i;
      const [start] = position.split(':');

      annotations.push({
        start_line: Number(start),
        end_line: Number(start),
        annotation_level: issue === 'Warning' ? 'warning' : 'failure',
        message: `[${rule}]: ${message}`,
        path,
      });
    }
  }

  return annotations.sort((a) => a.annotation_level === 'warning' ? 1 : -1);
}

export function getStatus(totals: Totals): Status {
  if (totals.errors > 0 || (inputs.failOnWarning && totals.warnings > 0))
    return 'failure';

  return 'success';
}

export function getTotalProblems(details: Details): number {
  return details.reduce((acc, item) => acc + item.issues.length, 0);
}

export function getSummary(totals: Totals, status: Status): string {
  if (status === 'failure') {
    return `There are ${totals.problems} problem(s). ${totals.errors} error(s) and ${totals.warnings} warning(s)`;
  } else if (status === 'success' && totals.warnings > 0) {
    return `There are ${totals.warnings} warning(s)`;
  }
  return `${inputs.title} complete. No errors found!`;
}
