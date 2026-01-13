/**
 * Lexical Editor Theme
 * Định nghĩa CSS classes cho các elements trong editor
 */
export const editorTheme = {
    // Root element
    root: 'lexical-root',

    // Text formatting
    text: {
        bold: 'lexical-text-bold',
        italic: 'lexical-text-italic',
        underline: 'lexical-text-underline',
        strikethrough: 'lexical-text-strikethrough',
        code: 'lexical-text-code',
    },

    // Headings
    heading: {
        h1: 'lexical-heading-h1',
        h2: 'lexical-heading-h2',
        h3: 'lexical-heading-h3',
        h4: 'lexical-heading-h4',
        h5: 'lexical-heading-h5',
    },

    // Lists
    list: {
        ul: 'lexical-list-ul',
        ol: 'lexical-list-ol',
        listitem: 'lexical-list-item',
        nested: {
            listitem: 'lexical-list-item-nested',
        },
    },

    // Quote
    quote: 'lexical-quote',

    // Code block
    code: 'lexical-code-block',
    codeHighlight: {
        atrule: 'lexical-code-atrule',
        attr: 'lexical-code-attr',
        boolean: 'lexical-code-boolean',
        builtin: 'lexical-code-builtin',
        cdata: 'lexical-code-cdata',
        char: 'lexical-code-char',
        class: 'lexical-code-class',
        'class-name': 'lexical-code-class-name',
        comment: 'lexical-code-comment',
        constant: 'lexical-code-constant',
        deleted: 'lexical-code-deleted',
        doctype: 'lexical-code-doctype',
        entity: 'lexical-code-entity',
        function: 'lexical-code-function',
        important: 'lexical-code-important',
        inserted: 'lexical-code-inserted',
        keyword: 'lexical-code-keyword',
        namespace: 'lexical-code-namespace',
        number: 'lexical-code-number',
        operator: 'lexical-code-operator',
        prolog: 'lexical-code-prolog',
        property: 'lexical-code-property',
        punctuation: 'lexical-code-punctuation',
        regex: 'lexical-code-regex',
        selector: 'lexical-code-selector',
        string: 'lexical-code-string',
        symbol: 'lexical-code-symbol',
        tag: 'lexical-code-tag',
        url: 'lexical-code-url',
        variable: 'lexical-code-variable',
    },

    // Link
    link: 'lexical-link',

    // Paragraph
    paragraph: 'lexical-paragraph',
};
