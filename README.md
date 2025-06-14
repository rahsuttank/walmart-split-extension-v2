# Walmart Order Splitter Chrome Extension

A lightweight Chrome extension that extracts itemized data from your Walmart order page, lets you assign items to friends or participants, calculates individual costs, and exports the results (along with order details) as a CSV file.

---

## Features

- **Automatic Extraction**: Scrapes item names, prices, quantities/weights directly from Walmart order pages.
- **Participant Assignment**: Add participant names, then assign each item (or use an “All” option) via a dropdown of checkboxes.
- **Cost Splitting**: Calculates how much each participant owes based on assigned items.
- **Export to CSV**: Download a detailed CSV containing:
  - Item list with name, price, quantity/weight, and assigned participants
  - Total order amount
  - Split summary per participant
- **Delete Items**: Remove unwanted items before splitting.

---

## Installation

1. Clone or download this repository.
2. Unzip (if necessary) and open Chrome.
3. Navigate to `chrome://extensions`.
4. Enable **Developer mode** (toggle in the top-right).
5. Click **Load unpacked** and select the extension folder.
6. Navigate to a Walmart order details page and click the extension icon to begin.

---

## File Structure

```
walmart-split-extension/
├── manifest.json            # Chrome Extension Manifest (v3)
├── content.js               # Scrapes Walmart order items and sends data
├── popup.html               # Popup UI for participant input & results
├── popup.js                 # Logic for rendering items, splitting, and export
├── styles/
│   └── popup.css            # Popup styling
└── icons/                   # Extension icons (16×16, 48×48, 128×128)
```

---

## Usage

1. **Visit your Walmart order page** (e.g., under Purchase History).
2. Click the extension icon to open the popup.
3. Enter participants as a comma-separated list and click **Assign**.
4. For each item, click **Select participants ▼** and checkboxes appear:
   - **All** to assign to everyone
   - Individual participants
5. The **Split Summary** updates live to show what each owes.
6. Click **Export CSV** to download a file (`walmart-split-<timestamp>.csv`) containing:
   - Detailed item lines
   - Order total
   - Participant summary
7. (Optional) Use the ✕ button next to any item to remove it before splitting.

---

## In-Store Receipts

If you made a purchase directly in a Walmart store and not through the website or app:

1. Open the **Walmart App** on your phone and go to **Receipts**.
2. Tap **Scan Receipt** and follow the prompts to capture your printed receipt.
3. Once scanned, the receipt will appear under **Purchases** in the app.
4. On your desktop, navigate to the **Purchases** section of your Walmart account where your scanned in-store purchases are listed.
5. Open the details for the scanned receipt and then click the **Walmart Order Splitter** extension icon.
6. The extension will scrape the itemized receipt data just like it does for online orders.
7. Proceed with entering participants, assigning items, and exporting the CSV as normal.

---

## Customization

- **Selectors**: If Walmart’s DOM changes, update the selectors in `content.js` to match new `data-testid` or class names.
- **Styling**: Modify `styles/popup.css` or inlined styles in `popup.js`.
- **CSV Format**: Adjust headers or columns in the export handler within `popup.js`.

---

## License

MIT © Tushar Tank

