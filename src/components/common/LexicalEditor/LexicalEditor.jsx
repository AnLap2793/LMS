/**
 * LexicalEditor - Reusable Rich Text Editor Component
 *
 * @component
 * @example
 * ```jsx
 * <LexicalEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Nhập nội dung..."
 *   size="default"
 * />
 * ```
 */
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode } from '@lexical/link';

import { editorTheme } from './theme';
import ToolbarPlugin from './ToolbarPlugin';
import OnChangePlugin from './OnChangePlugin';
import InitialValuePlugin from './InitialValuePlugin';

import './styles.css';

// Nodes for the editor
const EDITOR_NODES = [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode];

// Error handler
function onError(error) {
    console.error('Lexical Editor Error:', error);
}

function LexicalEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung...',
    size = 'default',
    readOnly = false,
    outputFormat = 'html',
    showToolbar = true,
    className = '',
}) {
    const initialConfig = useMemo(
        () => ({
            namespace: 'LMSEditor',
            theme: editorTheme,
            nodes: EDITOR_NODES,
            onError,
            editable: !readOnly,
        }),
        [readOnly]
    );

    const sizeClass = size === 'small' ? 'lexical-editor-small' : size === 'large' ? 'lexical-editor-large' : '';

    return (
        <div className={`lexical-editor-container ${sizeClass} ${className}`}>
            <LexicalComposer initialConfig={initialConfig}>
                {showToolbar && !readOnly && <ToolbarPlugin />}
                <div className="lexical-editor-inner">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="lexical-editor-input" aria-placeholder={placeholder} />
                        }
                        placeholder={<div className="lexical-editor-placeholder">{placeholder}</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <ListPlugin />
                {value && <InitialValuePlugin value={value} />}
                {onChange && <OnChangePlugin onChange={onChange} outputFormat={outputFormat} />}
            </LexicalComposer>
        </div>
    );
}

LexicalEditor.propTypes = {
    /** Initial HTML value */
    value: PropTypes.string,
    /** Callback when content changes */
    onChange: PropTypes.func,
    /** Placeholder text */
    placeholder: PropTypes.string,
    /** Editor size: 'small', 'default', 'large' */
    size: PropTypes.oneOf(['small', 'default', 'large']),
    /** Read-only mode */
    readOnly: PropTypes.bool,
    /** Output format: 'html', 'json' */
    outputFormat: PropTypes.oneOf(['html', 'json']),
    /** Show toolbar */
    showToolbar: PropTypes.bool,
    /** Additional CSS class */
    className: PropTypes.string,
};

export default LexicalEditor;
