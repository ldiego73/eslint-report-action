export type ESLintFix = {
  range: number[];
  text: string;
};

export type ESLintMessage = {
  ruleId: string;
  severity: number;
  message: string;
  line: number;
  column: number;
  nodeType: string;
  endLine?: number;
  endColumn?: number;
  fix?: ESLintFix;
  messageId?: string;
};

export type ESLintFile = {
  filePath: string;
  messages: ESLintMessage[];
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  source?: string;
};

export type ESLintReport = ESLintFile[];

export type Rule = {
  name: string;
  link: string;
  warnings: number;
  errors: number;
  fixable: boolean;
};

export type Rules = Rule[];

export type Totals = {
  files: number;
  filesWithError: number;
  errors: number;
  warnings: number;
  problems: number;
};

export type Issue = {
  position: string;
  message: string;
  rule: string;
  issue: 'Error' | 'Warning';
  fixable: boolean;
};

export type Issues = Issue[];

export type Detail = {
  file: string;
  issues: Issues;
  errors: number;
  warnings: number;
};

export type Details = Detail[];

export type Status = 'failure' | 'success'

export type Annotation = {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: string;
  message: string;
}

export type Annotations = Annotation[];
