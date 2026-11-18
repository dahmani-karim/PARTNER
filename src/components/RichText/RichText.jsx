import { cloneElement, createElement, Fragment } from 'react';
export default function RichText({
  text,
  components = {}
}) {
  const stack = [{
    tag: null,
    children: []
  }];
  for (const token of text.split(/(<\/?\w+\s*\/?>)/g).filter(Boolean)) {
    const tag = token.match(/^<(\/?)(\w+)\s*(\/?)>$/);
    if (!tag) {
      stack.at(-1).children.push(token);
      continue;
    }
    const [, closing, name, selfClosing] = tag;
    if (closing) {
      const current = stack.pop();
      if (stack.length === 0 || current.tag !== name) throw new Error(`Invalid translation markup: ${token}`);
      const key = stack.at(-1).children.length;
      const element = components[name];
      if (!element && name !== 'strong') throw new Error(`Missing translation component: ${name}`);
      stack.at(-1).children.push(element ? cloneElement(element, {
        key
      }, ...current.children) : createElement('strong', {
        key
      }, ...current.children));
    } else if (selfClosing && name === 'br') {
      stack.at(-1).children.push(<br key={stack.at(-1).children.length} />);
    } else {
      if (selfClosing) throw new Error(`Unsupported translation markup: ${token}`);
      stack.push({
        tag: name,
        children: []
      });
    }
  }
  if (stack.length !== 1) throw new Error('Unclosed translation markup');
  return createElement(Fragment, null, ...stack[0].children);
}
