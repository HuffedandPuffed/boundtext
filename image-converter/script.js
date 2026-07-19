// Application Memory State Queue
let filesQueue = [];
let bulkSettings = { format: 'webp', quality: 0.8, scale: 100 };
let activeCompareId = null;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  setupDragAndDrop();
});

// Helper: Format File Sizes cleanly
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper: Alter filename strings with target formats
function renameExtension(filename, format) {
  return filename.substring(0, filename.lastIndexOf('.')) + '.' + format;
}

// Trigger browser hidden click
function triggerUpload() {
  document.getElementById("file-input").click();
}

// Setup Drag and Drop events hooks
function setupDragAndDrop() {
  const zone = document.getElementById("drop-zone");
  const title = document.getElementById("drop-title");

  ['dragenter', 'dragover'].forEach(eventName => {
    zone.addEventListener(eventName, (e) => {
      e.preventDefault();
      zone.classList.add('border-zinc-500', 'bg-zinc-100', 'shadow-inner');
      title.innerText = "Drop your images here!";
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, (e) => {
      e.preventDefault();
      zone.classList.remove('border-zinc-500', 'bg-zinc-100', 'shadow-inner');
      title.innerText = "Drop your assets here";
    }, false);
  });

  zone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  });
}

// Handle dynamic input file selection array parsing
function handleFileSelect(event) {
  handleFilesAdded(event.target.files);
}

// Master execution: Map files directly into local sandboxed memory arrays
async function handleFilesAdded(fileList) {
  if (!fileList.length) return;
  showGlobalMessage(`Loading ${fileList.length} file(s)...`, 'info');

  for (let file of fileList) {
    if (!file.type.startsWith('image/')) {
      showGlobalMessage(`Skipped non-image file: ${file.name}`, 'error');
      continue;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const previewUrl = URL.createObjectURL(file);

    try {
      const dimensions = await getImageDimensions(previewUrl);
      
      filesQueue.push({
        id,
        file,
        name: file.name,
        originalSize: file.size,
        originalWidth: dimensions.width,
        originalHeight: dimensions.height,
        previewUrl,
        status: 'idle',
        progress: 0,
        format: bulkSettings.format,
        quality: bulkSettings.quality,
        scale: bulkSettings.scale,
        resizeWidth: Math.round(dimensions.width * (bulkSettings.scale / 100)),
        resizeHeight: Math.round(dimensions.height * (bulkSettings.scale / 100)),
        aspectRatio: dimensions.width / dimensions.height,
        compressedUrl: null,
        compressedSize: null,
        blob: null
      });
    } catch (err) {
      showGlobalMessage(`Failed loading dimensions for ${file.name}`, 'error');
    }
  }

  syncUI();
}

// Read asynchronous dimension properties from browser memory references
function getImageDimensions(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Dimensions load failure"));
    img.src = url;
  });
}

// Synchronize Settings Values
function updateBulkSettings() {
  const formatEl = document.getElementById("bulk-format");
  const qualityEl = document.getElementById("bulk-quality");
  const scaleEl = document.getElementById("bulk-scale");
  
  if (!formatEl || !qualityEl || !scaleEl) return;

  bulkSettings.format = formatEl.value;
  bulkSettings.quality = parseFloat(qualityEl.value) / 100;
  bulkSettings.scale = parseInt(scaleEl.value);

  document.getElementById("bulk-quality-label").innerText = Math.round(bulkSettings.quality * 100) + '%';
  document.getElementById("bulk-scale-label").innerText = bulkSettings.scale + '%';

  if (bulkSettings.format === 'png') {
    qualityEl.disabled = true;
  } else {
    qualityEl.disabled = false;
  }
}

// Apply bulk side menu properties globally across whole queue array
function applyBulkToQueue() {
  if (!filesQueue.length) return showGlobalMessage('No items loaded.', 'info');

  filesQueue = filesQueue.map(item => {
    if (item.status === 'processing') return item;
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

    return {
      ...item,
      format: bulkSettings.format,
      quality: bulkSettings.quality,
      scale: bulkSettings.scale,
      resizeWidth: Math.round(item.originalWidth * (bulkSettings.scale / 100)),
      resizeHeight: Math.round(item.originalHeight * (bulkSettings.scale / 100)),
      status: 'idle',
      compressedUrl: null,
      compressedSize: null,
      blob: null
    };
  });

  showGlobalMessage('Applied bulk configuration globally.', 'success');
  syncUI();
}

