function saveOptions(e) {
  browser.storage.sync.set({
    prog: document.querySelector('input[name=prog]:checked').value,
    file: document.querySelector('input[name=file]:checked').value,
    filename: document.querySelector('input[name=filename]').value,
    ratelimit: document.querySelector('input[name=ratelimit]').value,
    verbose: document.querySelector('input[name=verbose]').checked,
    resume: document.querySelector('input[name=resume]').checked,
    wgetUser: document.querySelector('input[name=wgetUser]').value,
    curlUser: document.querySelector('input[name=curlUser]').value
  });
  e.preventDefault();
}

function restoreOptions() {
  var gettingItem = browser.storage.sync.get(
    ['prog','file','filename','ratelimit','verbose','resume','wgetUser','curlUser']);
  gettingItem.then((res) => {
    
    document.querySelector('input[name=prog][value=' + res.prog + ']').checked = true;
    document.querySelector('input[name=file][value=' + res.file + ']').checked = true;
    document.querySelector('input[name=filename]').value = res.filename ? res.filename : '';
    document.querySelector('input[name=ratelimit]').value = res.ratelimit ? res.ratelimit : '';
    document.querySelector('input[name=verbose]').checked = res.verbose ? res.verbose : false;
    document.querySelector('input[name=resume]').checked = res.resume ? res.resume : true;
    document.querySelector('input[name=wgetUser]').value = res.wgetUser ? res.wgetUser : '';
    document.querySelector('input[name=curlUser]').value = res.curlUser ? res.curlUser : '';
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);