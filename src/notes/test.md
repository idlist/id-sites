---
title: "Test Title"
route: "test"
created: 2026-10-01
updated: 2026-10-02
---

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Text

Normal paragraph text. This is a **bold** word, an *italic* word, a ***bold italic*** word, an ~~strikethrough~~ word, `inline code`, a [link](https://example.com), and an autolink <https://example.com>.

Line one of a paragraph
with a soft line break.
Line two follows a hard break.

This paragraph uses a hard break at the end of the first line.
The second line starts after two trailing spaces.

## Blockquote

> A single-line quote.
>
> > A nested quote.
>
> A quote containing a list:
>
> - Item one
> - Item two

## Lists

Unordered list:

- Apple
- Banana
  - Nested item
    - Deeper item
- Cherry

Ordered list:

1. First
2. Second
   1. Nested ordered
   2. Another nested
3. Third

Task list:

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

Definition-style list (not standard CommonMark):

Term
: Definition of the term

## Code

Inline code with a backtick: `const x = 1`.

Fenced code block:

```js
function greet(name) {
  return `Hello, ${name}!`
}

console.log(greet('world'))
```

Fenced code block with another language:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

Indented code block:

    <div class="indented">
      <span>Indented code</span>
    </div>

## Table

| Left aligned | Center aligned | Right aligned |
| :----------- | :------------: | ------------: |
| Cell A       |    Cell B      |        Cell C |
| Cell D       |    Cell E      |        Cell F |

## Horizontal Rule

---

## Links and Images

- [Standard link](https://example.com)
- [Link with title](https://example.com "Example title")
- [Relative link](/notes/en)
- [Reference link][ref]
- Bare URL: <https://example.com>
- Email: <test@example.com>

![Image with alt text](https://placehold.co/600x200 "Placeholder image")

[ref]: https://example.com 'Reference definition'

## Escaping and Entities

Escaped characters: \*not italic\*, \_not italic\_, \# not a heading.

HTML entities: &amp; &lt; &gt; &quot; &copy; &hellip;

## Footnotes (extension)

Here is a statement with a footnote.[^note]

[^note]: This is the footnote content.

## Raw HTML

<div class="raw-html">
  <p>Raw <strong>HTML</strong> block.</p>
</div>

Inline raw HTML: <kbd>Ctrl</kbd> + <kbd>C</kbd>.

Inline styling:
<span style="color: red">red text</span>.

<!-- An HTML comment -->

## Misc

A literal backslash at line end: \

Symbols: < > & " ' | { } [ ] ( ) # + - * _ = ~ ^

Nested formatting: **bold with `code` inside** and *italic with [link](https://example.com) inside*.

