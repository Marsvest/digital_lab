'use client'
import { FormEvent } from "react";

interface ExtendedRequestOptions extends RequestInit {
    timeoutDuration?: number;
}

async function fetchWithTimeout(url: RequestInfo, options: ExtendedRequestOptions = {}): Promise<Response> {
    const { timeoutDuration = 10000 } = options;
    const abortController = new AbortController();
    const { signal } = abortController;

    const requestOptions: RequestInit = { ...options, signal };

    const timeoutId = setTimeout(() => abortController.abort(), timeoutDuration);

    try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('The request timed out');
        }
        throw error;
    }
}

export default function DeploymentForm() {
    async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        try {
            const response = await fetchWithTimeout('http://localhost/deployment-server/api/ubuntu/deploy', {
                method: 'POST',
                body: formData,
                timeoutDuration: 300000
            });

            const responseBody = await response.json();
            console.log(responseBody);
        } catch (error) {
            console.error('Error during deployment:', error);
        }
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <form onSubmit={handleFormSubmit}>
                <input type="text" name="repositoryUrl" placeholder="Input git repository" required /><br />
                <button type="submit">Deploy</button>
            </form>
        </main>
    );
}
