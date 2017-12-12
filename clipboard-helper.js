// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
function copyToClipboard(text, show) {
    function oncopy(event) {
        document.removeEventListener("copy", oncopy, true);
        // Hide the event from the page to prevent tampering.
        event.stopImmediatePropagation();

        // Overwrite the clipboard content.
        event.preventDefault();
        event.clipboardData.setData("text/plain", text);
        
        if (show == true) {
            var mydiv = document.getElementById('addon-clg-snackbar');
            // check for existing snackbar, if not found add stylesheet and bar
            if (!mydiv) {
                // push snackbar style into document
                var style = document.createElement('style');
                style.type = 'text/css';
                style.innerHTML = '.clg-snackbar { min-width: 200px; background-color: #333; \
                border-style:solid; border-color: black; animation: fadeinout 3s ease-out forwards; \
                color: #fff; text-align: center; border-radius: 2px; padding: 16px; position: fixed; \
                z-index: 10000; left: 50%; bottom: 30px; } \
                @keyframes fadeinout { \
                    0%,100% { opacity: 0; } \
                    50% { opacity: 1; } }'
                    
                document.getElementsByTagName('head')[0].appendChild(style);
                
                document.body.innerHTML += "<div class='clg-snackbar' id='addon-clg-snackbar'>Selected item added to copy buffer</div>";
            }
            else {
                // if bar exists, toggle classname to fire animation with minimal delay between states
                mydiv.className = ''; 
                setTimeout(function() {mydiv.className = 'clg-snackbar';}, 10);
            }
                
        }
        
        
    }
    document.addEventListener("copy", oncopy, true);

    // Requires the clipboardWrite permission, or a user gesture:
    document.execCommand("copy");
}
