let items = [];
let participants = [];
let lastAssigned = {};

// Listen for extracted items
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "ITEMS_EXTRACTED") {
    items = msg.payload;
    renderItems();
  }
});

// Inject content script on popup open
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    files: ["content.js"],
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Load participants
  document
    .getElementById("assignBtn")
    .addEventListener("click", loadParticipants);

  // Export CSV
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      // Build CSV rows
      const rows = [];
      // Header for items
      rows.push(["Item", "Price", "Quantity", "Weight", "AssignedTo"]);

      // Per-item rows
      items.forEach((item, idx) => {
        // which boxes are checked?
        const checked = Array.from(
          document.querySelectorAll(
            `input.part-checkbox[data-index="${idx}"]:checked`
          )
        ).map((cb) => cb.value);
        const assignedTo = checked.length
          ? checked.includes("__ALL__")
            ? participants
            : checked
          : [];

        rows.push([
          item.name.replaceAll(",", "."),
          item.price,
          item.quantity || "",
          item.weight || "",
          assignedTo.join("|"),
        ]);
      });

      const totalOrder = items.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
        const qty = item.quantity || 1;
        return sum + (price);
      }, 0);
      rows.push(["Total Order", `$${totalOrder.toFixed(2)}`, "", "", ""]);


      // Blank line, then summary header
      rows.push([]);
      rows.push(["Participant", "Amount"]);

      // Summary rows
      Object.entries(lastAssigned).forEach(([name, total]) => {
        rows.push([name, total.toFixed(2)]);
      });

      // Convert to CSV string
      const csv = rows.map((r) => r.join(",")).join("\n");

      // Trigger download
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      var time = new Date();
      a.download = `walmart-split-${time.getTime()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
});

function loadParticipants() {
  const input = document.getElementById("participantsInput").value.trim();
  participants = input
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p);
  renderItems();
}

function renderItems() {
  const list = document.getElementById("item-list");
  list.innerHTML = "";
  document.getElementById("split-summary").innerHTML = "";

  items.forEach((item, idx) => {
    const li = document.createElement("li");
    li.style.position = "relative";  // to position delete button if you like

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.title = "Remove this item";
    Object.assign(delBtn.style, {
      position: "absolute",
      right: "0",
      top: "0",
      border: "none",
      background: "transparent",
      color: "#900",
      cursor: "pointer",
      fontSize: "1em"
    });
    delBtn.addEventListener("click", () => {
      items.splice(idx, 1);
      renderItems();
      updateSplit();
    });
    li.appendChild(delBtn);

    // Item info
    const info = document.createElement("div");
    info.textContent =
      `${item.name} - ${item.price}` +
      (item.quantity
        ? ` x ${item.quantity}`
        : item.weight
        ? ` - ${item.weight}`
        : "");
    info.style.width = "99%"
    li.appendChild(info);

    // Dropdown container
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";
    Object.assign(dropdown.style, {
      position: "relative",
      display: "inline-block",
      width: "100%",
      marginTop: "5px"
    });

    // Toggle button
    const btn = document.createElement("button");
    btn.textContent = "Select participants";
    btn.type = "button";
    btn.style.width = "100%";
    dropdown.appendChild(btn);

    // Menu
    const menu = document.createElement("div");
    menu.className = "dropdown-menu";
    Object.assign(menu.style, {
      display: "none",
      position: "absolute",
      background: "#fff",
      border: "1px solid #ccc",
      padding: "5px",
      zIndex: "100",
      maxHeight: "150px",
      overflowY: "auto",
      width: "100%"
    });
    dropdown.appendChild(menu);

    btn.addEventListener("click", () => {
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // "All" checkbox
    const allLbl = document.createElement("label");
    const allCb = document.createElement("input");
    allCb.type = "checkbox";
    allCb.dataset.index = idx;
    allCb.addEventListener("change", e => {
      const checked = e.target.checked;
      menu
        .querySelectorAll(`input.part-checkbox[data-index="${idx}"]`)
        .forEach(cb => (cb.checked = checked));
      updateSplit();
      info.style.fontWeight = "bold";
    });
    allLbl.appendChild(allCb);
    allLbl.append(" All");
    menu.appendChild(allLbl);
    menu.appendChild(document.createElement("hr"));

    // Participant checkboxes
    participants.forEach(p => {
      const lbl = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "part-checkbox";
      cb.dataset.index = idx;
      cb.value = p;
      cb.addEventListener("change", () => {
        // sync "All" if needed
        const allChecked = Array.from(
          menu.querySelectorAll(`input.part-checkbox[data-index="${idx}"]`)
        ).every(c => c.checked);
        allCb.checked = allChecked;
        updateSplit();
        info.style.fontWeight = "bold";
      });
      lbl.appendChild(cb);
      lbl.append(` ${p}`);
      menu.appendChild(lbl);
    });

    li.appendChild(dropdown);
    list.appendChild(li);
  });
}


function updateSplit() {
  const assigned = {};
  participants.forEach((p) => (assigned[p] = 0));

  items.forEach((item, idx) => {
    const checked = Array.from(
      document.querySelectorAll(
        `input.part-checkbox[data-index="${idx}"]:checked`
      )
    ).map((cb) => cb.value);
    if (!checked.length) return;

    const users = checked.includes("__ALL__") ? participants : checked;
    const price = parseFloat(item.price.replace(/[^\d.]/g, "")) || 0;
    const share = price / users.length;

    users.forEach((u) => (assigned[u] += share));
  });

  lastAssigned = assigned;

  // render summary
  const summary = document.getElementById("split-summary");
  summary.innerHTML = "<h3>Split Summary</h3>";
  Object.entries(assigned).forEach(([name, total]) => {
    const p = document.createElement("p");
    p.textContent = `${name} owes $${total.toFixed(2)}`;
    summary.appendChild(p);
  });
}
