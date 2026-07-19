// Global Workspace Storage Arrays
let queue = [];
let totalOriginalBytes = 0;
let totalProcessedBytes = 0;
let currentActiveCompareItem = null;
let isProcessingActive = false;

// Target elements directly from the structural layout model
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const clearQueueBtn = document.getElementById('clear-queue-btn');
const bulkFormat = document.getElementById('bulk-format');
const bulkQuality = document.getElementById('bulk-quality');
const bulkScale = document.getElementById('bulk-scale');
const applyBulkBtn = document.getElementById('apply-bulk-btn');
const processAllBtn = document.getElementById('process-all-btn');
const zipBtn = document.getElementById('zip-btn');
const closeModalBtn1 = document.getElementById('close-modal-btn-1');
const closeModalBtn2 = document.getElementById('close-modal-btn-2');
const compareSlider = document.getElementById('compare-slider');
const queueList = document.getElementById('queue-list');

// File selection hook router
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
      e.target.value = ''; 
    }
  });
}

// Drag and drop parameters configuration hooks
if (dropZone) {
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#C5A059';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.style.borderColor = '#3f3f46';
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files.length > 0) {
      processIncomingFiles(dt.files);
    }
  }, false);
}

// Sliders numeric synchronization handles
const updateBulkSettings = () => {
  if (bulkQuality) document.getElementById('bulk-quality-label').innerText = bulkQuality.value + '%';
  if (bulkScale) document.getElementById('bulk-scale-label').innerText = bulkScale.value + '%';
};

if (bulkFormat) bulkFormat.addEventListener('change', updateBulkSettings);
if (bulkQuality) bulkQuality.addEventListener('input', updateBulkSettings);
if (bulkScale) bulkScale.addEventListener('input', updateBulkSettings);

if (applyBulkBtn) applyBulkBtn.addEventListener('click', applyBulkToQueue);
if (clearQueueBtn) clearQueueBtn.addEventListener('click', clearQueue);
if (processAllBtn) processAllBtn.addEventListener('click', processAll);
if (zipBtn) zipBtn.addEventListener('click', downloadAllZip);

if (closeModalBtn1) closeModalBtn1.addEventListener('click', closeCompareModal);
if (closeModalBtn2) closeModalBtn2.addEventListener('click', closeCompareModal);
if (compareSlider) {
  compareSlider.addEventListener('input', (e) => handleCompareSlider(e.target.value));
}

// Dynamic elements row event delegate mapper
if (queueList) {
  queueList.addEventListener('change', (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    if (target.classList.contains('item-format')) {
      updateItemSettings(id, 'format', target.value);
    } else if (target.classList.contains('item-quality')) {
      updateItemSettings(id, 'quality', target.value);
    } else if (target.classList.contains('item-scale')) {
      updateItemSettings(id, 'scale', target.value);
    }
  });
  
  queueList.addEventListener('click', (e) => {
    const auditBtn = e.target.closest('.btn-audit-trigger');
    if (auditBtn) {
      launchVisualAuditModal(auditBtn.dataset.id);
    }
  });
}

function processIncomingFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (!file.type.startsWith('image/')) return;

    const id = 'asset_' + Math.random().toString(36).substr(2, 9);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;

      const item = {
        id: id,
        file: file,
        name: file.name,
        originalSize: file.size,
        format: document.getElementById('bulk-format')?.value || 'webp',
        quality: parseInt(document.getElementById('bulk-quality')?.value || '80'),
        scale: parseInt(document.getElementById('bulk-scale')?.value || '100'),
        status: 'pending',
        previewUrl: dataUrl, 
        processedUrl: null,
        processedSize: 0,
        width: 0,
        height: 0
      };

      queue.push(item);
      renderQueue();
      updateDashboardUI();

      const img = new Image();
      img.onload = () => {
        item.width = img.naturalWidth;
        item.height = img.naturalHeight;
        const specsEl = document.getElementById(`specs-${item.id}`);
        if (specsEl) {
          specsEl.innerText = `${item.width}x${item.height}px | ${(item.originalSize / 1024).toFixed(1)} KB`;
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function applyBulkToQueue() {
  const format = document.getElementById('bulk-format').value;
  const quality = parseInt(document.getElementById('bulk-quality').value);
  const scale = parseInt(document.getElementById('bulk-scale').value);

  queue.forEach(item => {
    if (item.status !== 'done' && item.status !== 'processing') {
      item.format = format;
      item.quality = quality;
      item.scale = scale;
      
      const fEl = document.getElementById(`fmt-${item.id}`);
      const qEl = document.getElementById(`qlt-${item.id}`);
      const sEl = document.getElementById(`scl-${item.id}`);
      
      if (fEl) fEl.value = format;
      if (qEl) qEl.value = quality;
      if (sEl) sEl.value = scale;
    }
  });
  showBannerAlert("Bulk parameters loaded into items.");
}

function updateItemSettings(id, key, value) {
  const item = queue.find(x => x.id === id);
  if (item) {
    item[key] = (key === 'format') ? value : parseInt(value);
  }
}

function renderQueue() {
  const queueSection = document.getElementById('queue-section');
  if (queue.length === 0) {
    queueSection.classList.add('hidden');
    queueList.innerHTML = '';
    return;
  }

  queueSection.classList.remove('hidden');
  queueList.innerHTML = queue.map(item => {
    const sizeKB = (item.originalSize / 1024).toFixed(1) + ' KB';
    const specLabel = item.width > 0 ? `${item.width}x${item.height}px | ${sizeKB}` : `Processing Specs... | ${sizeKB}`;
    
    return `
      <div class="queue-card" id="card-${item.id}">
        <div class="queue-row">
          <div class="preview-box">
            <img src="${item.previewUrl}" alt="Thumbnail preview">
            <div id="status-icon-${item.id}"></div>
          </div>
          
          <div class="meta-area">
            <div class="meta-top">
              <span class="meta-filename" title="${item.name}">${item.name}</span>
              <span class="meta-specs" id="specs-${item.id}">${specLabel}</span>
            </div>
            
            <div class="controls-grid" id="controls-${item.id}">
              <div class="input-wrapper">
                <label>Format</label>
                <select id="fmt-${item.id}" data-id="${item.id}" class="item-format">
                  <option value="webp" ${item.format === 'webp' ? 'selected' : ''}>WEBP</option>
                  <option value="jpeg" ${item.format === 'jpeg' ? 'selected' : ''}>JPEG</option>
                  <option value="png" ${item.format === 'png' ? 'selected' : ''}>PNG</option>
                </select>
              </div>
              
              <div class="input-wrapper">
                <label>Quality</label>
                <input type="number" id="qlt-${item.id}" data-id="${item.id}" class="item-quality" min="10" max="100" value="${item.quality}">
              </div>
              
              <div class="input-wrapper">
                <label>Scale (%)</label>
                <input type="number" id="scl-${item.id}" data-id="${item.id}" class="item-scale" min="10" max="100" value="${item.scale}">
              </div>
            </div>
            
            <div id="progress-wrapper-${item.id}" class="hidden">
              <div class="loading-track"><div id="bar-${item.id}" class="loading-fill"></div></div>
            </div>
            
            <div id="result-badge-${item.id}" class="done-badge hidden"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  queue.forEach(item => {
    if (item.status === 'done') { finalizeItemUI(item); }
  });
}

async function compressImage(item) {
  return new Promise((resolve) => {
    item.status = 'processing';
    const controls = document.getElementById(`controls-${item.id}`);
    const progress = document.getElementById(`progress-wrapper-${item.id}`);
    const bar = document.getElementById('bar-' + item.id);
    
    if (controls) controls.classList.add('hidden');
    if (progress) progress.classList.remove('hidden');
    if (bar) bar.style.width = '45%';
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scaleFactor = item.scale / 100;
        const targetWidth = Math.max(1, Math.round((img.naturalWidth || 800) * scaleFactor));
        const targetHeight = Math.max(1, Math.round((img.naturalHeight || 600) * scaleFactor));
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        let mimeType = 'image/webp';
        if (item.format === 'jpeg') mimeType = 'image/jpeg';
        if (item.format === 'png') mimeType = 'image/png';
        
        const encoderQuality = item.quality / 100;
        if (bar) bar.style.width = '80%';
        
        const dataUrl = canvas.toDataURL(mimeType, encoderQuality);
        
        let stringLength = 0;
        if (dataUrl && dataUrl.includes(',')) {
          stringLength = dataUrl.split(',')[1].length;
        }
        item.processedSize = Math.round(stringLength * 0.75) || item.originalSize;
        item.processedUrl = dataUrl;
        item.status = 'done';
        
        if (bar) bar.style.width = '100%';
        finalizeItemUI(item);
      } catch (err) {
        item.status = 'error';
      } finally {
        resolve();
      }
    };
    img.onerror = () => { item.status = 'error'; resolve(); };
    img.src = item.previewUrl;
  });
}

function finalizeItemUI(item) {
  const progressWrap = document.getElementById(`progress-wrapper-${item.id}`);
  if (progressWrap) progressWrap.classList.add('hidden');
  
  const statusIcon = document.getElementById(`status-icon-${item.id}`);
  if (statusIcon) {
    statusIcon.className = "indicator-icon";
    statusIcon.innerHTML = `✓`;
  }
  
  const compressedKB = item.processedSize / 1024;
  const savingsPercent = Math.max(0, Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100));
  const badge = document.getElementById(`result-badge-${item.id}`);
  
  if (badge) {
    badge.classList.remove('hidden');
    badge.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem; width:100%; justify-content:space-between;">
        <span>Output Size: <strong>${compressedKB.toFixed(1)} KB</strong></span>
        <span class="saving-badge">${savingsPercent}% Smaller</span>
      </div>
      <div class="card-actions">
        <button data-id="${item.id}" class="btn-white-compact btn-audit-trigger">
          Audit Layout Split
        </button>
        <a href="${item.processedUrl}" download="optimized_${item.name.split('.')[0]}.${item.format}" class="btn-black" style="padding:4px 8px; font-size:10px; border-radius:6px; display:inline-block;">
          Save Asset
        </a>
      </div>
    `;
  }
}

async function processAll() {
  if (queue.length === 0 || isProcessingActive) return;
  
  isProcessingActive = true;
  updateDashboardUI();
  
  // Scans the active array dynamically to process remaining files sequentially
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].status === 'pending') {
      await compressImage(queue[i]);
      updateDashboardUI();
    }
  }
  
  isProcessingActive = false;
  updateDashboardUI();
  showBannerAlert("Local batch compression complete.");
}

