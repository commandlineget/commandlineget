/*
 * V: 0.0.8 - 3/17/2018
*/

/*
 * clipboard function originated with mozilla webextension examples here:
 * https://github.com/mdn/webextensions-examples
 */
 
 
var quotesOption = false;
var programOption = 'curl';
var fileOption = 'auto';
var filenameOption = 'download.fil';
var ratelimitOption = '';
var verboseOption = false;
var resumeOption = true;
var headers = '';
var ariaheaders = '';
var curlUserOption = '';
var wgetUserOption = '';
var snackbarOption = false;

//Right click context adds for links + audio/video
browser.contextMenus.create({
    id: "copy-link-to-clipboard",
    title: "Create web link for Download",
    contexts: ["link"]
});
browser.contextMenus.create({
    id: "copy-media-to-clipboard",
    title: "Create media link for Download",
    contexts: ['video', 'audio']
});

//basic promisified xmlhttpreq, will be stopped at building the request
let ajaxGet = (obj) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(obj.method || "GET", obj.url);
        if (obj.headers) {
            Object.keys(obj.headers).forEach(key => {
                xhr.setRequestHeader(key, obj.headers[key]);
            });
        }
        xhr.send(obj.body);
        resolve(true);
    });
};

// callback for onBeforeSendHeaders listener.
// Returns a promise and adds cancel request to the xmlhttpreq
let getHeaders = (e) => {
    headers = '';
    ariaheaders = '';
    for (let header of e.requestHeaders) {
        headers += " --header '" + header.name + ": " + header.value + "'";
        ariaheaders += " --header='" + header.name + ": " + header.value + "'";
    }
    //console.log(headers);
    var asyncCancel = new Promise((resolve, reject) => {
        resolve({cancel: true});
    });
    
    return asyncCancel;
};

