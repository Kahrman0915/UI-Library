// ─────────────────────────────────────────────────────────────────────────────
// The `@ui/lib/markdown` subpath entry — and the ONLY module that reaches the
// markdown/highlighting dependencies (react-markdown, remark-gfm,
// highlight.js). ChatMarkdown is deliberately NOT exported from src/index.ts:
// the main entry stays dependency-free (lucide-react only), and an app that
// never renders AI markdown never downloads a parser.
//
// Verified by the build gate: `grep react-markdown dist/index.js` must stay
// empty. See CLAUDE.md hard rule 1's scoped exception.
// ─────────────────────────────────────────────────────────────────────────────
export { default as ChatMarkdown } from './components/ChatMarkdown';
export type { ChatMarkdownProps } from './components/ChatMarkdown';
