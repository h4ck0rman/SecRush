export async function startSession() {
    try {
        const backend = "https://urw2bcffsg.execute-api.us-east-1.amazonaws.com";
        // Make a POST request to the "start session" API endpoint
        const response = await fetch(backend + '/gameSession/newSession', {
            method: 'POST',
            credentials: 'include', // Ensures cookies are included in the request/response
        });

        // Check if the request was successful
        if (!response.ok) {
            throw new Error(`Failed to start session: ${response.statusText}`);
        }

        // Parse the JSON response to get the sessionId
        const data = await response.json();
        const { sessionId } = data;

        if (!sessionId) {
            throw new Error('Session ID not found in the response');
        }

        // Store the sessionId in localStorage
        localStorage.setItem('sessionId', sessionId);

        // Return the sessionId for further use if needed
        return sessionId;
    } catch (error) {
        console.error('Error starting session:', error);
        throw error; // Re-throw the error for handling in the caller
    }
}
