/**
 * Converts stored Markdown/rich-editor text into clean plain text for compact
 * cards and search previews. The full project detail page still renders the
 * original formatted content.
 */
export function stripMarkdownForPreview(value?: string | null): string {
  if (!value) return '';

  return value
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*>+\s?/gm, '')
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, '')
    .replace(/(\*\*\*|___)(.*?)\1/g, '$2')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[^\w])([*_])([^\n]*?)\2(?=$|[^\w])/g, '$1$3')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\([\\`*{}\[\]()#+\-.!_>])/g, '$1')
    .replace(/[\t ]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Clean one Markdown line while preserving line boundaries for heading logic. */
export function stripMarkdownLine(value?: string | null): string {
  if (!value) return '';
  return stripMarkdownForPreview(value);
}
