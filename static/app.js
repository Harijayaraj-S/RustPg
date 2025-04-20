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
        // Create Bootstrap list group item
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-dark d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <div>
                <strong>${cfg.name}</strong>
                <br>
                <small class="text-muted">${cfg.url}</small>
            </div>
        `;
        list.appendChild(li);

        // Add to dropdown
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
        showToast("❌ Please enter a database name");
        return;
    }

    if (!url) {
        showToast("❌ Please enter a database URL");
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
        showToast("❌ Failed to add config");
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

    history.forEach((h, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-dark";
        li.innerHTML = `
            <div class="mb-1"><strong>[${h.db_name}]</strong></div>
            <div><code>${h.query}</code></div>
            <div class="text-success small mt-1">→ ${h.result}</div>
        `;
        list.appendChild(li);
    });
}

function showToast(message) {
    const toastMsg = document.getElementById("toast-msg");
    toastMsg.innerText = message;

    const toastEl = document.getElementById("liveToast");
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3000 });
    bsToast.show();
}


fetchConfigs();
fetchHistory();
