/* ==========================================================================
   Invoice Studio - Core Offline Application Logic
   ========================================================================== */

let currentMode = 'simple';
let uploadedLogoData = null;
let itemIdCounter = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDefaults();
  loadDraftOrSample();
  updateHistoryBadge();
});

// Set default dates
function initDefaults() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('invoiceDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = today;
  }

  // Due date: default 14 days from today
  const dueDateInput = document.getElementById('dueDate');
  if (dueDateInput && !dueDateInput.value) {
    const due = new Date();
    due.setDate(due.getDate() + 14);
    dueDateInput.value = due.toISOString().split('T')[0];
  }
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
  const savedTheme = localStorage.getItem('invoice_maker_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeToggleBtn').textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('invoice_maker_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
}

// ==========================================================================
// Mode Switching (Simple vs Professional)
// ==========================================================================

function setMode(mode) {
  currentMode = mode;
  document.getElementById('btn-mode-simple').classList.toggle('active', mode === 'simple');
  document.getElementById('btn-mode-pro').classList.toggle('active', mode === 'professional');

  const taxGroup = document.getElementById('taxGroup');
  const discountGroup = document.getElementById('discountGroup');
  const shippingGroup = document.getElementById('shippingGroup');
  const bankGroup = document.getElementById('bankGroup');

  if (mode === 'simple') {
    if (taxGroup) taxGroup.style.display = 'none';
    if (discountGroup) discountGroup.style.display = 'none';
    if (shippingGroup) shippingGroup.style.display = 'none';
    if (bankGroup) bankGroup.style.display = 'none';
  } else {
    if (taxGroup) taxGroup.style.display = 'flex';
    if (discountGroup) discountGroup.style.display = 'flex';
    if (shippingGroup) shippingGroup.style.display = 'flex';
    if (bankGroup) bankGroup.style.display = 'block';
  }

  onInputChange();
}

// ==========================================================================
// Item Row Management
// ==========================================================================

function addItem(desc = '', qty = 1, price = 0) {
  const container = document.getElementById('items-container');
  itemIdCounter++;
  const rowId = `item-row-${itemIdCounter}`;

  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = rowId;
  row.innerHTML = `
    <input type="text" class="item-desc col-desc" placeholder="Item name or service description" value="${escapeHtml(desc)}" oninput="onInputChange()" />
    <input type="number" class="item-qty col-qty" min="0" step="any" placeholder="1" value="${qty}" oninput="onInputChange()" />
    <input type="number" class="item-price col-price" min="0" step="any" placeholder="0.00" value="${price}" oninput="onInputChange()" />
    <span class="item-total-cell col-total">$0.00</span>
    <button type="button" class="btn-remove-row col-del" onclick="removeItem('${rowId}')" title="Delete item">🗑️</button>
  `;

  container.appendChild(row);
  onInputChange();
}

function removeItem(rowId) {
  const row = document.getElementById(rowId);
  if (row) {
    row.remove();
    // Keep at least one row if empty
    const rows = document.querySelectorAll('.item-row');
    if (rows.length === 0) {
      addItem('', 1, 0);
    } else {
      onInputChange();
    }
  }
}

// ==========================================================================
// Logo Upload Handling
// ==========================================================================

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedLogoData = e.target.result;
    displayLogo(uploadedLogoData);
    onInputChange();
  };
  reader.readAsDataURL(file);
}

function displayLogo(dataUrl) {
  const previewBox = document.getElementById('logo-preview-container');
  const previewImg = document.getElementById('logo-preview-img');
  const sheetLogoWrapper = document.getElementById('preview-logo-wrapper');
  const sheetLogoImg = document.getElementById('preview-logo-img');

  if (dataUrl) {
    previewImg.src = dataUrl;
    previewBox.style.display = 'flex';
    sheetLogoImg.src = dataUrl;
    sheetLogoWrapper.style.display = 'block';
  } else {
    previewBox.style.display = 'none';
    previewImg.src = '';
    sheetLogoWrapper.style.display = 'none';
    sheetLogoImg.src = '';
  }
}

