// TODO: move to @chirag127/astro-chrome/embeds in v0.1.6
//
// MDX components map. Import this where MDX is wired (or import the
// components directly inside .mdx files — both work).
//
//   import { YouTube, Tweet, CodePlayground, MermaidDiagram } from '~/components/embeds'
export { default as YouTube } from './YouTube.astro'
export { default as Tweet } from './Tweet.astro'
export { default as CodePlayground } from './CodePlayground.astro'
export { default as MermaidDiagram } from './MermaidDiagram.astro'
