<script>
    // Components imported
    import PuzzleResult from "./puzzleResult.svelte";
    import MonacoBox from "./monacoBox.svelte";
    import { startSession } from '../../lib/api';
    import { onMount } from 'svelte';

    const profile = "h4ck0rLogo.png";
    const loadingGif = "loading.gif";
    // state for active puzzle rush session UI
    export let rushActive = false;
    let currentPuzzle = null; // Store the current puzzle
    let selectedLine = null; // User's selected line
    let feedbackMessage = ''; // Message to display feedback
    let errorMessage = ''; // Error message for issues
    let loading = false;
    let newPuzzleLoading = false;
    let solvePuzzleLoading = false;

    const backend = "https://api.sec-rush.com";;

    const handleStartGame = async () => {
        try {
            const sessionId = await startSession();
            console.log('Session started with ID:', sessionId);

            // Navigate to the puzzle page
            rushActive = true;
            newPuzzle();

        } catch (error) {
            errorMessage = 'Failed to start the session. Please try again later.';
        }
    };

    onMount(() => {
        loading = true;
        
        handleStartGame();
        loading = false;
    });

    // Example function to substitute for backend response
    let puzzles = [];
    let count = 1;
    let score = 0;

    let codeUpdate;
    let language = 'python';
    
    const solvePuzzle = async () => {
        solvePuzzleLoading = true;

        if (!selectedLine || selectedLine <= 0) {
            feedbackMessage = 'Please select a valid line number to solve the puzzle.';
            solvePuzzleLoading = false;
            return;
        }

        try {
            const response = await fetch(backend + '/gameSession/solvePuzzle', {
                method: 'POST',
                credentials: 'include', // Include cookies
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    puzzleId: currentPuzzle, // ID of the current puzzle
                    selectedLine, // Line selected by the user
                }),
            });
            
            if (!response.ok) {
                // Await the response text or JSON to get the actual error message
                const errorData = await response.json();  // Use text() if the server sends plain text
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
            }

            // Parse the response
            const data = await response.json();
            const { correct, language, correctLine } = data; // Server response

            // Update puzzles reactively
            puzzles = [...puzzles, { count, correct, language, correctLine }];
            count += 1;

            // Update feedback message and score
            feedbackMessage = correct
                ? 'Correct! Well done.'
                : 'Incorrect. Try to analyze the code again.';

            if (correct) {
                score += 1;
                newPuzzle();
            }

            console.log('Solve Puzzle Response:', data);

            // Reset the selected line for the next puzzle
            
        } catch (error) {
            console.error('Error solving puzzle:', error);
            errorMessage = 'Failed to submit your solution. Please try again later.';
        } finally {
            selectedLine = null;
            solvePuzzleLoading = false;
        }
    };


    const newPuzzle = async () => {
        newPuzzleLoading = true;
        try {
            const response = await fetch(backend + '/gameSession/newPuzzle', {
                method: 'GET',
                credentials: 'include', // Include cookies in the request
            });

            if (!response.ok) {
                // Await the response text or JSON to get the actual error message
                const errorData = await response.json();  // Use text() if the server sends plain text
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();

            currentPuzzle = data.id;
            const { code, language } = data; // Update the current puzzle with the fetched data
            
            console.log('Fetched Puzzle:', currentPuzzle);
            codeUpdate(code, language);
        } catch (error) {
            console.error('Error fetching next puzzle:', error);
        } finally {
            newPuzzleLoading = false;
        }
        
    };
    
</script>

{#if loading }
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class=" p-6 rounded-lg shadow-lg flex flex-col items-center">
            <img src="{loadingGif}" alt="Loading..." class="w-18 h-12 mb-4" />
        </div>
    </div>
{/if}
  
<!-- Outer Container -->
<div class="flex flex-col w-screen h-dvh bg-gray-800 text-white rounded-lg">
  
    <!-- Header -->
    <header class="flex items-center justify-between px-4 py-3 bg-zinc-900">
      <!-- Logo and App Name -->
      <div class="flex items-center space-x-2">
        <img src="{profile}" alt="Logo" class="w-10 h-10 rounded-full" />
        <p class="text-xl font-mono font-bold">SecRush</p>
      </div>
      <!-- Back Button -->
      <a href="/" class="text-3xl font-bold hover:text-gray-300">
        ←
      </a>
    </header>
    
    <!-- Main Content Area -->
    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
  
      <!-- Monaco Code Box -->
      <main class="flex-1 overflow-auto bg-gray-90033">
        <MonacoBox bind:updateContent={codeUpdate} class="w-full h-full" />
      </main>
    
      <!-- Footer / Sidebar -->
      <footer class="bg-zinc-900 p-4 md:order-first md:w-1/4 md:py-20 flex flex-col">
  
        <!-- Spacer to Push Content to Bottom on Mobile -->
        <div class="flex flex-col flex-grow space-y-4">
  
          <!-- Game Controls and Buttons -->
          <div class="flex flex-col space-y-4">

              <!-- Active Game Controls -->
              <div class="flex flex-col space-y-4">
                <form class="flex flex-col space-y-2">
                  <input
                    type="number"
                    id="number-input"
                    bind:value={selectedLine}
                    aria-describedby="helper-text-explanation"
                    class="bg-zinc-800 border border-zinc-300 text-gray-100 text-sm rounded focus:border-gray-100 block w-full p-2.5"
                    placeholder="Enter line number"
                  />
                  <div class="flex space-x-2">
                    <button
                        type="button"
                        on:click={solvePuzzle}
                        class="flex-1 px-4 py-2 text-gray-300 font-light border border-gray-300 rounded  hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
                        disabled={solvePuzzleLoading} 
                    >
                        {#if solvePuzzleLoading}
                            <img src="{loadingGif}" alt="Loading..." class="w-5 h-5" />
                        {:else}
                            Submit
                        {/if}
                    </button>

                    <button
                        type="button"
                        on:click={newPuzzle}
                        class="flex-1 px-4 py-2 text-gray-300 font-light border border-gray-300 rounded  hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
                        disabled={newPuzzleLoading} 
                    >
                        {#if newPuzzleLoading}
                            <img src="{loadingGif}" alt="Loading..." class="w-5 h-5" />
                        {:else}
                            Next Puzzle
                        {/if}
                    </button>
                  </div>
                </form>
                <PuzzleResult results={puzzles} />
              </div>

          </div>
  
        </div>
  
      </footer>
    </div>
  </div>
  