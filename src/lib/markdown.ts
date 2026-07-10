import "server-only";
import { marked } from "marked";

/**
 * Renders admin-authored article markdown to HTML. Only ADMIN accounts can
 * write Article.content (see src/app/admin/articles), so this intentionally
 * skips sanitization — do not reuse this for user-submitted content.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  return marked.parse(markdown, { async: true });
}
