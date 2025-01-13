<script>
    import { createEventDispatcher } from 'svelte';

    export let selectedLine = null;
    export let currentPuzzle = null;

    const loadingBGif = "loadingB.gif";
    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";
    
    
    let solvePuzzleLoading = false;
    let solvePuzzleDisable = false;
    let feedbackMessage = '';
    

    const dispatch = createEventDispatcher();
    const dispatchPuzzleData = (data) => {
        dispatch('puzzleData', data);
    };

    const solvePuzzle = async () => {

        if (!selectedLine || selectedLine <= 0) {
            console.error('Please select a valid line number to solve the puzzle.');
            return
        }

        solvePuzzleLoading = true;
        solvePuzzleDisable = true;
        try {
            const response = await fetch(backend + '/gameSession/solvePuzzle', {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    puzzleId: currentPuzzle, 
                    selectedLine, 
                }),
            });
            
            if (!response.ok) {
                // Await the response text or JSON to get the actual error message
                const errorData = await response.json();  // Use text() if the server sends plain text
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
            }

            // Parse the response
            const data = await response.json();
            // Update puzzles reactively
            // this needs to be pushed up
            dispatch('puzzleData', data);

        } catch (error) {
            console.error('Error solving puzzle:', error);
            errorMessage = 'Failed to submit your solution. Please try again later.';

        } finally {
            selectedLine = null;
            solvePuzzleLoading = false;
            
        }
    };
</script>

<style>
    /* Optional: Additional styles if needed */
    button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>

<div >
    <button
        type="button"
        on:click={solvePuzzle}
        class="flex-1 px-4 py-2 w-full text-white font-light border border-gray-300 rounded  hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
        disabled={solvePuzzleLoading} 
    >
        {#if solvePuzzleLoading}
            <img src="{loadingBGif}" alt="Loading..." class="h-5 w-auto md:h-6 md:w-auto" />
        {:else}
            Submit
        {/if}
    </button>
</div>