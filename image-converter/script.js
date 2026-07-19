// Global App State Workspace Storage Queue
let queue = [];
let totalOriginalBytes = 0;
let totalProcessedBytes = 0;

// Initialize Drag & Drop Interceptors once DOM finishes painting
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#C5A059';
        dropZone.style.backgroundColor = '#18181b';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#3f3f46';
        dropZone.style.backgroundColor = '#18181b';
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files.length > 0) {
        processIncomingFiles(dt.files);
      }
    }, false);
  }
  
  // Initialize Lucide Vector Graphics Icon Engine Font Nodes
  if (window.lucide) { lucide.createIcons(); }
});

// Trigger File System Selection Window Dialog Launcher Hook
function triggerUpload() {
  document.getElementById('file-input').click();
}

// Input Select Change Entry Hook Event Handler
function handleFileSelect(event) {
  if (event.target.files && event.target.files.length > 0) {
    processIncomingFiles(event.target.files);
    event.target.value = ''; // Reset slot descriptor index
  }
}

// Core File Queue Registration Array Ingestion Architecture Loop
function processIncomingFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert(`Asset tracking skip: "${file.name}" is not a valid graphic image schema format.`);
      return;
    }

    const item = {
      id: 'asset_' + Math.random().toString(36).substr(2, 9),
      file: file,
      name: file.name,
      originalSize: file.size,
      format: document.getElementById('bulk-format').value,
      quality: parseInt(document.getElementById('bulk-quality').value),
      scale: parseInt(document.getElementById('bulk-scale').value),
      status: 'pending',
      previewUrl: URL.createObjectURL(file),
      processedBlob: null,
      processedUrl: null,
      processedSize: 0,
      width: 0,
      height: 0
    };

    // Extract exact native resolution data markers via image preloader instance
    const img = new Image();
    img.onload = () => {
      item.width = img.naturalWidth;
      item.height = img.naturalHeight;
      queue.push(item);
      renderQueue();
      updateDashboardUI();
    };
    img.src = item.previewUrl;
  });
}

// Sync Global Sliders and Output Options with Settings Panel Labels
function updateBulkSettings() {
  const format = document.getElementById('bulk-format').value;
  const quality = document.getElementById('bulk-quality').value;
  const scale = document.getElementById('bulk-scale-label');

  document.getElementById('bulk-quality-label').innerText = quality + '%';
  if (scale) {
    document.getElementById('bulk-scale-label').innerText = document.getElementById('bulk-scale').value + '%';
  }
}

// Apply settings configuration states to current item elements across the queue matrix arrays
function applyBulkToQueue() {
  const format = document.getElementById('bulk-format').value;
  const quality = parseInt(document.getElementById('bulk-quality').value);
  const scale = parseInt(document.getElementById('bulk-scale').value);

  queue.forEach(item => {
    if (item.status !== 'done' && item.status !== 'processing') {
      item.format = format;
      item.quality = quality;
      item.scale = scale;
      
      // Update individual template field DOM selector mappings directly
      const fEl = document.getElementById(`fmt-${item.id}`);
      const qEl = document.getElementById(`qlt-${item.id}`);
      const sEl = document.getElementById(`scl-${item.id}`);
      
      if (fEl) fEl.value = format;
      if (qEl) qEl.value = quality;
      if (sEl) scl.value = scale;
    }
  });
  
  showBannerAlert("Settings configuration profile mapped globally onto remaining queued queue entries.");
}

// Synchronize state configurations across standalone single element items
function updateItemSettings(id, key, value) {
  const item = queue.find(x => x.id === id);
  if (item) {
    item[key] = (key === 'format') ? value : parseInt(value);
  }
}

