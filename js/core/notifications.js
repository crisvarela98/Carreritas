function notify(text, type) {
    const container = document.getElementById("notifications");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "toast" + (type ? " toast-" + type : "");
    div.innerText = text;

    container.appendChild(div);

    setTimeout(() => div.remove(), 3200);
}

function notifySuccess(text) { notify(text, "success"); }
function notifyWarn(text)    { notify(text, "warn"); }
function notifyInfo(text)    { notify(text, "info"); }
