<script>
    import { onDestroy, onMount } from 'svelte';
    import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
    import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
    import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
    import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
    import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
    
    let editorContainer;
    let editor;
    let Monaco;
    
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
        editor = Monaco.editor.create(editorContainer, {
        value: "\n// Waiting for the next puzzle...\n",
        language: "java",
        theme: "vs-dark",
        wordWrap: "true",
        readOnly: true,
        });

    });


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