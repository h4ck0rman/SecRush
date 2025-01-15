<!-- PuzzleResult.svelte -->
<script>
    import { fade } from 'svelte/transition';
    export let results = [];
    export let visible = true; // Prop to control visibility

    const correct = "logos/green_tick.png";
    const wrong = "logos/red_cross.png";
</script>

<!-- Container -->
{#if visible}
    <div transition:fade class="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-visible w-full px-3 md:px-5 md:pt-10">
        {#each results as result}
            <!-- Individual Result Item -->
            <a href="/rush/{result.puzzleId}" target="_blank">
                <div class="flex flex-col items-center px-2 flex-shrink-0">
                    
                        <img src="{result.correct ? correct : wrong}" alt="Result Logo" class="w-6 h-6 mb-1" />
                        <p class="text-white font-bold">{result.count}</p>
                    
                    
                </div>
            </a>
        {/each}
    </div>
{/if}