<!-- src/routes/rush/[id].svelte -->
<script>
  import { startSession } from '$lib/api';

  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';
  import SubmitButton from '$lib/components/submitButton.svelte';
  import MonacoBox from '$lib/components/monacoBox.svelte';
  import Header from '$lib/components/header.svelte';

  let profile = "/h4ck0rLogo.png";
  let loadingGif = "/loading.gif";
  let loadingBGif = "/loadingB.gif";
  let correctLogo = "/logos/green_tick.png";
  let wrongLogo = "/logos/red_cross.png";

  const puzzleId = get(page).params.id;


  let solutionText = '';

  let codeUpdate;
  let solutionHighlight;

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
  async function handleMonacoReady() {
    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";

    const url = backend + '/gameSession/getPuzzle/' + puzzleId;
    console.log(url);
    try {
      const response = await fetch(url, {
          method: 'GET',
          credentials: 'include', 
      });

      if (!response.ok) {
          const errorData = await response.json();  
          throw new Error(`Failed to solve puzzle: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      const {id , code, difficulty, language, vulnerableLine, solution} = data;
      solutionText = solution;

      codeUpdate(code, language);
      

    } catch (error) {
      console.error('Error fetching next puzzle:', error);

    } finally {
      handleToggleLoading();
    }

  }

  let selectedLine;
  function handleLineClick(event) {
      selectedLine = event.detail.lineNumber;
  }

  // page loading animation toggleing
  let loading = true;
  const handleToggleLoading = async (event) => {
      loading = !loading;
  }

  let showSolution = false;
  const handleToggleSolution = async (event) => {
      showSolution = !showSolution;
  }


  // submit button event function
  let showCorrectLogo = false;
  let showWrongLogo = false;

  const handlePuzzleSubmit = async (event) => {
        const puzzleData = event.detail;
        
        const { message, puzzleId, correct, correctLine } = puzzleData; 

        if (correct) {

            showCorrectLogo = true;
            setTimeout(() => {
                showCorrectLogo = false;
            }, 1000); 
            solutionHighlight([
                { line: correctLine, colour: 'green' }
            ]);

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

</script>


{#if loading }
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="p-6 rounded-lg shadow-lg flex flex-col items-center ">
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
    <main class="flex-1 overflow-auto ">
      <MonacoBox 
        on:lineClick={handleLineClick} 
        on:ready={handleMonacoReady} 
        bind:updateContent={codeUpdate} 
        bind:solutionHighlight={solutionHighlight} 
        class="w-full h-full" 
      />
    </main>

    <footer class={`bg-black px-4 pb-4 md:order-first md:w-1/4 md:py-20 md:h-full h-auto flex flex-col relative transition-all duration-300 ${showSolution ? 'fixed inset-x-0 bottom-0 h-4/5' : 'relative h-auto'}`}>
      <div class="flex flex-col space-y-1 md:space-y-4 h-full">
        
          <div class="w-full pt-4 flex flex-col items-center justify-center md:py-10">
              <div class="w-full mx-auto flex space-x-2">
                    <div class="w-full">
                        <SubmitButton
                            on:puzzleData={handlePuzzleSubmit} 
                            currentPuzzle={puzzleId}
                            selectedLine={selectedLine}
                        />
                    </div>
                    <button
                    type="button"
                    on:click={handleToggleSolution}
                    class="w-full px-4 py-2 text-white font-light border border-gray-300 rounded hover:bg-white hover:text-black hover:border-transparent transition flex items-center justify-center"
                    >
                        {#if showSolution}
                            Hide Solution
                        {:else}
                            Show Solution
                        {/if}
                    </button>

                
                  
              </div>
              
              {#if showSolution}
                  <div class="w-full font-mono whitespace-pre-line bg-zinc-900 mt-4 p-4 overflow-y-auto max-h-[60vh]">
                      {solutionText}
                  </div>
              {/if}
          </div>
      </div>
    </footer>
  </div>
</div>