function removeLogo() {
  uploadedLogoData = null;
  document.getElementById('logoInput').value = '';
  displayLogo(null);
  onInputChange();
}

// ==========================================================================
// Currency Helper
// ==========================================================================

function getCurrencySymbol() {
  const select = document.getElementById('currencySelect');
  const customBox = document.getElementById('customCurrencyBox');
  if (select.value === 'custom') {
    customBox.style.display = 'flex';
    const customVal = document.getElementById('customCurrency').value.trim();
    return customVal || '$';
  } else {
    customBox.style.display = 'none';
    return select.value || '$';
  }
}

function formatCurrency(amount, symbol) {
  const sym = symbol !== undefined ? symbol : getCurrencySymbol();
  const num = isNaN(amount) ? 0 : amount;
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ==========================================================================
// Real-time Preview & Calculations
// ==========================================================================

function onInputChange() {
  const currency = getCurrencySymbol();

  // 1. Company Info
  const companyName = document.getElementById('companyName').value.trim() || 'Your Company Name';
  const companyTaxId = document.getElementById('companyTaxId').value.trim();
  const companyEmail = document.getElementById('companyEmail').value.trim();
  const companyPhone = document.getElementById('companyPhone').value.trim();
  const companyAddress = document.getElementById('companyAddress').value.trim();

  document.getElementById('preview-company-name').textContent = companyName;

  let detailsText = '';
  if (companyAddress) detailsText += companyAddress + '\n';
  const contactParts = [];
  if (companyEmail) contactParts.push(companyEmail);
  if (companyPhone) contactParts.push(companyPhone);
  if (contactParts.length) detailsText += contactParts.join(' | ');

  document.getElementById('preview-company-details').textContent = detailsText || '123 Business St, Suite 100\nCity, State, ZIP\nbilling@yourbiz.com | +1 (555) 000-0000';

  const taxEl = document.getElementById('preview-company-tax');
  if (companyTaxId) {
    taxEl.textContent = `Tax ID / VAT: ${companyTaxId}`;
    taxEl.style.display = 'block';
  } else {
    taxEl.style.display = 'none';
  }

  // 2. Invoice Meta
  const invNumber = document.getElementById('invoiceNumber').value.trim() || 'INV-001';
  const invDate = document.getElementById('invoiceDate').value || '-';
  const dueDate = document.getElementById('dueDate').value || '';
  const status = document.getElementById('invoiceStatus').value;

  document.getElementById('preview-inv-number').textContent = invNumber;
  document.getElementById('preview-inv-date').textContent = invDate;

  const dueRow = document.getElementById('preview-due-row');
  if (dueDate) {
    dueRow.style.display = 'table-row';
    document.getElementById('preview-inv-due').textContent = dueDate;
  } else {
    dueRow.style.display = 'none';
  }

  const badge = document.getElementById('preview-status-badge');
  badge.textContent = status;
  badge.className = `status-badge status-${status.toLowerCase()}`;

  // 3. Customer Info
  const custName = document.getElementById('customerName').value.trim() || 'Customer / Client Name';
  const custAddress = document.getElementById('customerAddress').value.trim();
  const custEmail = document.getElementById('customerEmail').value.trim();
  const custPhone = document.getElementById('customerPhone').value.trim();

  document.getElementById('preview-customer-name').textContent = custName;
  document.getElementById('preview-customer-address').textContent = custAddress || 'Client Address...';

  const custContactParts = [];
  if (custEmail) custContactParts.push(custEmail);
  if (custPhone) custContactParts.push(custPhone);
  document.getElementById('preview-customer-contact').textContent = custContactParts.join(' | ');

  // 4. Line Items & Calculations
  const itemRows = document.querySelectorAll('.item-row');
  const previewItemsBody = document.getElementById('preview-items-body');
  previewItemsBody.innerHTML = '';

  let subtotal = 0;
  let itemIndex = 1;

  itemRows.forEach(row => {
    const desc = row.querySelector('.item-desc').value.trim() || 'Item description';
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const itemTotal = qty * price;
    subtotal += itemTotal;

    // Update row total cell in editor
    row.querySelector('.item-total-cell').textContent = formatCurrency(itemTotal, currency);

    // Append to live preview sheet table
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-num">${itemIndex++}</td>
      <td class="td-desc">${escapeHtml(desc)}</td>
      <td class="td-qty">${qty}</td>
      <td class="td-price">${formatCurrency(price, currency)}</td>
      <td class="td-total">${formatCurrency(itemTotal, currency)}</td>
    `;
    previewItemsBody.appendChild(tr);
  });

  // 5. Taxes, Discounts, Fees
  let discountAmount = 0;
  let taxAmount = 0;
  let shippingFee = 0;

  if (currentMode === 'professional') {
    const discountPct = parseFloat(document.getElementById('discountPercent').value) || 0;
    const taxPct = parseFloat(document.getElementById('taxPercent').value) || 0;
    shippingFee = parseFloat(document.getElementById('shippingFee').value) || 0;

    if (discountPct > 0) {
      discountAmount = subtotal * (discountPct / 100);
      document.getElementById('preview-discount-pct').textContent = discountPct;
      document.getElementById('preview-discount-amount').textContent = `-${formatCurrency(discountAmount, currency)}`;
      document.getElementById('preview-discount-row').style.display = 'table-row';
    } else {
      document.getElementById('preview-discount-row').style.display = 'none';
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);

    if (taxPct > 0) {
      taxAmount = taxableAmount * (taxPct / 100);
      document.getElementById('preview-tax-pct').textContent = taxPct;
      document.getElementById('preview-tax-amount').textContent = `+${formatCurrency(taxAmount, currency)}`;
      document.getElementById('preview-tax-row').style.display = 'table-row';
    } else {
      document.getElementById('preview-tax-row').style.display = 'none';
    }

    if (shippingFee > 0) {
      document.getElementById('preview-shipping-amount').textContent = `+${formatCurrency(shippingFee, currency)}`;
      document.getElementById('preview-shipping-row').style.display = 'table-row';
    } else {
      document.getElementById('preview-shipping-row').style.display = 'none';
    }
  } else {
    document.getElementById('preview-discount-row').style.display = 'none';
    document.getElementById('preview-tax-row').style.display = 'none';
    document.getElementById('preview-shipping-row').style.display = 'none';
  }

  const grandTotal = subtotal - discountAmount + taxAmount + shippingFee;

  document.getElementById('preview-subtotal').textContent = formatCurrency(subtotal, currency);
  document.getElementById('preview-grand-total').innerHTML = `<strong>${formatCurrency(grandTotal, currency)}</strong>`;

  // 6. Notes & Bank Details
  const notes = document.getElementById('invoiceNotes').value.trim();
  const bankDetails = document.getElementById('bankDetails').value.trim();

  const notesBlock = document.getElementById('preview-notes-block');
  if (notes) {
    document.getElementById('preview-notes-text').textContent = notes;
    notesBlock.style.display = 'block';
  } else {
    notesBlock.style.display = 'none';
  }

  const bankBlock = document.getElementById('preview-bank-block');
  if (bankDetails && currentMode === 'professional') {
    document.getElementById('preview-bank-text').textContent = bankDetails;
    bankBlock.style.display = 'block';
  } else {
    bankBlock.style.display = 'none';
  }

  // 7. Auto-save draft in localStorage
  saveDraftToLocalStorage();
}

// ==========================================================================
// Export to Offline PDF & Print
// ==========================================================================

function downloadPDF() {
  const element = document.getElementById('invoice-sheet');
  const invNumber = document.getElementById('invoiceNumber').value.trim() || 'invoice';
  const cleanInvNumber = invNumber.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (typeof html2pdf === 'function') {
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${cleanInvNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  } else {
    // Graceful fallback to print preview
    window.print();
  }
}

function printInvoice() {
  window.print();
}

// ==========================================================================
// Offline Storage (Drafts & Saved Invoices History)
// ==========================================================================

function getFormData() {
  const items = [];
  document.querySelectorAll('.item-row').forEach(row => {
    items.push({
      desc: row.querySelector('.item-desc').value,
      qty: row.querySelector('.item-qty').value,
      price: row.querySelector('.item-price').value
    });
  });

  return {
    mode: currentMode,
    company: {
      name: document.getElementById('companyName').value,
      taxId: document.getElementById('companyTaxId').value,
      email: document.getElementById('companyEmail').value,
      phone: document.getElementById('companyPhone').value,
      address: document.getElementById('companyAddress').value,
      logo: uploadedLogoData
    },
    meta: {
      number: document.getElementById('invoiceNumber').value,
      currency: document.getElementById('currencySelect').value,
      customCurrency: document.getElementById('customCurrency').value,
      date: document.getElementById('invoiceDate').value,
      dueDate: document.getElementById('dueDate').value,
      status: document.getElementById('invoiceStatus').value
    },
    client: {
      name: document.getElementById('customerName').value,
      email: document.getElementById('customerEmail').value,
      phone: document.getElementById('customerPhone').value,
      address: document.getElementById('customerAddress').value
    },
    items: items,
    adjustments: {
      taxPct: document.getElementById('taxPercent').value,
      discountPct: document.getElementById('discountPercent').value,
      shipping: document.getElementById('shippingFee').value
    },
    notes: {
      general: document.getElementById('invoiceNotes').value,
      bank: document.getElementById('bankDetails').value
    },
    savedAt: new Date().toISOString()
  };
}

function restoreFormData(data) {
  if (!data) return;

  if (data.mode) setMode(data.mode);

  if (data.company) {
    document.getElementById('companyName').value = data.company.name || '';
    document.getElementById('companyTaxId').value = data.company.taxId || '';
    document.getElementById('companyEmail').value = data.company.email || '';
    document.getElementById('companyPhone').value = data.company.phone || '';
    document.getElementById('companyAddress').value = data.company.address || '';
    if (data.company.logo) {
      uploadedLogoData = data.company.logo;
      displayLogo(uploadedLogoData);
    } else {
      removeLogo();
    }
  }

  if (data.meta) {
    document.getElementById('invoiceNumber').value = data.meta.number || 'INV-001';
    document.getElementById('currencySelect').value = data.meta.currency || '$';
    document.getElementById('customCurrency').value = data.meta.customCurrency || '';
    document.getElementById('invoiceDate').value = data.meta.date || '';
    document.getElementById('dueDate').value = data.meta.dueDate || '';
    document.getElementById('invoiceStatus').value = data.meta.status || 'UNPAID';
  }

  if (data.client) {
    document.getElementById('customerName').value = data.client.name || '';
    document.getElementById('customerEmail').value = data.client.email || '';
    document.getElementById('customerPhone').value = data.client.phone || '';
    document.getElementById('customerAddress').value = data.client.address || '';
  }

  // Items
  const itemsContainer = document.getElementById('items-container');
  itemsContainer.innerHTML = '';
  if (data.items && data.items.length > 0) {
    data.items.forEach(it => addItem(it.desc, it.qty, it.price));
  } else {
    addItem('', 1, 0);
  }

  if (data.adjustments) {
    document.getElementById('taxPercent').value = data.adjustments.taxPct || '';
    document.getElementById('discountPercent').value = data.adjustments.discountPct || '';
    document.getElementById('shippingFee').value = data.adjustments.shipping || '';
  }

  if (data.notes) {
    document.getElementById('invoiceNotes').value = data.notes.general || '';
    document.getElementById('bankDetails').value = data.notes.bank || '';
  }

  onInputChange();
}

function saveDraftToLocalStorage() {
  try {
    const data = getFormData();
    localStorage.setItem('invoice_studio_current_draft', JSON.stringify(data));
  } catch (err) {
    console.warn('Could not auto-save draft to localStorage (quota exceeded or disabled):', err);
  }
}

function loadDraftOrSample() {
  const savedDraft = localStorage.getItem('invoice_studio_current_draft');
  if (savedDraft) {
    try {
      const data = JSON.parse(savedDraft);
      restoreFormData(data);
      return;
    } catch (e) {
      console.warn('Failed to parse draft from localStorage:', e);
    }
  }

  // Load sample default
  addItem('Web Design & Development', 1, 1200);
  addItem('Cloud Server Setup & Migration', 5, 80);
  setMode('professional');
  document.getElementById('taxPercent').value = '10';
  document.getElementById('discountPercent').value = '5';
  onInputChange();
}

function newInvoice() {
  if (confirm('Start a fresh invoice? (Your previous invoice will be saved if you saved it to history)')) {
    // Generate next invoice number if possible
    const currentNum = document.getElementById('invoiceNumber').value;
    const match = currentNum.match(/^(.*?)(\d+)$/);
    let nextNum = 'INV-001';
    if (match) {
      const prefix = match[1];
      const digits = parseInt(match[2], 10) + 1;
      nextNum = `${prefix}${String(digits).padStart(match[2].length, '0')}`;
    }

    document.getElementById('invoiceNumber').value = nextNum;
    initDefaults();
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';

    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = '';
    addItem('', 1, 0);

    document.getElementById('taxPercent').value = '';
    document.getElementById('discountPercent').value = '';
    document.getElementById('shippingFee').value = '';

    onInputChange();
  }
}

// ==========================================================================
// Invoices History Modal
// ==========================================================================

function getHistory() {
  try {
    const list = localStorage.getItem('invoice_studio_history');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

function saveHistory(list) {
  try {
    localStorage.setItem('invoice_studio_history', JSON.stringify(list));
    updateHistoryBadge();
  } catch (e) {
    alert('Failed to save to local storage: storage quota exceeded.');
  }
}

function updateHistoryBadge() {
  const history = getHistory();
  const badge = document.getElementById('history-count');
  if (badge) badge.textContent = history.length;
}

function saveInvoiceToHistory() {
  const data = getFormData();
  const invNumber = data.meta.number || 'INV-UNNAMED';
  const history = getHistory();

  // Find if already exists in history to update, or prepend new
  const existingIdx = history.findIndex(h => h.meta.number === invNumber);
  if (existingIdx !== -1) {
    if (confirm(`Invoice ${invNumber} already exists in history. Overwrite it?`)) {
      history[existingIdx] = data;
      saveHistory(history);
      alert(`Invoice ${invNumber} updated in history!`);
    }
  } else {
    history.unshift(data);
    saveHistory(history);
    alert(`Invoice ${invNumber} saved to offline history!`);
  }
}

function openHistoryModal() {
  const history = getHistory();
  const container = document.getElementById('historyListContainer');
  container.innerHTML = '';

  if (history.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 24px;">No saved invoices yet. Click "💾 Save" to save your invoices offline.</p>';
  } else {
    history.forEach((inv, index) => {
      const card = document.createElement('div');
      card.className = 'history-item-card';

      const totalItems = inv.items ? inv.items.length : 0;
      const currency = inv.meta.currency || '$';
      const cust = inv.client.name || 'Unnamed Client';
      const date = inv.meta.date || 'No Date';
      const num = inv.meta.number || 'INV';
      const status = inv.meta.status || 'UNPAID';

      card.innerHTML = `
        <div class="history-item-info">
          <h4>${escapeHtml(num)} — ${escapeHtml(cust)}</h4>
          <p>Date: ${date} • ${totalItems} item(s) • Status: <strong>${status}</strong></p>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn btn-sm btn-primary" onclick="loadInvoiceFromHistory(${index})">Load</button>
          <button type="button" class="btn btn-sm btn-text-danger" onclick="deleteInvoiceFromHistory(${index})">Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  document.getElementById('historyModal').style.display = 'flex';
}

function closeHistoryModal() {
  document.getElementById('historyModal').style.display = 'none';
}

function closeHistoryModalOnBackdrop(event) {
  if (event.target.id === 'historyModal') {
    closeHistoryModal();
  }
}

function loadInvoiceFromHistory(index) {
  const history = getHistory();
  const item = history[index];
  if (item) {
    restoreFormData(item);
    closeHistoryModal();
  }
}

function deleteInvoiceFromHistory(index) {
  const history = getHistory();
  if (confirm('Are you sure you want to delete this invoice from offline history?')) {
    history.splice(index, 1);
    saveHistory(history);
    openHistoryModal(); // re-render list
  }
}

// Utility: escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
