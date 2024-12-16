<div class="flex items-center justify-center h-screen w-screen">
    <h1 class="text-2xl text-white text-center w-full text-bold uppercase">Application Security Rush</h1>
</div>
<script>
    import { startSession } from '../lib/api'; 
    import { goto } from '$app/navigation';

    let errorMessage = '';

    const handleStartGame = async () => {
        try {
            const sessionId = await startSession();
            console.log('Session started with ID:', sessionId);

            // Navigate to the puzzle page
            goto(`/rush`);
        } catch (error) {
            errorMessage = 'Failed to start the session. Please try again later.';
        }
    };
</script>

<main>
    <h1>Start Your Puzzle Game</h1>
    <button on:click={handleStartGame}>Start Game</button>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {/if}
</main>

<style>
    .error {
        color: red;
    }
</style>