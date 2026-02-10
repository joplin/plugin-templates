/**
 * Workaround for Joplin dialog focus issue (https://github.com/laurent22/joplin/issues/4474).
 * Uses a style tag onload hack since inline scripts and autofocus don't work reliably.
 * The target element must have id="autofocus-target".
 */
export const AUTO_FOCUS_SCRIPT = "<style onload=\"document.getElementById('autofocus-target').focus()\" src=\"#\"></style>";
