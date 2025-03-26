try {
    // Add click handlers to all buttons
    const buttons = document.querySelectorAll('.template-button');
    
    if (buttons.length === 0) {
        console.error('No buttons found with class template-button');
    } else {
        buttons.forEach(button => {
            button.addEventListener('click', async () => {
                const command = button.getAttribute('data-command');
                try {
                    await webviewApi.postMessage({
                        type: 'executeCommand',
                        command: command
                    });
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            });
        });
    }

} catch (error) {
    console.error('Error in script:', error);
}