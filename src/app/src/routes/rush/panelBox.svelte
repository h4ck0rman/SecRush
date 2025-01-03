<script>
    // Components imported
    import PuzzleResult from "./puzzleResult.svelte";
    import MonacoBox from "./monacoBox.svelte";
    import { startSession } from '../../lib/api';
    import { VITE_AWS_BACKEND } from '$env/static/public';

    const profile = "h4ck0rLogo.png";
    
    // state for active puzzle rush session UI
    export let rushActive = false;
    let currentPuzzle = null; // Store the current puzzle
    let selectedLine = null; // User's selected line
    let feedbackMessage = ''; // Message to display feedback
    let errorMessage = ''; // Error message for issues

    const backend = VITE_AWS_BACKEND;

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


    // Example function to substitute for backend response
    let puzzles = [];
    let count = 1;
    let score = 0;

    let codeUpdate;
    let language = 'python';
    
    const solvePuzzle = async () => {
        console.log(selectedLine);

        if (!selectedLine || selectedLine <= 0) {
            feedbackMessage = 'Please select a valid line number to solve the puzzle.';
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
            selectedLine = null;
            
        } catch (error) {
            console.error('Error solving puzzle:', error);
            errorMessage = 'Failed to submit your solution. Please try again later.';
        }
    };


    const newPuzzle = async () => {
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
        }
        
    };
    
</script>


<div class='flex flex-row w-screen h-screen rounded-lg'>
    <div class="absolute top-0 left-0 py-10 px-10">
        <a href="/">
            <p class="text-3xl text-white font-bold">{'←'}</p>
        </a>
    </div>

    <span class='basis-1/4'>
        <div class="container flex flex-col space-y-10 py-10 bg-zinc-900 h-full">
            <img src={profile} alt="profile of user" class="w-24 py-10 mx-auto"/>
            
        
            {#if !rushActive}
            
            <button on:click={handleStartGame} class=" mx-auto bg-transparent hover:bg-white text-white font-semibold hover:text-black py-2 px-4 border border-white hover:border-transparent rounded">Start Rush</button>
            
            {:else}
            <div>
                <form class="px-10 py-5 mx-auto flex flex-col">
                    <input
                        type="number"
                        id="number-input"
                        bind:value={selectedLine}
                        aria-describedby="helper-text-explanation"
                        class="bg-zinc-900 border border-zinc-300 text-gray-900 text-sm rounded  focus:border-gray-100 block w-full p-2.5 dark:bg-gray-900 dark:border-zinc-300 dark:placeholder-gray-400 dark:text-white dark:focus:ring-gray-100 dark:focus:border-gray-100"
                        placeholder="Enter line number"
                    />
                    <div class="w-full flex space-x-2 flex-row py-2">
                        <button 
                            on:click={solvePuzzle} 
                            class="flex-1 px-4 py-2 h-full text-gray-300 font-light border border-gray-300 rounded hover:bg-white hover:text-black hover:border-transparent transition">
                            Submit
                        </button>
                        <button 
                            on:click={newPuzzle} 
                            class="flex-1 px-4 py-2 h-full text-gray-300 font-light border border-gray-300 rounded hover:bg-white hover:text-black hover:border-transparent transition">
                            New Puzzle
                        </button>
                    </div>
                    
                    
                </form>
                <PuzzleResult results={puzzles} />
            </div>
            {/if}

        </div>      
    </span>


    <span class='basis-3/4'><MonacoBox bind:updateContent={codeUpdate}/></span>


</div>