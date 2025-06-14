function extractItems() {
  const itemNodes = document.querySelectorAll('div[data-testid="itemtile-stack"]');

  const items = Array.from(itemNodes).map(node => {
    const name = node.querySelector('div[data-testid="productName"] span')?.textContent?.trim() || "Unknown item";
    const price = node.querySelector('div[data-testid="line-price"] span')?.textContent?.trim() || "$0.00";

    const qtyOrWeightNode = Array.from(node.querySelectorAll("div")).find(div =>
      div.textContent?.trim().match(/^(Qty|Wt)\s+/i)
    );
    const qtyOrWeightText = qtyOrWeightNode?.textContent?.trim() || "";

    let quantity = null;
    let weight = null;

    if (/^Qty\s+/i.test(qtyOrWeightText)) {
      quantity = parseInt(qtyOrWeightText.replace(/[^0-9]/g, ""), 10) || 1;
    } else if (/^Wt\s+/i.test(qtyOrWeightText)) {
      weight = qtyOrWeightText.replace(/^Wt\s+/i, "").trim(); // e.g., "1.76 lb"
    }

    return { name, price, quantity, weight };
  });

  chrome.runtime.sendMessage({ type: "ITEMS_EXTRACTED", payload: items });
}

extractItems();
