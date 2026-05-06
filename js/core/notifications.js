function notify(text) {

    const notifications =
        document.getElementById("notifications");

    let div = document.createElement("div");

    div.className = "toast";
    div.innerText = text;

    notifications.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}