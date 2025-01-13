<script>
    // Components imported
    import { startSession } from '$lib/api';
    import { onMount } from 'svelte';
    import Header from '$lib/components/header.svelte';
    import MonacoBox from '$lib/components/monacoBox.svelte';
    import PuzzleResult from '$lib/components/puzzleResult.svelte';
    import SubmitButton from '$lib/components/submitButton.svelte';
    import NewPuzzleButton from '$lib/components/newPuzzleButton.svelte';

    const profile = "h4ck0rLogo.png";
    const loadingGif = "loading.gif";
    const loadingBGif = "loadingB.gif";

    let currentPuzzle = null; 
    let feedbackMessage = ''; 
    let errorMessage = ''; 
    let loading = true;
    let newPuzzleLoading = false;
    let solvePuzzleLoading = false;
    let selectedLine = null;
    let solvePuzzleDisable = false;
    let monacoRendered;
    let puzzleData;
    let puzzles = [];
    let count = 1;
    let score = 0;

    let codeUpdate;
    let solutionHighlight;
    let newPuzzle;
    let language = 'python';
    
    let showCorrectLogo = false;
    let showWrongLogo = false;

    const correctLogo = "logos/green_tick.png";
    const wrongLogo = "logos/red_cross.png";

    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";

    // game loading and mounting 
    const handleStartGame = async () => {
        try {
            const sessionId = await startSession();
        } catch (error) {
            errorMessage = 'Failed to start the session. Please try again later.';
        } 
    };

    onMount(() => {
        handleStartGame();
    });

    // monaco event functions
    function handleMonacoReady() {
        newPuzzle();
        handleToggleLoading();
    }

    function handleLineClick(event) {
        selectedLine = event.detail.lineNumber;
    }

    // submit button event function
    const handlePuzzleSubmit = async (event) => {
        const puzzleData = event.detail;
        
        const { message, puzzleId, correct, correctLine } = puzzleData; 
        
        // Update puzzles reactively
        puzzles = [...puzzles, { count, correct, puzzleId, correctLine }];
        count += 1;

        // Update feedback message and score
        feedbackMessage = correct
            ? 'Correct! Well done.'
            : 'Incorrect. Try to analyze the code again.';

        if (correct) {
            score += 1;
            newPuzzle();

            showCorrectLogo = true;
            setTimeout(() => {
                showCorrectLogo = false;
            }, 1000); 

        } else {
            solutionHighlight([
                { line: correctLine, colour: 'green' }, 
                { line: selectedLine, colour: 'red' }
            ]);
        
            showWrongLogo = true;
            setTimeout(() => {
                showWrongLogo = false;
            }, 1000); 
        }
    };

    const handleNextPuzzle = async (event) => {
        const data = event.detail;
        currentPuzzle = data.id;
        const { code, language } = data; 
         
        codeUpdate(code, language);
    }

    const handleEOS = async (event) => {
        const message = event.detail.finishMessage;
        codeUpdate(message, 'javascript');
    }
    
    let isPuzzleResultVisible = true;
    // Function to toggle visibility
    function togglePuzzleResult() {
        isPuzzleResultVisible = !isPuzzleResultVisible;
    }

    const handleToggleLoading = async (event) => {
        loading = !loading;
    }

    
</script>

<style>
    .button-wrapper {
        width: 50%;
    }
</style>

<div>
{#if loading }
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class=" p-6 rounded-lg shadow-lg flex flex-col items-center">
            <img src="{loadingGif}" alt="Loading..." class="w-18 h-12 mb-4" />
        </div>
    </div>
{/if}

{#if showCorrectLogo}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <img src="{correctLogo}" alt="Correct Answer" class="w-16 h-16 animate-pulse">
    </div>
{/if}

{#if showWrongLogo}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <img src="{wrongLogo}" alt="Correct Answer" class="w-16 h-16 animate-pulse">
    </div>
{/if}
  
<div class="flex flex-col w-screen h-dvh bg-gray-800 text-white rounded-lg">
  
    <Header />
    
    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
  
      <main class="flex-1 overflow-auto bg-zinc-900">
        <MonacoBox on:lineClick={handleLineClick} on:ready={handleMonacoReady} bind:updateContent={codeUpdate} bind:solutionHighlight={solutionHighlight} class="w-full h-full" />
      </main>
    
  
      <footer class="bg-black   px-4 pb-4 md:order-first md:w-1/4 md:py-20 flex flex-col relative">

        <button 
            on:click={togglePuzzleResult} 
            class="flex items-center justify-center  bg-opacity-75 hover:bg-opacity-90 text-white rounded-full p-1 focus:outline-none  mb-2 md:mb-4 md:hidden"
            aria-label={isPuzzleResultVisible ? "Hide Results" : "Show Results"}
        >
            {#if isPuzzleResultVisible}
                <!-- Down Arrow -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>&ThickSpace;hide
            {:else}
                <!-- Up Arrow -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
            {/if}
        </button>
        
        <div class="flex flex-col flex-grow space-y-4">
          <div class="flex flex-col space-y-4">
              <div class="flex flex-col space-y-1 md:space-y-4">
                    <PuzzleResult results={puzzles} visible={isPuzzleResultVisible} />

                    <div class="w-full flex space-x-2">
                        <div class="button-wrapper">
                            <SubmitButton
                                on:puzzleData={handlePuzzleSubmit} 
                                currentPuzzle={currentPuzzle}
                                selectedLine={selectedLine}
                            />
                        </div>
                        <div class="button-wrapper">
                            <NewPuzzleButton
                                on:nextPuzzle={handleNextPuzzle}
                                on:eos={handleEOS}
                                on:toggleLoading={handleToggleLoading}
                                bind:newPuzzle={newPuzzle}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  </div>
</div>