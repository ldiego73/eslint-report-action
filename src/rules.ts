import { Details, Rules } from './types';
import { LiteralSwitch, literalSwitch } from './utils';

type RuleFunction = (rule: string) => string;

const links: LiteralSwitch<RuleFunction> = {
  import: (rule: string) =>
    `https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/${rule}.md`,
  sonarjs: (rule: string) =>
    `https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/${rule}.md`,
  security: (rule: string) =>
    `https://github.com/nodesecurity/eslint-plugin-security#${rule}`,
  '@typescript-eslint': (rule: string) =>
    `https://typescript-eslint.io/rules/${rule}.md`,
  vue: (rule: string) => `https://eslint.vuejs.org/rules/${rule}.html`,
  react: (rule: string) =>
    `https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/${rule}.md`,
  'jsx-a11y': (rule: string) =>
    `https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/${rule}.md`,
  default: () => '',
};

export function getRuleLink(name: string): string {
  if (!name || typeof name !== 'string') return '';

  const parts = name.split('/');

  if (!parts.length || parts.length > 2) return '';
  if (parts.length === 1) return `https://eslint.org/docs/rules/${parts[0]}`;

  const [prefix, rule] = parts;

  return literalSwitch(links, prefix)(rule);
}

const getTotalIssue = (severity: boolean) => (value: number) =>
  severity ? value : 0;

export function createSummaryByRules(details: Details): Rules {
  const rules: Rules = [];

  for (const file of details) {
    const { issues } = file;

    for (const i of issues) {
      const { rule, fixable, issue } = i;
      const findRule = rules.find((r) => r.name === rule);
      const getTotalWarning = getTotalIssue(issue === 'Warning');
      const getTotalError = getTotalIssue(issue === 'Error');

      if (findRule) {
        const warnings = getTotalWarning(findRule.warnings + 1);
        const errors = getTotalError(findRule.errors + 1);

        findRule.warnings = warnings;
        findRule.errors = errors;
      } else
        rules.push({
          name: rule,
          link: getRuleLink(rule),
          warnings: getTotalWarning(1),
          errors: getTotalError(1),
          fixable,
        });
    }
  }

  return rules.sort((a, b) => b.errors - a.errors || b.warnings - a.warnings);
}
