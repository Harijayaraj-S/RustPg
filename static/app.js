require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } });

require(['vs/editor/editor.main'], function () {
    window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: "-- Write your SQL here",
        language: "sql",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false }
    });
});


async function fetchConfigs() {
    const res = await fetch("/config/list");
    const configs = await res.json();

    const list = document.getElementById("config-list");
    const select = document.getElementById("db-select");
    list.innerHTML = "";
    select.innerHTML = "";

    configs.forEach((cfg, index) => {
        const li = document.createElement("li");
        li.innerText = cfg.name + ": " + cfg.url;
        list.appendChild(li);

        const option = document.createElement("option");
        option.value = cfg.name;
        option.innerText = cfg.name;
        select.appendChild(option);
    });
}

async function addConfig() {
    const url = document.getElementById("db-url").value;
    const name = document.getElementById("db-name").value;
    if (!name) {
        showToast("❌ Please enter a database name", 3000);
        return;
    }

    if (!url) {
        showToast("❌ Please enter a database URL", 3000);
        return;
    }

    try {
        const response = await fetch("/config/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, url }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} ${errorText}`);
        }

        await fetchConfigs(); // Refresh the list
        showToast("✅ Database config added!");
    } catch (error) {
        console.error("Failed to add config:", error);
        showToast("❌ Failed to add config", 4000);
    }
}


async function executeQuery() {
    const dbName = document.getElementById("db-select").value;
    const sql = window.editor.getValue();
    const res = await fetch("/execute", {
        method: "POST",
        body: JSON.stringify({ db_name: dbName, query: sql }),
        headers: { "Content-Type": "application/json" }
    });
    const data = await res.json();
    document.getElementById("query-result").innerText = JSON.stringify(data, null, 2);
    await fetchHistory();
}

async function fetchHistory() {
    const res = await fetch("/history");
    const history = await res.json();

    const list = document.getElementById("history-list");
    list.innerHTML = "";
    history.forEach(h => {
        const li = document.createElement("li");
        li.innerText = `[${h.db_name}] ${h.query} → ${h.result}`;
        list.appendChild(li);
    });
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration); // Make sure the duration is long enough to allow the transition
}



fetchConfigs();
fetchHistory();
