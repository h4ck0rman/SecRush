<script>
    import '../../app.css';
    import { onDestroy, onMount, createEventDispatcher } from 'svelte';
    import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
    import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
    import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
    import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
    import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
    
    const dispatch = createEventDispatcher();

    let editorContainer;
    let editor;
    let Monaco;

    let decorationId = [];
    let decorationIds = [];
    
  onMount(async () => {
    self.MonacoEnvironment = {
      getWorker: function (_moduleId, label) {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
          return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
            },
        };
    
        Monaco = await import("monaco-editor");

        Monaco.editor.defineTheme('custom-zinc-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#121010', // Darker charcoal gray
                'editor.foreground': '#FFFFFF', // White text
                'editorCursor.foreground': '#FFFFFF', // White cursor
                'editor.lineHighlightBackground': '#2D2D2D', // Slightly lighter than background
                'editorLineNumber.foreground': '#FFFFFF80', // Semi-transparent white for line numbers
                'editor.selectionBackground': '#FFFFFF30', // Semi-transparent white for selections
                'editor.inactiveSelectionBackground': '#FFFFFF15', // Less opaque for inactive selections
            }
        });

        // Apply the custom theme
        Monaco.editor.setTheme('custom-zinc-theme');

        editor = Monaco.editor.create(editorContainer, {
        value: "\n// Time to hit the next puzzle...\n",
        language: "java",
        theme: "custom-zinc-theme",
        tabSize: 2,
        insertSpaces: true,
        lineNumbersMinChars: 3,
        glyphMargin: false,
        folding: false,
        wordWrap: true,
        readOnly: true,
        domReadOnly: true,
        selectOnLineNumbers: true,
        minimap: { enabled: false },
        fontSize: 16
        });

        dispatch('ready');
        editor.onMouseDown(handleMouseDown);
        editor.onDidChangeCursorSelection(handleSelectionChange);
    });

    function handleMouseDown(e) {
        const position = e.target.position;
        if (position) {
            const lineNumber = position.lineNumber;
    
            // Emit the line number to the parent component
            dispatch('lineClick', { lineNumber });
    
            // Highlight the clicked line
            highlightLine(lineNumber);
        }
    }

    function handleSelectionChange(e) {
        const selection = e.selection;

        // Check if the selection is collapsed (caret only)
        if (selection.isEmpty()) {
            const lineNumber = selection.startLineNumber;

            // Highlight the clicked line
            highlightLine(lineNumber);

            // Dispatch the line number
            dispatch('lineClick', { lineNumber });
        } else {
            // Optionally, handle selections spanning multiple lines
            const lineNumber = selection.startLineNumber;

            highlightLine(lineNumber);
            dispatch('lineClick', { lineNumber });
        }
    }

    export function solutionHighlight(highlights) {
        // Remove previous decorations
        decorationId = editor.deltaDecorations(decorationId, []);

        // Create new decorations based on highlights
        const newDecorations = highlights.map(highlight => ({
            range: new Monaco.Range(highlight.line, 1, highlight.line, 1),
            options: {
                isWholeLine: true,
                className: getHighlightClass(highlight.colour),
            },
        }));

        // Apply the new decorations
        decorationIds = editor.deltaDecorations([], newDecorations);
    }

    function highlightLine(lineNumber) {
        // Remove previous decorations
        decorationId = editor.deltaDecorations(decorationId, []);
    
        // Add new decoration for the clicked line with orange highlight
        decorationId = editor.deltaDecorations([], [
            {
                range: new Monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                    isWholeLine: true,
                    className: 'orangeLineHighlight', // Applies orange highlight
                },
            },
        ]);
    }

    function getHighlightClass(colour) {
        switch(colour) {
            case 'green':
                return 'greenLineHighlight';
            case 'red':
                return 'redLineHighlight';
            case 'orange':
            default:
                return 'orangeLineHighlight';
        }
    }

    export function updateContent(code, language) {
        if (editor) {
            const model = Monaco.editor.createModel(
                code,
                language
            );
            editor.setModel(model);

        }
    };

    onDestroy(() => {
        editor?.dispose();
    });
</script>

<div class="flex items-center bg-zinc-900 h-full">
    <div class="w-full h-full text-lg" bind:this={editorContainer}></div> 
</div>