// Update specific values inline per grid component item directly
function updateItemParam(id, updates) {
  filesQueue = filesQueue.map(item => {
    if (item.id !== id) return item;
    let target = { ...item, ...updates };

    if (updates.resizeWidth !== undefined) {
      target.resizeHeight = Math.round(updates.resizeWidth / item.aspectRatio);
    } else if (updates.resizeHeight !== undefined) {
      target.resizeWidth = Math.round(updates.resizeHeight * item.aspectRatio);
    }

    if (item.compressedUrl && (updates.format || updates.quality || updates.resizeWidth || updates.resizeHeight || updates.scale)) {
      URL.revokeObjectURL(item.compressedUrl);
      target.status = 'idle';
      target.compressedUrl = null;
      target.compressedSize = null;
      target.blob = null;
    }
    return target;
  });
  syncUI();
}

// Remove item from state index positions
function deleteItem(id) {
  const target = filesQueue.find(f => f.id === id);
  if (target) {
    if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
    if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
  }
  filesQueue = filesQueue.filter(f => f.id !== id);
  syncUI();
}

// Completely empty arrays out safely
function clearQueue() {
  filesQueue.forEach(f => {
    URL.revokeObjectURL(f.previewUrl);
    if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
  });
  filesQueue = [];
  syncUI();
}

// Asynchronous internal processor loops
function processSingleFile(id) {
  return new Promise(async (resolve) => {
    const item = filesQueue.find(f => f.id === id);
    if (!item || item.status === 'processing') return resolve(false);

    updateItemParam(id, { status: 'processing', progress: 30 });

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const targetWidth = item.resizeWidth || item.originalWidth;
      const targetHeight = item.resizeHeight || item.originalHeight;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      let mimeType = "image/webp";
      if (item.format === 'jpeg') mimeType = "image/jpeg";
      if (item.format === 'png') mimeType = "image/png";

      canvas.toBlob((blob) => {
        if (!blob) {
          updateItemParam(id, { status: 'error', progress: 0 });
          return resolve(false);
        }

        const compressedUrl = URL.createObjectURL(blob);
        updateItemParam(id, {
          status: 'completed',
          progress: 100,
          compressedSize: blob.size,
          compressedWidth: targetWidth,
          compressedHeight: targetHeight,
          compressedUrl,
          blob: blob
        });
        resolve(true);
      }, mimeType, item.format === 'png' ? 1.0 : item.quality);
    };

    img.onerror = () => {
      updateItemParam(id, { status: 'error', progress: 0 });
      resolve(false);
    };
    img.src = item.previewUrl;
  });
}

// Map loop configurations down sequentially to convert all
async function processAll() {
  const targets = filesQueue.filter(f => f.status === 'idle' || f.status === 'error');
  if (!targets.length) return;

  document.getElementById("process-all-icon").classList.add("animate-spin");
  document.getElementById("process-all-text").innerText = "Converting Queue Assets...";

  for (let item of targets) {
    await processSingleFile(item.id);
  }

  document.getElementById("process-all-icon").classList.remove("animate-spin");
  document.getElementById("process-all-text").innerText = "Process All Assets";
  showGlobalMessage("Queue transformation processing completed!", "success");
}

