export default function(context: any) {
    const plugin = (_cm) => {
        try {
            const newNoteButton = document.getElementsByClassName('new-note-button')[0]
            const container = newNoteButton.parentElement
    
            const button = newNoteButton.cloneNode(true) as Element
            button.children[1].innerHTML = 'Template'
            container.append(button)
    
            button.addEventListener('click', () => {
                context.postMessage({ command: 'newFromTemplate' });
            })
        } catch (e) {
            console.log('Error', e)
        }
    }

    return {
        plugin: plugin
    }
}