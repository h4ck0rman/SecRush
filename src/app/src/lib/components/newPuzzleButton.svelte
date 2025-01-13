<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    const dispatchNewPuzzle = (data) => {
        dispatch('nextPuzzle', data);
    };

    const dispatchEOS = (finishMessage) => {
        dispatch('eos', { finishMessage });
    };

    const dispatchLoading = () => {
        dispatch('toggleLoading');
    }

    const loadingBGif = "loadingB.gif";
    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";

    let newPuzzleLoading = false; 

    export async function newPuzzle() {
        dispatchLoading();
        newPuzzleLoading = true;
        try {
            const response = await fetch(backend + '/gameSession/newPuzzle', {
                method: 'GET',
                credentials: 'include', 
            });

            if (response.status === 404) {
                dispatchEOS('\n\n// We Have Run Out Of Puzzles For This Session...\n\n// You Killed It!!!\n\n');
                throw new Error(`Ran out of puzzles`);
                

            } else if (!response.ok) {
                const errorData = await response.json();  
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            dispatchNewPuzzle(data);

        } catch (error) {
            console.error('Error fetching next puzzle:', error);

        } finally {
            dispatchLoading();
            newPuzzleLoading = false;
        }
        
    };
</script>

<div >
    <button
        type="button"
        on:click={newPuzzle}
        class="flex-1 w-full px-4 py-2 text-white font-light border border-gray-300 rounded  hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
        disabled={newPuzzleLoading} 
    >
        {#if newPuzzleLoading}
            <img src="{loadingBGif}" alt="Loading..." class="h-5 w-auto md:h-6 md:w-auto" />
        {:else}
            Skip
        {/if}
    </button>
</div>