function updateDashboardUI() {
  const loadedCount = queue.length;
  const pendingCount = queue.filter(x => x.status === 'pending').length;
  
  document.getElementById('queue-counter').innerText = loadedCount;
  document.getElementById('stat-total-loaded').innerText = `${loadedCount} loaded`;
  document.getElementById('stat-pending-count').innerText = `${pendingCount} pending`;
  
  const emptyDash = document.getElementById('dashboard-empty');
  const activeDash = document.getElementById('dashboard-active');
  
  if (loadedCount > 0) {
    if (emptyDash) emptyDash.classList.add('hidden');
    if (activeDash) activeDash.classList.remove('hidden');
  } else {
    if (emptyDash) emptyDash.classList.remove('hidden');
    if (activeDash) activeDash.classList.add('hidden');
  }

  // Handle giant button control state toggles dynamically based on running threads
  const processBtn = document.getElementById('process-all-btn');
  const txt = document.getElementById('process-all-text');
  if (processBtn && txt) {
    if (isProcessingActive) {
      processBtn.disabled = true;
      txt.innerText = "Processing Assets Engine Live...";
    } else if (pendingCount > 0) {
      processBtn.disabled = false;
      txt.innerText = "Process Remaining Assets";
    } else {
      processBtn.disabled = true;
      txt.innerText = "Process Run Cycle Completed";
    }
  }

  totalOriginalBytes = 0;
  totalProcessedBytes = 0;
  let doneItems = 0;

  queue.forEach(x => {
    if (x.status === 'done') {
      totalOriginalBytes += x.originalSize;
      totalProcessedBytes += x.processedSize;
      doneItems++;
    }
  });

  const savingsBox = document.getElementById('savings-summary-box');
  if (doneItems > 0 && totalOriginalBytes > totalProcessedBytes) {
    if (savingsBox) savingsBox.classList.remove('hidden');
    const savedBytes = totalOriginalBytes - totalProcessedBytes;
    if (savedBytes > 1024 * 1024) {
      document.getElementById('savings-bytes-label').innerText = (savedBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      document.getElementById('savings-bytes-label').innerText = (savedBytes / 1024).toFixed(1) + ' KB';
    }
    const pct = Math.round((savedBytes / totalOriginalBytes) * 100);
    document.getElementById('savings-percent-label').innerText = `Total Bandwidth Saved (${pct}%)`;
    if (zipBtn) zipBtn.disabled = false;
  } else {
    if (savingsBox) savingsBox.classList.add('hidden');
    if (zipBtn) zipBtn.disabled = true;
  }
}

function downloadAllZip() {
  if (!window.JSZip) return;
  const zip = new JSZip();
  let addedCount = 0;
  
  queue.forEach(item => {
    if (item.status === 'done' && item.processedUrl) {
      const cleanName = item.name.split('.')[0];
      const base64Data = item.processedUrl.split(',')[1];
      zip.file(`${cleanName}_optimized.${item.format}`, base64Data, { base64: true });
      addedCount++;
    }
  });
  
  if (addedCount === 0) return;
  
  // Uses a binary Blob download to safely navigate past strict server CSP policies
  zip.generateAsync({ type: 'blob' }).then((content) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(content);
    link.href = url;
    link.download = `boundtext_optimized_batch_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  });
}

function clearQueue() {
  queue = [];
  totalOriginalBytes = 0;
  totalProcessedBytes = 0;
  isProcessingActive = false;
  renderQueue();
  updateDashboardUI();
  showBannerAlert("Queue cleared down completely.");
}

function launchVisualAuditModal(id) {
  const item = queue.find(x => x.id === id);
  if (!item || !item.processedUrl) return;
  currentActiveCompareItem = item;
  
  document.getElementById('compare-title').innerText = `Auditing Compression Profile: ${item.name}`;
  document.getElementById('compare-img-original').src = item.previewUrl;
  document.getElementById('compare-img-compressed').src = item.processedUrl;
  document.getElementById('modal-metric-orig').innerText = (item.originalSize / 1024).toFixed(1) + ' KB';
  document.getElementById('modal-metric-comp').innerText = (item.processedSize / 1024).toFixed(1) + ' KB';
  
  const pct = Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100);
  document.getElementById('modal-metric-savings').innerText = `${pct}% Space Saved`;
  
  const dlBtn = document.getElementById('modal-download-btn');
  dlBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = `optimized_${item.name.split('.')[0]}.${item.format}`;
    a.click();
  };
  
  handleCompareSlider(50);
  document.getElementById('compare-modal').classList.remove('hidden');
}

function handleCompareSlider(val) {
  if (!currentActiveCompareItem) return;
  const line = document.getElementById('compare-slider-line');
  const clipContainer = document.getElementById('compare-clip-container');
  const sliderInput = document.getElementById('compare-slider');
  if (line && clipContainer) {
    line.style.left = val + '%';
    clipContainer.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
  }
  if (sliderInput) sliderInput.value = val;
}

function closeCompareModal() {
  document.getElementById('compare-modal').classList.add('hidden');
  currentActiveCompareItem = null;
}

function showBannerAlert(msg) {
  const alertZone = document.getElementById('global-message-zone');
  if (!alertZone) return;
  alertZone.innerHTML = `<div class="toast-body">${msg}</div>`;
  alertZone.classList.remove('hidden');
  setTimeout(() => { alertZone.classList.add('hidden'); }, 3500);
}
