/**
 * InitialValuePlugin for Lexical Editor
 * Sets initial HTML content when editor mounts
 */
import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';

function InitialValuePlugin({ value }) {
    const [editor] = useLexicalComposerContext();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (value && !isInitialized.current) {
            isInitialized.current = true;
            editor.update(() => {
                const root = $getRoot();
                // Only set initial value if editor is empty
                if (root.getTextContent().trim() === '') {
                    // Parse HTML string
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(value, 'text/html');
                    const nodes = $generateNodesFromDOM(editor, dom);

                    // Clear and insert
                    root.clear();
                    $insertNodes(nodes);
                }
            });
        }
    }, [editor, value]);

    return null;
}

export default InitialValuePlugin;
