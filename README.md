# Invoice Studio (Offline Edition)

A 100% offline, standalone Invoice Maker application. No internet connection, server, or database installation required.

---

## How to Open the App

You can open the application in any of the following ways:

### Method 1: Directly from your Desktop (Easiest)
- Go to your computer's **Desktop** and double-click the **`Invoice Studio`** shortcut icon.
- This will launch Invoice Studio immediately in a native-feeling, standalone desktop app window!

### Method 2: Launch from this Folder
- **Double-click `Launch-Invoice-App.vbs`** or **`Launch-Invoice-Maker.bat`** inside this folder.
- If you ever need to re-create the Desktop shortcut, just double-click **`create_shortcut.vbs`**.

### Method 3: Open in Any Web Browser
- Double-click **`index.html`** to open it in Chrome, Edge, Firefox, or any browser of your choice.

---

## Features & Enhancements

1. **100% Offline Standalone**
   - All PDF rendering engines (`libs/html2pdf.bundle.min.js`, `libs/jspdf.umd.min.js`) are bundled locally.
   - Zero external font, CSS, or script dependencies.

2. **Company / Business Branding**
   - Add your business name, address, email, phone, and Tax ID / GSTIN / VAT.
   - **Logo Upload**: Upload your company logo image (automatically converted and stored offline).

3. **Client & Invoice Management**
   - Custom Invoice Numbering (auto-increments on new invoice).
   - Issue Date & Due Date tracking.
   - Status badge toggle (`UNPAID`, `PAID`, `PENDING`, `DRAFT`).
   - Multi-currency support ($, €, £, ₹, ¥, C$, A$, AED, CHF, or custom symbols).

4. **Dynamic Line Items**
   - Add as many items as needed.
   - Real-time row total calculations.
   - Delete button for each line item.

5. **Financial Adjustments**
   - Simple & Professional modes.
   - Tax rate percentage (auto-calculates tax amount).
   - Discount percentage (auto-calculates savings).
   - Extra shipping / delivery fee support.

6. **Payment Info & Notes**
   - Add custom terms, notes, and bank account / wire transfer / UPI details.

7. **Real-time Live Preview & High-Fidelity Output**
   - Split-screen interface: see the invoice update in real-time as you type.
   - **PDF Export**: Generates high-resolution PDF invoices locally.
   - **Print**: Formatted for standard A4 / Letter paper with clean print stylesheets.

8. **Offline Storage & Invoice History**
   - **Auto-save draft**: Your current progress is saved in local browser storage so you never lose work on refresh.
   - **Save to History**: Save multiple invoices offline.
   - **History Drawer**: Re-open, view, or delete past invoices anytime.

9. **Dark & Light Mode**
   - Seamless one-click dark mode toggle (with your preference remembered).
