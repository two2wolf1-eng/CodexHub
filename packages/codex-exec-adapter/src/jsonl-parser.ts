import {
  type CodexExecParsedJsonlLine,
  parseCodexExecJsonl as parseKernelCodexJsonl,
} from '@codexhub/codex-kernel';

export interface CodexExecAdapterParsedJsonl {
  lineCount: number;
  eventLineCount: number;
  parseErrorCount: number;
  lines: CodexExecParsedJsonlLine[];
  bodyStored: false;
}

export function parseCodexExecAdapterJsonl(text: string): CodexExecAdapterParsedJsonl {
  const lines = parseKernelCodexJsonl(text);

  return {
    lineCount: text.length === 0 ? 0 : text.split(/\r?\n/).length,
    eventLineCount: lines.length,
    parseErrorCount: lines.filter((line) => line.parseErrorEvent).length,
    lines,
    bodyStored: false,
  };
}
