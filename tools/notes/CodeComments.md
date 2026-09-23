# Code Comments

Rules for formatting and reducing TypeScript code comments in this repository.

## JSDoc Standards

- Apply JSDoc ONLY to public exported functions, interfaces, or classes.
- Syntax format:

  ```typescript
  /**
   * Concise single-sentence description.
   * @param name Description without type.
   * @returns Description without type.
   */
  ```

- Omit types from JSDoc tags (e.g., use `@param id`, NOT `@param {number} id`).

## Inline Comment Standards

- Use inline comments (`//`) ONLY for unexpected business logic or workarounds.
- Maximum length: 12 words per comment.
- Place inline comments on the line ABOVE the code, never trailing at the end of the line.

## Prohibited Behaviors

- DO NOT explain native language features (e.g., explaining how `map()` or `reduce()` works).
- DO NOT keep dead, legacy, or commented-out code blocks. Delete them.
- DO NOT add file banners, author tags, or timestamps.
