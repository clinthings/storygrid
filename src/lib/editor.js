export function isEditorContentEmpty(html) {
  if (!html || typeof html !== 'string') return true;

  const trimmed = html.replace(/&nbsp;/gi, ' ').trim();
  if (!trimmed) return true;

  const textOnly = trimmed
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<(?:img|iframe|video|audio|svg|hr|table|figure)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!textOnly) {
    return !/<(?:img|iframe|video|audio|svg|hr|table|figure)[^>]*>/i.test(trimmed);
  }

  return false;
}
