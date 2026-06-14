/**
 * Chat command parser and handler for GitHub operations
 */

export type CommandType = 
  | 'github-status'
  | 'github-repos'
  | 'github-files'
  | 'github-create-pr'
  | 'github-search'
  | 'help'
  | 'none';

export interface ParsedCommand {
  type: CommandType;
  args: Record<string, string>;
  rawInput: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

const COMMAND_PATTERNS = {
  'github-status': /^\/github-status(?:\s+(.+))?$/i,
  'github-repos': /^\/github-repos(?:\s+filter:(.+))?$/i,
  'github-files': /^\/github-files\s+(.+?)(?:\s+path:(.+))?$/i,
  'github-create-pr': /^\/create-pr(?:\s+(.+))?$/i,
  'github-search': /^\/search-code\s+(.+)$/i,
  'help': /^\/help(?:\s+(.+))?$/i,
};

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();

  // Check for @ mentions (for repo/file picker)
  if (trimmed.startsWith('@')) {
    return {
      type: 'none',
      args: { mention: trimmed.substring(1) },
      rawInput: trimmed,
    };
  }

  // Check for slash commands
  for (const [cmdType, pattern] of Object.entries(COMMAND_PATTERNS)) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        type: cmdType as CommandType,
        args: { raw: match[1] || '', extra: match[2] || '' },
        rawInput: trimmed,
      };
    }
  }

  return {
    type: 'none',
    args: {},
    rawInput: trimmed,
  };
}

export function getCommandHelp(command?: string): string {
  const help: Record<string, string> = {
    'github-status': 'Show repository status\nUsage: /github-status owner/repo',
    'github-repos': 'List your repositories\nUsage: /github-repos [filter:keyword]',
    'github-files': 'Browse repository files\nUsage: /github-files owner/repo [path:/path]',
    'github-create-pr': 'Create a pull request\nUsage: /create-pr owner/repo',
    'github-search': 'Search code in repository\nUsage: /search-code query [repo:owner/repo]',
    'help': 'Show available commands\nUsage: /help [command]',
  };

  if (command && help[command]) {
    return help[command];
  }

  return `Available Commands:
${Object.entries(help)
  .map(([cmd, desc]) => `  ${cmd.padEnd(20)} - ${desc.split('\n')[0]}`)
  .join('\n')}

Use /help [command] for more details
Use @ to mention repos or files`;
}

export function isCommand(input: string): boolean {
  const trimmed = input.trim();
  return trimmed.startsWith('/') || trimmed.startsWith('@');
}

export function getMentionType(mention: string): 'repo' | 'file' | 'commit' | 'unknown' {
  if (mention.includes('/') && !mention.includes(':')) {
    return 'repo'; // owner/repo format
  }
  if (mention.includes(':') || mention.endsWith('.ts') || mention.endsWith('.tsx')) {
    return 'file'; // file path
  }
  if (mention.length === 40 || mention.startsWith('commit:')) {
    return 'commit';
  }
  return 'unknown';
}
