import React, {useEffect} from 'react';
import {$getRoot, $getSelection, EditorState, LexicalEditor} from 'lexical';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import {TableCellNode, TableNode, TableRowNode} from '@lexical/table';
import {ListItemNode, ListNode} from '@lexical/list';
import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {LinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {MarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import {TRANSFORMERS} from '@lexical/markdown';
import {$generateHtmlFromNodes} from '@lexical/html';

import {ContentVariant} from "@/types/designTypes";
import {ToolbarPlugin} from "@/app/_components/editors/lexical/Toolbar";
import {AutoFocusPlugin} from "@lexical/react/LexicalAutoFocusPlugin";

interface WysiwygRichTextProps {
    order?: string;
    value?: string;
    label: string;
    placeholder?: string;
    onUpdate: (value: string) => void;
    required?: boolean;
    variant?: ContentVariant;
}

export default function RichTextEditor(
    {
        value = '',
        label,
        placeholder = "Start writing your blog post...",
        onUpdate,
        variant = "content-style-1"
    }: WysiwygRichTextProps) {


    const initialConfig = {
        namespace: 'BlogEditor',
        onError: (error: Error) => {
            console.error('Lexical error:', error);
        },
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            TableCellNode,
            TableRowNode,
            AutoLinkNode,
            LinkNode
        ]
    };

    const onChange = (editorState: EditorState, editor: LexicalEditor) => {
        editor.update(() => {
            const html = $generateHtmlFromNodes(editor, null);
            onUpdate(html);
        });
    };

    return (
        <div className="wysiwyg-rich-text">
            <LexicalComposer initialConfig={initialConfig}>
                <div className="editor-container">
                    <ToolbarPlugin/>
                    <div className="editor-inner">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    className={`editor-input ${variant}`}
                                    aria-label={label}
                                    spellCheck={true}
                                    aria-placeholder={placeholder}
                                    placeholder={
                                        <div className="editor-placeholder">{placeholder}</div>
                                    }
                                />
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <OnChangePlugin onChange={onChange}/>
                        <HistoryPlugin/>
                        <AutoFocusPlugin />
                        <LinkPlugin/>
                        <ListPlugin/>
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
                    </div>
                </div>
            </LexicalComposer>
        </div>
    );
}
