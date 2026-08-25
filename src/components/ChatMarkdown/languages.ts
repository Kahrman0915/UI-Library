// The curated highlight.js language set. `highlight.js/lib/core` ships with
// NOTHING registered — importing the full build would cost ~1 MB for 190+
// languages nobody's model output uses. These ~15 cover what an assistant
// actually emits; an unregistered language falls back to unhighlighted text
// rather than erroring (see ChatMarkdown.tsx).
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import diff from 'highlight.js/lib/languages/diff';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

let registered = false;

/** Register once, lazily — module-eval side effects would defeat tree-shaking. */
export function ensureLanguages(): typeof hljs {
  if (registered) return hljs;
  registered = true;
  hljs.registerLanguage('bash', bash);
  hljs.registerLanguage('css', css);
  hljs.registerLanguage('diff', diff);
  hljs.registerLanguage('go', go);
  hljs.registerLanguage('java', java);
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('markdown', markdown);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('rust', rust);
  hljs.registerLanguage('scss', scss);
  hljs.registerLanguage('sql', sql);
  hljs.registerLanguage('typescript', typescript);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('yaml', yaml);
  // The aliases a model actually types.
  hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs'], { languageName: 'javascript' });
  hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' });
  hljs.registerAliases(['sh', 'shell', 'zsh'], { languageName: 'bash' });
  hljs.registerAliases(['py'], { languageName: 'python' });
  hljs.registerAliases(['html', 'svg'], { languageName: 'xml' });
  hljs.registerAliases(['yml'], { languageName: 'yaml' });
  hljs.registerAliases(['md'], { languageName: 'markdown' });
  return hljs;
}
