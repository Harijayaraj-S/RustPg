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
    const name = "db_" + Math.floor(Math.random() * 1000);
    await fetch("/config/add", {
        method: "POST",
        body: JSON.stringify({ name, db_url }),
        headers: { "Content-Type": "application/json" }
    });
    await fetchConfigs();
}

async function executeQuery() {
    const dbName = document.getElementById("db-select").value;
    const sql = document.getElementById("sql-input").value;
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

fetchConfigs();
fetchHistory();
