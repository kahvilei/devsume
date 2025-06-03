import React from 'react';
import {  $getSelection } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

// Toolbar imports
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';
import {
    TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import {
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_ORDERED_LIST_COMMAND
} from '@lexical/list';
import {
    $createHeadingNode,
    $createQuoteNode
} from '@lexical/rich-text';
import {
    $setBlocksType
} from '@lexical/selection';
import {
    INSERT_TABLE_COMMAND
} from '@lexical/table';

// Toolbar Component
export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
        editor.update(() => {
            const selection = $getSelection();
            if (selection) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if (selection) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
    };

    const insertTable = () => {
        editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows:'3', columns: '3' });
    };

    return (
        <div className="lexical-toolbar">
            <button
                type="button"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                aria-label="Undo"
                className="toolbar-button"
            >
                ↶
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                aria-label="Redo"
                className="toolbar-button"
            >
                ↷
            </button>
            <div className="toolbar-divider" />
            <button
                type="button"
                onClick={() => formatText('bold')}
                aria-label="Bold"
                className="toolbar-button"
            >
                <strong>B</strong>
            </button>
            <button
                type="button"
                onClick={() => formatText('italic')}
                aria-label="Italic"
                className="toolbar-button"
            >
                <em>I</em>
            </button>
            <button
                type="button"
                onClick={() => formatText('underline')}
                aria-label="Underline"
                className="toolbar-button"
            >
                <u>U</u>
            </button>
            <button
                type="button"
                onClick={() => formatText('strikethrough')}
                aria-label="Strikethrough"
                className="toolbar-button"
            >
                <s>S</s>
            </button>
            <button
                type="button"
                onClick={() => formatText('code')}
                aria-label="Code"
                className="toolbar-button"
            >
                {'</>'}
            </button>
            <div className="toolbar-divider" />
            <button
                type="button"
                onClick={() => formatHeading('h1')}
                aria-label="Heading 1"
                className="toolbar-button"
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => formatHeading('h2')}
                aria-label="Heading 2"
                className="toolbar-button"
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => formatHeading('h3')}
                aria-label="Heading 3"
                className="toolbar-button"
            >
                H3
            </button>
            <div className="toolbar-divider" />
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                aria-label="Align Left"
                className="toolbar-button"
            >
                ⬅
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                aria-label="Align Center"
                className="toolbar-button"
            >
                ⬌
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                aria-label="Align Right"
                className="toolbar-button"
            >
                ➡
            </button>
            <div className="toolbar-divider" />
            <button
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                aria-label="Bullet List"
                className="toolbar-button"
            >
                •
            </button>
            <button
                type="button"
                onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                aria-label="Numbered List"
                className="toolbar-button"
            >
                1.
            </button>
            <button
                type="button"
                onClick={formatQuote}
                aria-label="Quote"
                className="toolbar-button"
            >
                &#34;
            </button>
            <div className="toolbar-divider" />
            <button
                type="button"
                onClick={insertLink}
                aria-label="Insert Link"
                className="toolbar-button"
            >
                🔗
            </button>
            <button
                type="button"
                onClick={insertTable}
                aria-label="Insert Table"
                className="toolbar-button"
            >
                ⊞
            </button>
        </div>
    );
}