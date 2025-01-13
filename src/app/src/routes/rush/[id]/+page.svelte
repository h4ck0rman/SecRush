<!-- src/routes/rush/[id].svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { get } from 'svelte/store';

  const profile = "h4ck0rLogo.png";
  const loadingGif = "loading.gif";
  const loadingBGif = "loadingB.gif";

  let puzzleData = '';
  let error = '';
  let solvePuzzleLoading = false;
  let selectedLine = null;
  let solvePuzzleDisable = false;

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

          // Show the correct logo
          showCorrectLogo = true;

          // Hide the logo after 1 second
          setTimeout(() => {
              showCorrectLogo = false;
          }, 1000); // 1000 milliseconds = 1 second

      } else {
          solutionHighlight([{line: correctLine, colour:'green'}, {line: selectedLine, colour:'red'}]);
      
          // Show the correct logo
          showWrongLogo = true;

          // Hide the logo after 1 second
          setTimeout(() => {
              showWrongLogo = false;
          }, 1000); // 1000 milliseconds = 1 second
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

  onMount(async () => {
    const backend = import.meta.env.VITE_LOCAL_DOMAIN || "https://api.sec-rush.com";
    const id = get(page).params.id;
    try {
      const response = await fetch(backend+'/gameSession/getPuzzle', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ puzzleId: id })
      });
      if (response.ok) {
        const data = await response.json();
        puzzleData = JSON.stringify(data, null, 2);
      } else {
        const err = await response.json();
        error = err.error || 'Error fetching puzzle';
      }
    } catch (err) {
      error = 'Error fetching puzzle';
    }
  });
</script>

<style>
  pre {
    background-color: #1e1e1e;
    color: #ffffff;
    padding: 1rem;
    border-radius: 8px;
    overflow: auto;
    white-space: pre-wrap;
    font-family: 'Courier New', Courier, monospace;
  }

  .container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    background-color: #121212;
    border-radius: 8px;
  }

  h1 {
    color: #ffffff;
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  p {
    color: #ffffff;
  }
</style>

<div class="container">
  {#if error}
    <h1>Error</h1>
    <p>{error}</p>
  {:else}
    <h1>Puzzle Data</h1>
    <pre>{puzzleData}</pre>
  {/if}
</div>
