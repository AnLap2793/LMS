/**
 * Toolbar Plugin for Lexical Editor
 * Provides formatting buttons for the editor
 */
import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister, $getNearestNodeOfType } from '@lexical/utils';
import { $isListNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $isHeadingNode, $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $isCodeNode, CODE_LANGUAGE_MAP } from '@lexical/code';
import { $setBlocksType } from '@lexical/selection';
import {
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_LOW,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    UndoOutlined,
    RedoOutlined,
} from '@ant-design/icons';

const BLOCK_TYPES = [
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'quote', label: 'Quote' },
];

function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [blockType, setBlockType] = useState('paragraph');

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));

            // Update block type
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();

            if ($isListNode(element)) {
                const parentList = $getNearestNodeOfType(anchorNode, ListNode);
                setBlockType(parentList ? parentList.getListType() : element.getListType());
            } else {
                const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                setBlockType(type);
            }
        }
    }, []);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateToolbar();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                payload => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                payload => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, $updateToolbar]);

    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = tag => {
        if (blockType !== tag) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(tag));
                }
            });
        }
    };

    const formatQuote = () => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode());
                }
            });
        }
    };

    const handleBlockTypeChange = e => {
        const value = e.target.value;
        if (value === 'paragraph') {
            formatParagraph();
        } else if (value === 'quote') {
            formatQuote();
        } else if (value.startsWith('h')) {
            formatHeading(value);
        }
    };

    return (
        <div className="lexical-toolbar">
            {/* Undo/Redo */}
            <button
                type="button"
                disabled={!canUndo}
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                className="lexical-toolbar-btn"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
            >
                <UndoOutlined />
            </button>
            <button
                type="button"
                disabled={!canRedo}
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                className="lexical-toolbar-btn"
                aria-label="Redo"
                title="Redo (Ctrl+Y)"
            >
                <RedoOutlined />
            </button>

            <span className="lexical-toolbar-divider" />

            {/* Block Type */}
            <select className="lexical-toolbar-select" value={blockType} onChange={handleBlockTypeChange}>
                {BLOCK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                        {type.label}
                    </option>
                ))}
            </select>

            <span className="lexical-toolbar-divider" />

            {/* Text Formatting */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                className={`lexical-toolbar-btn ${isBold ? 'active' : ''}`}
                aria-label="Bold"
                title="Bold (Ctrl+B)"
            >
                <BoldOutlined />
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                className={`lexical-toolbar-btn ${isItalic ? 'active' : ''}`}
                aria-label="Italic"
                title="Italic (Ctrl+I)"
            >
                <ItalicOutlined />
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                className={`lexical-toolbar-btn ${isUnderline ? 'active' : ''}`}
                aria-label="Underline"
                title="Underline (Ctrl+U)"
            >
                <UnderlineOutlined />
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                className={`lexical-toolbar-btn ${isStrikethrough ? 'active' : ''}`}
                aria-label="Strikethrough"
                title="Strikethrough"
            >
                <StrikethroughOutlined />
            </button>

            <span className="lexical-toolbar-divider" />

            {/* Lists */}
            <button
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                className={`lexical-toolbar-btn ${blockType === 'bullet' ? 'active' : ''}`}
                aria-label="Bullet List"
                title="Bullet List"
            >
                <UnorderedListOutlined />
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                className={`lexical-toolbar-btn ${blockType === 'number' ? 'active' : ''}`}
                aria-label="Numbered List"
                title="Numbered List"
            >
                <OrderedListOutlined />
            </button>
        </div>
    );
}

export default ToolbarPlugin;