// main command builder function
function assembleCmd(url, referUrl) {
    let curlText = "curl";  // curl command holder
    let wgetText = "wget";  // wget command holder
    let ariaText = "aria2c"; // aria2 command holder
    if (verboseOption) { curlText += " -v"; wgetText += " -v"; ariaText += " --console-log-level=debug"; }
    if (resumeOption) { curlText += " -C -"; wgetText += " -c"; ariaText += " -c"; }
    try {
        if (ratelimitOption.replace(/\s/g,'')) { 
            curlText += " --limit-rate " + ratelimitOption; 
            wgetText += " --limit-rate " + ratelimitOption;
            ariaText += " --max-overall-download-limit=" + ratelimitOption;
        }
    }
    catch (e) {
        //console.log("ratelimitOption: " + e);
        // ratelimit not set
    }
    // ######################################################################
    // use remote suggested filename, how safe is this?  also only available in moderately up to date 
    // ## replacement for -O -J, same security issues though, make optional 
    // ## this version will accept filename or location header
    // curl -s -D - "$url" -o /dev/null | grep -i "filename\|Location" | (IFS= read -r spo; sec=$(echo ${spo//*\//filename=}); echo ${sec#*filename=});
    // ######################################################################
    
    if (fileOption === 'auto') { curlText += " -O -J"; wgetText += " --content-disposition"; }
    else { 
        try {
            if (!filenameOption.replace(/\s/g,'')) { throw "err: empty or whitespace filename: " + filenameOption }
        }
        catch (e) {
            //console.log("filenameOption: " + e);
            filenameOption = 'download.fil';
        }
        curlText += " -o " + filenameOption;
        wgetText += " -O " + filenameOption;
        ariaText += " -o " + filenameOption;
    }
        
    curlText += 
        " -L" + headers +
        // auto generated headers don't appear to include this, leaving here for now
        " --header 'Referer: " + referUrl + "'";
    try {
        if (curlUserOption.replace(/\s/g,'')) { curlText += " " + curlUserOption; }    
    }
    catch (e) {
        //ignore empty user option text inputs
    }
    curlText +=
        " '" + url + "'" +
        " -w '\\nFile saved as: %{filename_effective}\\n'";
        
    
    wgetText += headers;
    try {
        if (wgetUserOption.replace(/\s/g,'')) { wgetText += " " + wgetUserOption; }    
    }
    catch (e) {
        //ignore empty user option text inputs
    }
    wgetText += " '" + url + "'";
    
    ariaText += ariaheaders;
    try {
        if (ariaUserOption.replace(/\s/g,'')) { ariaText += " " + ariaUserOption; }    
    }
    catch (e) {
        //ignore empty user option text inputs
    }
    ariaText += " '" + url + "'";
    
    
    
    if (quotesOption) {
        curlText = curlText.replace(/'/g,'"');
        wgetText = wgetText.replace(/'/g,'"');
        ariaText = wgetText.replace(/'/g,'"');
    }
    
    const curlCode = "copyToClipboard(" + JSON.stringify(curlText) + ", " + snackbarOption + ");";
    const wgetCode = "copyToClipboard(" + JSON.stringify(wgetText) + ", " + snackbarOption + ");";
    const ariaCode = "copyToClipboard(" + JSON.stringify(ariaText) + ", " + snackbarOption + ");";
    
    switch (programOption) {
        case "curl":
            return (curlCode);
            break;
        case "wget":
            return (wgetCode);
            break;
        case "aria":
            return (ariaCode);
            break;
    }
    //return (programOption === "curl") ? curlCode : wgetCode;
};

function copyCommand(code, tab)  {
browser.tabs.executeScript({
    code: "typeof copyToClipboard === 'function';",
    }).then((results) => {
            // The content script's last expression will be true if the function
            // has been defined. If this is not the case, then we need to run
            // clipboard-helper.js to define function copyToClipboard.
            if (!results || results[0] !== true) {
                return browser.tabs.executeScript(tab.id, {
                    file: "clipboard-helper.js",
                });
            }
    }).then(() => {
            return browser.tabs.executeScript(tab.id, {
                code,
            });
    }).catch((error) => {
            // This could happen if the extension is not allowed to run code in
            // the page, for example if the tab is a privileged page.
            console.error("Failed : " + error);
    });
};

browser.contextMenus.onClicked.addListener((info, tab) => {

    let url = (info.menuItemId === 'copy-media-to-clipboard') ? info.srcUrl : info.linkUrl
    let referUrl = info.pageUrl;
    
    // add onbeforesendheaders listener for clicked url
    browser.webRequest.onBeforeSendHeaders.addListener(
        getHeaders, {urls: [url]}, ["blocking","requestHeaders"]);
    
    // workaround for xmlhttpget firing before addlistener is complete    
    let gettingHtml = new Promise (function(resolve,reject) {
        setTimeout(function(){ 
                resolve(ajaxGet({url: url}));
                }, 1);
    });
    
    // check the saved options each click in case they changed
    let gettingOptions = browser.storage.sync.get(
        ['quotes','prog','file','filename','ratelimit','verbose','resume','wgetUser','curlUser', 'ariaUser', 'snackbar'])
        .then((res) => {
            quotesOption = res.quotes;
            programOption = res.prog;
            fileOption = res.file;
            filenameOption = res.filename;
            ratelimitOption = res.ratelimit;
            verboseOption = res.verbose;
            resumeOption = res.resume;
            curlUserOption = res.curlUser;
            wgetUserOption = res.wgetUser;
            ariaUserOption = res.ariaUser;
            snackbarOption = res.snackbar;
        });
    
    // loop all requesite async functions into promise.all
    Promise.all([gettingOptions,gettingHtml]).then(() => { 
        let code = assembleCmd(url, referUrl);
        copyCommand(code,tab);
        
        browser.webRequest.onBeforeSendHeaders.removeListener(getHeaders);
        //console.log("status onbefore: " + browser.webRequest.onBeforeSendHeaders.hasListener(getHeaders));
    });
    
});

