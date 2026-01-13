/**
 * OnChangePlugin for Lexical Editor
 * Handles editor state changes and calls the onChange callback
 */
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';

function OnChangePlugin({ onChange, outputFormat = 'html' }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                if (outputFormat === 'html') {
                    const html = $generateHtmlFromNodes(editor);
                    onChange?.(html);
                } else if (outputFormat === 'json') {
                    const json = JSON.stringify(editorState.toJSON());
                    onChange?.(json);
                } else {
                    // Return editorState for custom handling
                    onChange?.(editorState);
                }
            });
        });
    }, [editor, onChange, outputFormat]);

    return null;
}

export default OnChangePlugin;