// Dynamic Template Grid Interface Construction Engine
function renderQueue() {
  const queueList = document.getElementById('queue-list');
  const queueSection = document.getElementById('queue-section');
  
  if (queue.length === 0) {
    queueSection.classList.add('hidden');
    queueList.innerHTML = '';
    return;
  }

  queueSection.classList.remove('hidden');
  queueList.innerHTML = queue.map(item => {
    const sizeKB = (item.originalSize / 1024).toFixed(1) + ' KB';
    
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
              <span class="meta-specs">${item.width}x${item.height}px | ${sizeKB}</span>
            </div>
            
            <div class="controls-grid" id="controls-${item.id}">
              <div class="input-wrapper">
                <label>Format</label>
                <select id="fmt-${item.id}" onchange="updateItemSettings('${item.id}', 'format', this.value)">
                  <option value="webp" ${item.format === 'webp' ? 'selected' : ''}>WEBP</option>
                  <option value="jpeg" ${item.format === 'jpeg' ? 'selected' : ''}>JPEG</option>
                  <option value="png" ${item.format === 'png' ? 'selected' : ''}>PNG</option>
                </select>
              </div>
              
              <div class="input-wrapper">
                <label>Quality</label>
                <input type="number" id="qlt-${item.id}" min="10" max="100" value="${item.quality}" onchange="updateItemSettings('${item.id}', 'quality', this.value)">
              </div>
              
              <div class="input-wrapper">
                <label>Scale (%)</label>
                <input type="number" id="scl-${item.id}" min="10" max="100" value="${item.scale}" onchange="updateItemSettings('${item.id}', 'scale', this.value)">
              </div>
            </div>
            
            <div id="progress-wrapper-${item.id}" class="hidden">
              <div class="loading-track"><div id="bar-${item.id}" class="loading-fill" style="width: 0%;"></div></div>
            </div>
            
            <div id="result-badge-${item.id}" class="done-badge hidden"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) { lucide.createIcons(); }
}

// Primary GPU-Accelerated Canvas Transform & Compression Worker Pipeline Execution Logic
async function compressImage(item) {
  return new Promise((resolve) => {
    item.status = 'processing';
    
    document.getElementById(`controls-${item.id}`).classList.add('hidden');
    document.getElementById(`progress-wrapper-${item.id}`).classList.remove('hidden');
    document.getElementById(`bar-${item.id}`).style.width = '45%';
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const scaleFactor = item.scale / 100;
      const targetWidth = Math.max(1, Math.round(img.naturalWidth * scaleFactor));
      const targetHeight = Math.max(1, Math.round(img.naturalHeight * scaleFactor));
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      let mimeType = 'image/webp';
      if (item.format === 'jpeg') mimeType = 'image/jpeg';
      if (item.format === 'png') mimeType = 'image/png';
      
      const encoderQuality = item.quality / 100;
      
      document.getElementById(`bar-${item.id}`).style.width = '80%';
      
      canvas.toBlob((blob) => {
        if (blob) {
          item.processedBlob = blob;
          item.processedSize = blob.size;
          item.processedUrl = URL.createObjectURL(blob);
          item.status = 'done';
          
          document.getElementById(`bar-${item.id}`).style.width = '100%';
          finalizeItemUI(item);
        } else {
          item.status = 'error';
          showBannerAlert(`Compression routine crashed out on file tracking ID element context: ${item.name}`);
        }
        resolve();
      }, mimeType, encoderQuality);
    };
    
    img.onerror = () => {
      item.status = 'error';
      resolve();
    };
    
    img.src = item.previewUrl;
  });
}

function finalizeItemUI(item) {
  document.getElementById(`progress-wrapper-${item.id}`).classList.add('hidden');
  
  const statusIcon = document.getElementById(`status-icon-${item.id}`);
  statusIcon.className = "indicator-icon bg-green";
  statusIcon.innerHTML = `<i data-lucide="check" style="width:12px; height:12px;"></i>`;
  
  const compressedKB = item.processedSize / 1024;
  const savingsPercent = Math.max(0, Math.round(((item.originalSize - item.processedSize) / item.originalSize) * 100));
  
  const badge = document.getElementById(`result-badge-${item.id}`);
  badge.classList.remove('hidden');
  badge.innerHTML = `
    <div style="display:flex; align-items:center; gap:0.5rem; width:100%; justify-content:space-between;">
      <span>Output size saved down to: <strong>${compressedKB.toFixed(1)} KB</strong></span>
      <span class="saving-badge">${savingsPercent}% Smaller</span>
    </div>
    <div class="card-actions" style="margin-top:8px;">
      <button onclick="launchVisualAuditModal('${item.id}')" class="btn-white" style="padding:4px 8px; font-size:10px; border-radius:6px;">
        Audit Layout Split
      </button>
      <a href="${item.processedUrl}" download="optimized_${item.name.split('.')[0]}.${item.format}" class="btn-black" style="padding:4px 8px; font-size:10px; border-radius:6px; text-decoration:none;">
        Save Asset
      </a>
    </div>
  `;
  
  if (window.lucide) { lucide.createIcons(); }
}

