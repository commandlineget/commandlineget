function saveOptions(e) {
  browser.storage.sync.set({
    quotes: document.querySelector('input[name=quotes]').checked,
    prog: document.querySelector('input[name=prog]:checked').value,
    file: document.querySelector('input[name=file]:checked').value,
    filename: document.querySelector('input[name=filename]').value,
    ratelimit: document.querySelector('input[name=ratelimit]').value,
    verbose: document.querySelector('input[name=verbose]').checked,
    resume: document.querySelector('input[name=resume]').checked,
    wgetUser: document.querySelector('input[name=wgetUser]').value,
    curlUser: document.querySelector('input[name=curlUser]').value,
    snackbar: document.querySelector('input[name=snackbar]').checked,
    
  });
    if (typeof(e) !== "undefined") {
        e.preventDefault();
    }

}

function restoreOptions() {
  var gettingItem = browser.storage.sync.get(
    ['quotes', 'prog','file','filename','ratelimit','verbose','resume','wgetUser','curlUser','snackbar']);
  gettingItem.then((res) => {
    
    if (Object.keys(res).length > 0 && res.constructor === Object) {
        document.querySelector('input[name=quotes]').checked = res.quotes ? res.quotes : false;
        document.querySelector('input[name=prog][value=' + res.prog + ']').checked = true;
        document.querySelector('input[name=file][value=' + res.file + ']').checked = true;
        document.querySelector('input[name=filename]').value = res.filename ? res.filename : '';
        document.querySelector('input[name=ratelimit]').value = res.ratelimit ? res.ratelimit : '';
        document.querySelector('input[name=verbose]').checked = res.verbose ? res.verbose : false;
        document.querySelector('input[name=resume]').checked = res.resume ? res.resume : true;
        document.querySelector('input[name=wgetUser]').value = res.wgetUser ? res.wgetUser : '';
        document.querySelector('input[name=curlUser]').value = res.curlUser ? res.curlUser : '';
        document.querySelector('input[name=snackbar]').checked = res.snackbar ? res.snackbar : false;
    }
    // if no saved info save the defaults to initialize
    else {
        saveOptions();
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
