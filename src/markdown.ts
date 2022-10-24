/* eslint-disable security/detect-non-literal-fs-filename */
import { github, inputs } from './constants';
import { getRuleLink } from './rules';
import { Details, Rules, Totals } from './types';

function getMarkdownRuleLink(rule: string, link: string): string {
  let linkRule = rule;

  if (link) linkRule = `[${rule}](${link})`;

  return linkRule;
}

function getMarkdownTitle(value: string): string {
  if (value.indexOf('There are') > -1) {
    return `:fire: ${value}`;
  }

  return `:rocket: ${value}`;
}

function getMarkdownSummary(totals: Totals): string {
  const text: string[] = [];

  text.push('## Summary');
  text.push('| **Description**      | **Total** |');
  text.push('|----------------------|-----------|');
  text.push(`| File(s)              | ${totals.files} |`);
  text.push(`| File(s) with error   | ${totals.filesWithError} |`);
  text.push(`| Error(s)             | ${totals.errors} |`);
  text.push(`| Warning(s)           | ${totals.warnings} |`);
  text.push(`| **Total problem(s)** | ${totals.problems} |`);

  return text.join('\n');
}

function getMarkdownRules(rules: Rules): string {
  const text: string[] = [];

  text.push('## Rules');
  text.push(
    '| :straight_ruler: **Rule** | :warning: **warning(s)** | :exclamation: **error(s)** | :wrench: **fixable** |',
  );
  text.push(
    '|---------------------------|--------------------------|----------------------------|----------------------|',
  );
  for (const rule of rules) {
    const iconFixeable = rule.fixable ? ':white_check_mark:' : '';
    const linkRule = getMarkdownRuleLink(rule.name, rule.link);

    text.push(
      `| ${linkRule} | ${rule.warnings} | ${rule.errors} | ${iconFixeable} |`,
    );
  }

  return text.join('\n');
}

export function getMarkdown(
  title: string,
  totals: Totals,
  rules: Rules,
): string {
  const markdown: string[] = [];

  markdown.push(getMarkdownTitle(title));
  markdown.push(getMarkdownSummary(totals));
  if (inputs.viewRules && rules.length > 0)
    markdown.push(getMarkdownRules(rules));

  return markdown.join('\n');
}

const isLimited = (value: number): boolean =>
  inputs.totalProblems > 0 && value >= inputs.totalProblems;

export function getMarkdownDetails(
  details: Details,
  totalProblems: number,
): string | undefined {
  const text: string[] = [];
  let total = 0;

  if (!details.length) return void 0;
  if (totalProblems > inputs.totalProblems)
    text.push(
      `:point_up: *records were limited to ${inputs.totalProblems} problem(s)*`,
    );

  for (const detail of details) {
    const { file, errors, warnings, issues } = detail;
    const name = file.replace(`${github.workspace}/`, '');
    const linkName = `https://github.com/${github.owner}/${github.repository}/blob/${github.sha}/${name}`;

    text.push(`### [${name}](${linkName})`);
    text.push(`#### ${errors} error(s), ${warnings} warning(s)`);
    text.push('| **Position** | **Issue** | **Message** | **Rule** |');
    text.push('|--------------|-----------|-------------|----------|');
    for (const i of issues) {
      const { position, issue, message, rule } = i;
      const link = getRuleLink(rule);
      const issueWithColor = `<span style="color:${
        issue === 'Warning' ? '#f0ad4e' : '#b94a48'
      }">**${issue}**</span>.`;
      const linkRule = getMarkdownRuleLink(rule, link);

      text.push(
        `| ${position} | ${issueWithColor} | ${message} | ${linkRule} |`,
      );

      total += 1;
      if (isLimited(total)) break;
    }

    text.push('***');
    if (isLimited(total)) break;
  }

  return text.join('\n');
}