// Bulk Compile JSZip Engine functions bundles
async function downloadAllZip() {
  const targets = filesQueue.filter(f => f.status === 'completed' && f.blob);
  if (!targets.length) return;

  showGlobalMessage("Generating batch archive zip package...", "info");
  const zip = new JSZip();

  targets.forEach(item => {
    const name = renameExtension(item.name, item.format);
    zip.file(name, item.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);

  const a = document.createElement("a");
  a.href = url;
  a.download = `boundtext_archive_${Date.now().toString().substring(7)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Single anchor elements download executions
function downloadSingle(id) {
  const item = filesQueue.find(f => f.id === id);
  if (!item || !item.compressedUrl) return;

  const a = document.createElement("a");
  a.href = item.compressedUrl;
  a.download = renameExtension(item.name, item.format);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// UI Panel visibility states toggle functions
function toggleBulkPanel() {
  const panel = document.getElementById("bulk-panel-content");
  const icon = document.getElementById("bulk-toggle-icon");
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    icon.setAttribute('data-lucide', 'chevron-up');
  } else {
    panel.classList.add('hidden');
    icon.setAttribute('data-lucide', 'chevron-down');
  }
  lucide.createIcons();
}

// Sync State arrays downstream dynamically directly into document tree renders
function syncUI() {
  const queueSection = document.getElementById("queue-section");
  const queueList = document.getElementById("queue-list");
  const counter = document.getElementById("queue-counter");
  
  const dbEmpty = document.getElementById("dashboard-empty");
  const dbActive = document.getElementById("dashboard-active");

  if (filesQueue.length === 0) {
    queueSection.classList.add('hidden');
    dbActive.classList.add('hidden');
    dbEmpty.classList.remove('hidden');
    return;
  }

  queueSection.classList.remove('hidden');
  dbEmpty.classList.add('hidden');
  dbActive.classList.remove('hidden');
  counter.innerText = filesQueue.length;

  document.getElementById("stat-total-loaded").innerText = `${filesQueue.length} loaded`;
  const pending = filesQueue.filter(f => f.status === 'idle').length;
  document.getElementById("stat-pending-count").innerText = `${pending} pending`;

  let totalOriginal = 0;
  let totalCompressed = 0;
  let completes = 0;

  filesQueue.forEach(f => {
    totalOriginal += f.originalSize;
    if (f.status === 'completed' && f.compressedSize) {
      totalCompressed += f.compressedSize;
      completes++;
    } else {
      totalCompressed += f.originalSize;
    }
  });

  const zipBtn = document.getElementById("zip-btn");
  if (completes > 0) {
    zipBtn.disabled = false;
    zipBtn.innerText = `Download All as ZIP (${completes})`;
    const savings = totalOriginal - totalCompressed;
    const pct = ((savings / totalOriginal) * 100).toFixed(0);
    
    document.getElementById("savings-summary-box").classList.remove('hidden');
    document.getElementById("savings-bytes-label").innerText = formatBytes(savings);
    document.getElementById("savings-percent-label").innerText = `Total Bandwidth Saved (-${pct}%)`;
  } else {
    zipBtn.disabled = true;
    zipBtn.innerText = "Download All as ZIP";
    document.getElementById("savings-summary-box").classList.add('hidden');
  }

  queueList.innerHTML = filesQueue.map(item => {
    const comp = item.status === 'completed';
    const proc = item.status === 'processing';
    const err = item.status === 'error';
    const pctSaved = comp ? (((item.originalSize - item.compressedSize) / item.originalSize) * 100).toFixed(0) : 0;

    return `
      <div class="border rounded-3xl p-5 transition bg-white ${proc ? 'border-zinc-500 ring-1 ring-zinc-200' : 'border-zinc-200'}">
        <div class="flex flex-col md:flex-row md:items-start md:space-x-5">
          <div class="relative w-full md:w-32 h-32 md:h-28 bg-zinc-50 rounded-2xl overflow-hidden shrink-0 border border-zinc-100 mb-4 md:mb-0 flex items-center justify-center">
            <img src="${item.previewUrl}" class="max-w-full max-h-full object-contain">
            ${comp ? '<div class="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow"><i data-lucide="check" class="w-3 h-3 stroke-[3]"></i></div>' : ''}
            ${err ? '<div class="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-1 shadow"><i data-lucide="alert-circle" class="w-3 h-3 stroke-[3]"></i></div>' : ''}
          </div>

          <div class="flex-1 min-w-0 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-sm font-bold text-zinc-900 truncate">${item.name}</h4>
                <button onclick="deleteItem('${item.id}')" class="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"><i data-lucide="x" class="w-4 h-4"></i></button>
              </div>
              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500 mt-1 font-medium">
                <span class="font-semibold text-zinc-800">${formatBytes(item.originalSize)}</span>
                <span class="text-zinc-300">•</span>
                <span class="font-mono">${item.originalWidth} × ${item.originalHeight} px</span>
              </div>
            </div>

            <div class="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-4">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Format</label>
                  <select onchange="updateItemParam('${item.id}', {format: this.value})" ${proc ? 'disabled' : ''} class="w-full text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 rounded-xl px-2.5 py-2 focus:outline-none">
                    <option value="webp" ${item.format === 'webp' ? 'selected' : ''}>WEBP</option>
                    <option value="jpeg" ${item.format === 'jpeg' ? 'selected' : ''}>JPEG</option>
                    <option value="png" ${item.format === 'png' ? 'selected' : ''}>PNG</option>
                  </select>
                </div>

                <div>
                  <div class="flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                    <span>Quality</span>
                    <span class="font-mono text-zinc-900 font-bold">${Math.round(item.quality * 100)}%</span>
                  </div>
                  <input type="range" min="10" max="100" step="5" value="${Math.round(item.quality * 100)}" ${proc || item.format === 'png' ? 'disabled' : ''} onchange="updateItemParam('${item.id}', {quality: parseFloat(this.value)/100})" class="w-full h-8 appearance-none bg-transparent cursor-pointer accent-zinc-950">
                </div>

                <div class="col-span-2 sm:col-span-1 flex flex-col justify-end">
                  <div class="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-zinc-200">
                    <input type="number" value="${item.resizeWidth}" ${proc ? 'disabled' : ''} onchange="updateItemParam('${item.id}', {resizeWidth: parseInt(this.value)})" class="w-full text-center text-xs font-mono py-1 rounded bg-zinc-50 border-0 focus:outline-none">
                    <input type="number" value="${item.resizeHeight}" ${proc ? 'disabled' : ''} onchange="updateItemParam('${item.id}', {resizeHeight: parseInt(this.value)})" class="w-full text-center text-xs font-mono py-1 rounded bg-zinc-50 border-0 focus:outline-none">
                  </div>
                </div>
              </div>
            </div>

            ${proc ? `
              <div class="space-y-2">
                <div class="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden"><div class="bg-zinc-950 h-full rounded-full transition-all duration-300" style="width: ${item.progress}%"></div></div>
              </div>
            ` : ''}

            ${comp ? `
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-zinc-500 font-semibold">Optimized:</span>
                  <span class="text-xs font-bold font-mono text-zinc-800">${formatBytes(item.compressedSize)}</span>
                  <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">-${pctSaved}% Saved</span>
                </div>
                <span class="text-[11px] text-zinc-400 font-mono font-bold">${item.compressedWidth} × ${item.compressedHeight} px</span>
              </div>
            ` : ''}

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              ${comp ? `<button onclick="openCompareModal('${item.id}')" class="inline-flex items-center px-4 py-2 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition shadow-xs"><i data-lucide="maximize-2" class="w-3.5 h-3.5 mr-1.5"></i> Compare Visuals</button>` : ''}
              <button onclick="${comp ? `downloadSingle('${item.id}')` : `processSingleFile('${item.id}')`}" class="inline-flex items-center px-4.5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 rounded-xl transition">
                <i data-lucide="${comp ? 'download' : 'refresh-cw'}" class="w-3.5 h-3.5 mr-1.5"></i> ${comp ? 'Download' : 'Optimize & Convert'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// Visual Comparison Slider Modals
function openCompareModal(id) {
  const item = filesQueue.find(f => f.id === id);
  if (!item || !item.compressedUrl) return;

  activeCompareId = id;
  document.getElementById("compare-title").innerText = `Comparing: ${item.name}`;
  document.getElementById("compare-img-original").src = item.previewUrl;
  document.getElementById("compare-img-compressed").src = item.compressedUrl;

  document.getElementById("compare-size-orig").innerText = `Original (${formatBytes(item.originalSize)})`;
  document.getElementById("compare-size-comp").innerText = `Optimized (${formatBytes(item.compressedSize)})`;

  document.getElementById("modal-metric-orig").innerText = `${item.file.type.split('/')[1].toUpperCase()} (${item.originalWidth}x${item.originalHeight})`;
  document.getElementById("modal-metric-comp").innerText = `${item.format.toUpperCase()} (${item.resizeWidth}x${item.resizeHeight})`;
  
  const savings = (((item.originalSize - item.compressedSize) / item.originalSize) * 100).toFixed(0);
  document.getElementById("modal-metric-savings").innerText = `-${savings}%`;

  document.getElementById("modal-download-btn").setAttribute("onclick", `downloadSingle('${item.id}')`);

  handleCompareSlider(50);
  document.getElementById("compare-modal").classList.remove("hidden");
}

function handleCompareSlider(val) {
  document.getElementById("compare-clip-container").style.clipPath = `polygon(${val}% 0, 100% 0, 100% 100%, ${val}% 100%)`;
  document.getElementById("compare-slider-line").style.left = `${val}%`;
}

function closeCompareModal() {
  document.getElementById("compare-modal").classList.add("hidden");
  activeCompareId = null;
}

// Helper Toast banner system
function showGlobalMessage(text, type) {
  const zone = document.getElementById("global-message-zone");
  let bg = "bg-white border-zinc-200 text-zinc-800";
  let icon = "info";

  if (type === 'success') { bg = "bg-white border-emerald-200 text-emerald-800 shadow-emerald-100/50"; icon = "check"; }
  if (type === 'error') { bg = "bg-white border-rose-200 text-rose-800 shadow-rose-100/50"; icon = "alert-circle"; }

  zone.innerHTML = `
    <div class="p-4 rounded-2xl shadow-xl border flex items-start space-x-3 backdrop-blur-md ${bg}">
      <i data-lucide="${icon}" class="w-5 h-5 shrink-0 mt-0.5"></i>
      <div class="flex-1 text-xs font-semibold">${text}</div>
    </div>
  `;
  zone.classList.remove("hidden");
  lucide.createIcons();

  setTimeout(() => zone.classList.add("hidden"), 4000);
}