async function processAll() {
  const processBtn = document.getElementById('process-all-btn');
  const txt = document.getElementById('process-all-text');
  
  processBtn.disabled = true;
  txt.innerText = "Processing Assets Engine Live...";
  
  for (let item of queue) {
    if (item.status === 'pending') {
      await compressImage(item);
      updateDashboardUI();
    }
  }
  
  txt.innerText = "Process Run Cycle Completed";
  document.getElementById('zip-btn').disabled = false;
  showBannerAlert("Bulk acceleration workflow completed processing successfully across the runtime pipeline stack array targets.");
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
    emptyDash.classList.add('hidden');
    activeDash.classList.remove('hidden');
  } else {
    emptyDash.classList.remove('hidden');
    activeDash.classList.add('hidden');
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
    savingsBox.classList.remove('hidden');
    const savedBytes = totalOriginalBytes - totalProcessedBytes;
    
    if (savedBytes > 1024 * 1024) {
      document.getElementById('savings-bytes-label').innerText = (savedBytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
      document.getElementById('savings-bytes-label').innerText = (savedBytes / 1024).toFixed(1) + ' KB';
    }
    
    const pct = Math.round((savedBytes / totalOriginalBytes) * 100);
    document.getElementById('savings-percent-label').innerText = `Total Bandwidth Saved (${pct}%)`;
  } else {
    savingsBox.classList.add('hidden');
  }
}

function downloadAllZip() {
  if (!window.JSZip) {
    alert("ZIP engine module library missing.");
    return;
  }
  
  const zip = new JSZip();
  let addedCount = 0;
  
  queue.forEach(item => {
    if (item.status === 'done' && item.processedBlob) {
      const cleanName = item.name.split('.')[0];
      zip.file(`${cleanName}_optimized.${item.format}`, item.processedBlob);
      addedCount++;
    }
  });
  
  if (addedCount === 0) {
    alert("Empty package payload parameter tracking structure layout data compilation index target state exception.");
    return;
  }
  
  zip.generateAsync({ type: 'blob' }).then((content) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `boundtext_optimized_batch_${Date.now()}.zip`;
    link.click();
  });
}

function clearQueue() {
  queue.forEach(x => {
    if (x.previewUrl) URL.revokeObjectURL(x.previewUrl);
    if (x.processedUrl) URL.revokeObjectURL(x.processedUrl);
  });
  
  queue = [];
  totalOriginalBytes = 0;
  totalProcessedBytes = 0;
  
  document.getElementById('process-all-btn').disabled = false;
  document.getElementById('process-all-text').innerText = "Process All Assets";
  document.getElementById('zip-btn').disabled = true;
  
  renderQueue();
  updateDashboardUI();
  showBannerAlert("Sandbox pipeline environment state memory modules purged cleared down completely clean.");
}

let currentActiveCompareItem = null;

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
  
  if (line && clipContainer) {
    line.style.left = val + '%';
    clipContainer.style.clipPath = `polygon(${val}% 0, 100% 0, 100% 100%, ${val}% 100%)`;
  }
}

function closeCompareModal() {
  document.getElementById('compare-modal').classList.add('hidden');
  currentActiveCompareItem = null;
}

function showBannerAlert(msg) {
  const alertZone = document.getElementById('global-message-zone');
  if (!alertZone) return;
  
  alertZone.innerHTML = `
    <div style="background-color:#18181b; color:#ffffff; border:1px solid #C5A059; padding:0.75rem 1rem; border-radius:12px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.5); font-size:0.75rem; font-weight:700; display:flex; align-items:center; gap:0.5rem; justify-content:space-between;">
      <span>${msg}</span>
    </div>
  `;
  
  alertZone.classList.remove('hidden');
  setTimeout(() => { alertZone.classList.add('hidden'); }, 3500);
}
