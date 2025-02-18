import { Parent } from 'hast';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { Node } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

interface ElementNode extends Parent {
  type: 'element';
  tagName?: string;
  properties?: Record<string, unknown>;
}

function stripHtml() {
  return (tree: Node) => {
    visit(tree, (node: Node, index?: number, parent?: Parent) => {
      if (
        parent &&
        index !== undefined &&
        (node as ElementNode).type === 'element'
      ) {
        parent.children.splice(
          index,
          1,
          ...((node as ElementNode).children || []),
        );
        return [SKIP, index];
      }
    });
  };
}

export async function sanitizeMdx(mdxContent: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(stripHtml)
    .use(rehypeStringify)
    .process(mdxContent);

  return String(file)
    .replace(/\n\s*\n/g, '\n')
    .trim();
}
