function notify(text, type) {
    const el = document.getElementById("notifications");
    if (!el) return;
    const div = document.createElement("div");
    div.className = "toast" + (type ? " toast-" + type : "");
    div.innerText = text;
    el.appendChild(div);
    setTimeout(() => div.remove(), 3200);
}
function notifySuccess(text) { notify(text, "success"); }
function notifyWarn(text)    { notify(text, "warn"); }
function notifyInfo(text)    { notify(text, "info"); }
function notifyDiamond(text) { notify(text, "diamond"); }
