import allTokensRaw from '@tokens/build/scss/_all.scss?raw';

export type TokenEntry = {
  section: string;
  group: string;
  name: string;
  variable: string;
  value: string;
  rawValue: string;
};

export type TokenGroup = {
  name: string;
  tokens: TokenEntry[];
};

const SECTION_HEADER = /^\/\/ BUILD DESIGN SYSTEM -\s+(.+?)(?:\s*\(SCSS\))?$/i;
const GROUP_HEADER = /^\/\/\s*([^/].*)$/;
const TOKEN_LINE = /^\$([A-Za-z0-9_]+):\s*(.+);$/;

class TokenStore {
  private readonly resolved = new Map<string, string>();
  private readonly raw = new Map<string, string>();

  setRaw(name: string, rawValue: string) {
    this.raw.set(name, rawValue);
    this.resolved.delete(name);
  }

  resolve(name: string, seen: Set<string> = new Set()): string {
    if (this.resolved.has(name)) {
      return this.resolved.get(name)!;
    }

    const rawValue = this.raw.get(name);
    if (!rawValue) {
      return `$${name}`;
    }

    if (seen.has(name)) {
      return `$${name}`;
    }

    seen.add(name);
    const resolved = resolveTokenValue(rawValue, name, this, seen);
    this.resolved.set(name, resolved);
    return resolved;
  }
}

const store = new TokenStore();
const sectionOrder: string[] = [];
const sectionGroups = new Map<string, Map<string, TokenEntry[]>>();

let currentSection = 'Uncategorized';
let currentGroup = 'General';

const addToken = (section: string, group: string, token: TokenEntry) => {
  if (!sectionGroups.has(section)) {
    sectionGroups.set(section, new Map());
    sectionOrder.push(section);
  }

  const groups = sectionGroups.get(section)!;
  if (!groups.has(group)) {
    groups.set(group, []);
  }

  groups.get(group)!.push(token);
};

const lines = allTokensRaw.split(/\r?\n/);

for (const rawLine of lines) {
  const line = rawLine.trim();
  if (!line) {
    continue;
  }

  if (line.startsWith('//')) {
    const sectionMatch = line.match(SECTION_HEADER);
    if (sectionMatch) {
      currentSection = toTitleCase(sectionMatch[1].trim());
      currentGroup = 'General';
      continue;
    }

    if (line.startsWith('// BUILD DESIGN SYSTEM')) {
      continue;
    }

    const groupMatch = line.match(GROUP_HEADER);
    if (groupMatch) {
      const candidate = groupMatch[1].trim();
      if (isGroupHeader(candidate)) {
        currentGroup = toTitleCase(candidate);
      }
    }

    continue;
  }

  const tokenMatch = line.match(TOKEN_LINE);
  if (!tokenMatch) {
    continue;
  }

  const [, name, rawValueRaw] = tokenMatch;
  const rawValue = rawValueRaw.trim();
  store.setRaw(name, rawValue);
  const value = store.resolve(name);

  const tokenEntry: TokenEntry = {
    section: currentSection,
    group: currentGroup,
    name,
    variable: `$${name}`,
    value,
    rawValue,
  };

  addToken(currentSection, currentGroup, tokenEntry);
}

const sectionsRecord: Record<string, TokenGroup[]> = {};
for (const section of sectionOrder) {
  const groups = sectionGroups.get(section);
  if (!groups) {
    continue;
  }

  sectionsRecord[section] = Array.from(groups.entries()).map(([name, tokens]) => ({
    name,
    tokens,
  }));
}

function resolveTokenValue(value: string, name: string, store: TokenStore, seen: Set<string>): string {
  const trimmed = value.trim();

  const directAlias = trimmed.match(/^\$([A-Za-z0-9_]+)$/);
  if (directAlias) {
    const alias = directAlias[1];
    return store.resolve(alias, seen);
  }

  let resolved = trimmed.replace(/#\{\$([A-Za-z0-9_]+)\}/g, (_, alias: string) => store.resolve(alias, seen));

  resolved = resolved.replace(/\$([A-Za-z0-9_]+)/g, (match, alias: string) => {
    if (alias === name) {
      return match;
    }
    return store.resolve(alias, seen);
  });

  return resolved;
}

function toTitleCase(value: string): string {
  if (!value) {
    return value;
  }

  return value
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function isGroupHeader(value: string): boolean {
  if (!value) {
    return false;
  }

  if (/\d/.test(value)) {
    return false;
  }

  return true;
}

export const allTokens: TokenEntry[] = Object.values(sectionsRecord).flatMap((groups) => groups.flatMap((group) => group.tokens));

export const tokensBySection = sectionsRecord;

export function getSection(sectionName: string): TokenGroup[] {
  return tokensBySection[sectionName] ?? [];
}

export function findToken(variable: string): TokenEntry | undefined {
  const normalized = variable.startsWith('$') ? variable : `$${variable}`;
  return allTokens.find((token) => token.variable === normalized);
}

export function findTokensByPrefix(prefix: string): TokenEntry[] {
  const normalized = prefix.startsWith('$') ? prefix : `$${prefix}`;
  return allTokens.filter((token) => token.variable.startsWith(normalized));
}
