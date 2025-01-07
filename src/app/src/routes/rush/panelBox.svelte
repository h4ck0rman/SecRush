<script>
    // Components imported
    import PuzzleResult from "./puzzleResult.svelte";
    import MonacoBox from "./monacoBox.svelte";
    import { startSession } from '../../lib/api';
    import { onMount } from 'svelte';

    const profile = "h4ck0rLogo.png";
    const loadingGif = "loading.gif";
    const loadingBGif = "loadingB.gif";

    let currentPuzzle = null; 
    let feedbackMessage = ''; 
    let errorMessage = ''; 
    let loading = false;
    let newPuzzleLoading = false;
    let solvePuzzleLoading = false;
    let selectedLine = null;
    let solvePuzzleDisable = false;
    let monacoRendered;
    

    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";

    const handleStartGame = async () => {
        loading = true;
        try {
            const sessionId = await startSession();

        } catch (error) {
            errorMessage = 'Failed to start the session. Please try again later.';

        } finally {
            loading = false;
        }
    };

    function handleMonacoReady() {
        // Now that Monaco is ready, fetch the next puzzle
        newPuzzle();
    }

    onMount(() => {
        handleStartGame();
    });

    function handleLineClick(event) {
        selectedLine = event.detail.lineNumber;
    }


    let isPuzzleResultVisible = true;

    // Function to toggle visibility
    function togglePuzzleResult() {
        isPuzzleResultVisible = !isPuzzleResultVisible;
    }

    // Example function to substitute for backend response
    let puzzles = [];
    let count = 1;
    let score = 0;

    let codeUpdate;
    let solutionHighlight;
    let language = 'python';
    
    const solvePuzzle = async () => {

        if (!selectedLine || selectedLine <= 0) {
            console.error('Please select a valid line number to solve the puzzle.');
            return
        }

        loading = true;
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
                solvePuzzleDisable = false;
                newPuzzle();

            } else {
                solutionHighlight([{line: correctLine, colour:'green'}, {line: selectedLine, colour:'red'}]);
            }


        } catch (error) {
            console.error('Error solving puzzle:', error);
            errorMessage = 'Failed to submit your solution. Please try again later.';

        } finally {
            selectedLine = null;
            loading = false;
            solvePuzzleLoading = false;
            
        }
    };


    const newPuzzle = async () => {
        loading = true;
        newPuzzleLoading = true;
        solvePuzzleDisable = false;
        try {
            const response = await fetch(backend + '/gameSession/newPuzzle', {
                method: 'GET',
                credentials: 'include', 
            });

            if (response.status === 404) {
                codeUpdate('\n\nWe Have Run Out Of Puzzles For This Session...\n\nYou Killed It!!!\n\n', 'text');
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
                

            } else if (!response.ok) {
                const errorData = await response.json();  
                throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();

            currentPuzzle = data.id;
            const { code, language } = data; 
            
            codeUpdate(code, language);

        } catch (error) {
            console.error('Error fetching next puzzle:', error);

        } finally {
            loading = false;
            newPuzzleLoading = false;
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
      <div >
        <a href="/" class="flex items-center space-x-2">
            <img src="{profile}" alt="Logo" class="w-10 h-10 rounded-full" />
            <p class="text-xl font-mono ">secrush</p>
        </a>
        
      </div>
      
    </header>
    
    <!-- Main Content Area -->
    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
  
      <!-- Monaco Code Box -->
      <main class="flex-1 overflow-auto bg-gray-90033">
        <MonacoBox on:lineClick={handleLineClick} on:ready={handleMonacoReady} bind:updateContent={codeUpdate} bind:solutionHighlight={solutionHighlight} class="w-full h-full" />
      </main>
    
      <!-- Footer / Sidebar -->
      <footer class="bg-zinc-900 px-4 pb-4 md:order-first md:w-1/4 md:py-20 flex flex-col relative">
        <!-- Toggle Button -->
        <button 
            on:click={togglePuzzleResult} 
            class="flex items-center justify-center  bg-opacity-75 hover:bg-opacity-90 text-white rounded-full p-1 focus:outline-none  mb-2 md:mb-4 md:hidden"
            aria-label={isPuzzleResultVisible ? "Hide Results" : "Show Results"}
        >
            {#if isPuzzleResultVisible}
                <!-- Down Arrow -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            {:else}
                <!-- Up Arrow -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
            {/if}
        </button>
        <!-- Spacer to Push Content to Bottom on Mobile -->
        <div class="flex flex-col flex-grow space-y-4">
  
          <!-- Game Controls and Buttons -->
          <div class="flex flex-col space-y-4">

              <!-- Active Game Controls -->
              <div class="flex flex-col space-y-1 md:space-y-4">
                
                <PuzzleResult results={puzzles} visible={isPuzzleResultVisible} />
                <form class="flex flex-col md:order-first">
                  
                  <div class="flex space-x-2">
                    <button
                        type="button"
                        on:click={solvePuzzle}
                        class="flex-1 px-4 py-2 text-gray-300 font-light border border-gray-300 rounded  hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
                        disabled={solvePuzzleLoading || solvePuzzleDisable} 
                    >
                        {#if solvePuzzleLoading}
                            <img src="{loadingBGif}" alt="Loading..." class="h-5 w-auto md:h-6 md:w-auto" />
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
                            <img src="{loadingBGif}" alt="Loading..." class="h-5 w-auto md:h-6 md:w-auto" />
                        {:else}
                            Next Puzzle
                        {/if}
                    </button>
                  </div>
                </form>
                
              </div>

          </div>
  
        </div>
  
      </footer>
    </div>
  </div>
  