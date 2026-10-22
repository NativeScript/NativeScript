// Markdown tokens as nstreamdown's parser makes them: metadata holds only the keys a token kind sets.
export type TokenType = 'code-block' | 'paragraph' | 'image' | 'heading1';
export interface Token {
  type: TokenType;
  content: string;
  children?: Token[];
  metadata?: Record<string, unknown>;
}
export function parse(source: string): Token[] {
  const tokens: Token[] = [];
  for (const line of source.split('\n')) {
    if (line.startsWith('```')) tokens.push({ type: 'code-block', content: line.slice(3), metadata: { language: 'ts' } });
    else if (line.startsWith('!')) tokens.push({ type: 'image', content: line.slice(1), metadata: { url: line.slice(1) } });
    else if (line.startsWith('# ')) tokens.push({ type: 'heading1', content: line.slice(2) });
    else tokens.push({ type: 'paragraph', content: line });
  }
  return tokens;
}
export class Renderer {
  getIsIncomplete(token: Token): boolean {
    return (token.metadata?.['isIncomplete'] as boolean) || false;
  }
  getLanguage(token: Token): string {
    return (token.metadata?.['language'] as string) || '';
  }
  getUrl(token: Token): string {
    return (token.metadata?.['url'] as string) || '';
  }
  getNumber(token: Token): number {
    return (token.metadata?.['number'] as number) ?? 0;
  }
  children(token: Token): Token[] {
    return token.children || [];
  }
  getHeadingLevel(token: Token): 1 | 2 | 3 {
    const level = parseInt(token.type.replace('heading', ''), 10);
    return (level >= 1 && level <= 3 ? level : 1) as 1 | 2 | 3;
  }
}
