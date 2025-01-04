<script>
    export let results;
    const correct = "logos/green_tick.png";
    const wrong = "logos/red_cross.png";
</script>

<!-- Container -->
<div class="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-x-visible w-full px-5 py-2">
    {#each results as result}
        <!-- Individual Result Item -->
        <div class="flex flex-col items-center px-2 py-2 flex-shrink-0">
            <img src="{result.correct ? correct : wrong}" alt="result logo" class="w-6 h-6 mb-1" />
            <p class="text-white font-bold">{result.count}</p>
        </div>
    {/each}
</div>
