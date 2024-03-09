import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function WikiPage() {
  // MDX text - can be from a local file, database, CMS, fetch, anywhere...
  const res = await fetch(`${process.env.BASE_URL}/mdx/test.mdx`);
  const markdown = await res.text();
  return <MDXRemote source={markdown} />;
}
