const els = {
  skinContainer: document.getElementById("skin_container"),
  packName: document.getElementById("pack-name"),
  generateBtn: document.getElementById("generate-btn"),
  sharePackBtn: document.getElementById("share-pack-btn"),
  status: document.getElementById("status"),
  selectedCapeDisplay: document.getElementById("selected-cape-display"),
  templateState: document.getElementById("template-state"),
  catalogSearch: document.getElementById("catalog-search"),
  catalogTabs: document.getElementById("catalog-tabs"),
  capeSelector: document.getElementById("cape-selector"),
  loadingSpinner: document.getElementById("loading-spinner"),
  openShareLink: document.getElementById("open-share-link"),
  templateInfoBtn: document.getElementById("template-info-btn"),
};

const state = {
  templateZip: null,
  selectedCapeBlob: null,
  selectedCapeId: null,
  generatedPackFile: null,
  activeTab: "all",
  searchTerm: "",
  catalogItems: [],
};

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function sanitizeFileName(name) {
  return (name || "Hex_Bedrock_Cape").replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "Hex_Bedrock_Cape";
}

async function getSelectedCapeTexture() {
  try {
    const response = await fetch(
      `/assets/capes/${state.selectedCapeId}.png`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Failed to fetch selected cape texture:", error);
    return null;
  }
}

function setStatus(message, type) {
  const icons = { success: "circle-check", error: "triangle-exclamation" };
  const icon = icons[type] || "circle-info";
  els.status.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${message}`;
  const borders = { success: "#1a3a5a", error: "#5a1515" };
  els.status.style.borderColor = borders[type] || "#1a1a24";
  els.status.style.color = type === "error" ? "#ff6b6b" : "#999";
}

let viewer = null;

function initViewer() {
  if (typeof skinview3d === "undefined" || !els.skinContainer) return;
  try {
    viewer = new skinview3d.SkinViewer({
      canvas: els.skinContainer,
      width: 280,
      height: 490,
      skin: "https://minotar.net/skin/vrsebr",
    });
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.playerObject.rotation.y = -158 * Math.PI / 180;
    els.skinContainer.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
  } catch (e) {
    console.error("Failed to init skinview3d:", e);
  }
}

async function fetchCapeAsPngBlob(capeId) {
  const response = await fetch(`/preview/capes/${capeId}`);
  if (!response.ok) throw new Error(`Failed to fetch cape (${response.status})`);
  const blob = await response.blob();

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to decode image"));
    image.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 64, 32);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, 64, 32);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function blobToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function createPreviewLink(capeId) {
  const url = new URL(window.location.href);
  url.searchParams.set("previewId", capeId);
  return url.toString();
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

async function shareOrCopy({ title, text, url, file }) {
  if (file && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title, text, files: [file] });
    return "shared";
  }
  if (url && navigator.share) {
    await navigator.share({ title, text, url });
    return "shared";
  }
  const payload = url || text;
  if (payload && await copyText(payload)) {
    return "copied";
  }
  throw new Error("Sharing is not supported in this browser");
}

async function loadTemplate() {
  const cached = localStorage.getItem("cachedCapeTemplate");
  if (cached) {
    return JSZip.loadAsync(base64ToArrayBuffer(cached));
  }
  const response = await fetch("Cape_Template.zip");
  if (!response.ok) {
    throw new Error(`Failed to fetch template (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  localStorage.setItem("cachedCapeTemplate", blobToBase64(buffer));
  return JSZip.loadAsync(buffer);
}

async function selectCape(capeId) {
  const pngBlob = await fetchCapeAsPngBlob(capeId);

  state.selectedCapeBlob = pngBlob;
  state.selectedCapeId = capeId;
  state.generatedPackFile = null;

  els.selectedCapeDisplay.textContent = capeId;
  els.selectedCapeDisplay.className = "field-value";
  els.packName.value = `${capeId} Cape`;
  els.generateBtn.disabled = false;
  els.sharePackBtn.disabled = true;

  if (viewer) {
    viewer.loadCape(`/assets/capes/${capeId}.png`);
  }

  document.querySelectorAll(".cape-card").forEach((c) => c.classList.remove("selected"));
  const card = document.querySelector(`[data-cape-id="${capeId}"]`);
  if (card) card.classList.add("selected");

  setStatus(`Selected cape ${capeId}`, "success");
}

function resetSelection() {
  state.selectedCapeBlob = null;
  state.selectedCapeId = null;
  state.generatedPackFile = null;
  els.selectedCapeDisplay.textContent = "None selected";
  els.selectedCapeDisplay.className = "field-value muted";
  els.generateBtn.disabled = true;
  els.sharePackBtn.disabled = true;
  document.querySelectorAll(".cape-card").forEach((c) => c.classList.remove("selected"));
  if (viewer) {
    viewer.loadCape(null);
  }
  setStatus("Select a cape from the library to get started.");
}

async function generatePack() {
  if (!state.templateZip) {
    setStatus("Template is still loading", "error");
    return;
  }
  if (!state.selectedCapeBlob) {
    setStatus("Select a cape first", "error");
    return;
  }

  const packName = els.packName.value.trim() || "Hex Bedrock Cape";
  const safeFileName = `${sanitizeFileName(packName)}.mcpack`;

  els.generateBtn.disabled = true;
  els.generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

  try {
    const zipBuffer = await state.templateZip.generateAsync({ type: "uint8array" });
    const newZip = await JSZip.loadAsync(zipBuffer);
    const capeBlob = await getSelectedCapeTexture();
    newZip.file("textures/entity/cape_invisible.png", capeBlob);
    newZip.file("pack_icon.png", state.selectedCapeBlob);

    const manifestFile = newZip.file("manifest.json");
    if (!manifestFile) throw new Error("manifest.json missing from template");

    const manifest = JSON.parse(await manifestFile.async("string"));
    const meta = await fetchCapeMeta(state.selectedCapeId).catch(() => ({
      authorName: state.selectedCapeId,
      category: "Hex",
    }));
    manifest.header.name = packName;
    manifest.header.description = `Cape ${state.selectedCapeId} by ${meta.authorName} packaged with Hex (https://hexcapes.qzz.io)`;
    manifest.header.author = meta.authorName;
    manifest.header.uuid = uuidv4();
    if (Array.isArray(manifest.modules)) {
      manifest.modules.forEach((m) => { m.uuid = uuidv4(); });
    }

    newZip.file("manifest.json", JSON.stringify(manifest, null, 2));

    const content = await newZip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const file = new File([content], safeFileName, { type: "application/octet-stream" });
    state.generatedPackFile = file;
    saveAs(file);

    els.sharePackBtn.disabled = false;
    setStatus(`Generated ${safeFileName}`, "success");
  } catch (error) {
    console.error("Generation error:", error);
    setStatus(error.message || "Failed to generate pack", "error");
  } finally {
    els.generateBtn.disabled = !state.selectedCapeBlob || !state.templateZip;
    els.generateBtn.innerHTML = '<i class="fa-solid fa-box-open"></i> Generate .mcpack';
  }
}

async function shareGeneratedPack() {
  if (!state.selectedCapeId) {
    setStatus("Select a cape first", "error");
    return;
  }
  const url = createPreviewLink(state.selectedCapeId);
  try {
    await copyText(url);
    setStatus("Cape link copied", "success");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Unable to copy link", "error");
  }
}

async function fetchCapeMeta(capeId) {
  const response = await fetch(`/cape/meta/${capeId}`);
  if (!response.ok) throw new Error(`Failed to fetch metadata for cape ${capeId}`);
  return response.json();
}

async function fetchCapePreview(capeId) {
  const response = await fetch(`/preview/capes/${capeId}`);
  if (!response.ok) return null;
  return response.blob();
}

function placeholderPreview(capeId) {

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="#0a0a0e"/>
      <rect x="14" y="14" width="228" height="228" rx="22" fill="url(#g)" opacity="0.16"/>
      <text x="128" y="118" text-anchor="middle" fill="#d7f7ff" font-family="Arial, sans-serif" font-size="34" font-weight="700">Cape ${capeId}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  
  }

function createCatalogCard(capeId) {
  const card = document.createElement("div");
  card.className = "cape-card";
  card.dataset.capeId = capeId;
  card.dataset.searchable = capeId.toLowerCase();
  card.dataset.category = "hex";

  const imageWrap = document.createElement("div");
  imageWrap.className = "card-image";

  const img = document.createElement("img");
  img.alt = `Cape ${capeId}`;
  img.src = placeholderPreview(capeId);
  img.loading = "lazy";

  imageWrap.appendChild(img);

  const label = document.createElement("div");
  label.className = "card-label";
  label.innerHTML = `
    <span class="cape-number">${capeId}</span>
    <span class="cape-meta">Loading...</span>
  `;

  card.appendChild(imageWrap);
  card.appendChild(label);

  card.addEventListener("click", () => {
    selectCape(capeId).catch((error) => {
      console.error(error);
      setStatus(error.message || "Failed to select cape", "error");
    });
  });

  return { card, img, label };
}

function refreshCatalogVisibility() {
  const searchTerm = state.searchTerm.trim().toLowerCase();
  let visibleCount = 0;

  for (const item of state.catalogItems) {
    const category = item.meta?.category?.toLowerCase?.() || "hex";
    const searchable = `${item.capeId} ${item.meta?.authorName || ""}`.toLowerCase();
    const matchesSearch = !searchTerm || searchable.includes(searchTerm);
    const matchesTab = state.activeTab === "all" || category === state.activeTab;
    const visible = matchesSearch && matchesTab;
    item.card.style.display = visible ? "" : "none";
    if (visible) visibleCount += 1;
  }

  const existing = document.querySelector("[data-no-results]");
  if (visibleCount === 0) {
    if (!existing) {
      const empty = document.createElement("div");
      empty.className = "no-results";
      empty.setAttribute("data-no-results", "true");
      empty.textContent = "No capes match the current filters.";
      els.capeSelector.appendChild(empty);
    }
  } else {
    if (existing) existing.remove();
  }
}

function updateCatalogItem(item, meta, previewBlob) {
  item.meta = meta;
  item.previewBlob = previewBlob;
  item.card.dataset.category = String(meta.category || "hex").toLowerCase();
  item.card.dataset.searchable = `${item.capeId} ${meta.authorName || ""}`.toLowerCase();
  item.label.innerHTML = `
    <span class="cape-number">${item.capeId}</span>
    <span class="cape-meta">@${meta.authorName || "Unknown"} &middot; ${meta.category || "Hex"}</span>
  `;

  if (previewBlob) {
    item.img.src = URL.createObjectURL(previewBlob);
  } else {
    item.img.src = placeholderPreview(item.capeId);
  }

  refreshCatalogVisibility();

  if (state.previewParam && !state.autoOpenedPreview && String(state.previewParam) === String(item.capeId)) {
    state.autoOpenedPreview = true;
    selectCape(item.capeId).catch(console.error);
  }
}

async function loadCatalog() {
  els.capeSelector.replaceChildren();
  state.catalogItems = [];

  try {
    const response = await fetch("/cape-list");
    if (!response.ok) throw new Error(`Failed to fetch catalog (${response.status})`);

    const capes = (await response.json()).slice().sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );

    if (!capes.length) {
      els.loadingSpinner.innerHTML = "<p>No capes available.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const capeId of capes) {
      const refs = createCatalogCard(capeId);
      const item = { capeId, meta: null, previewBlob: null, ...refs };
      state.catalogItems.push(item);
      fragment.appendChild(item.card);
    }
    els.capeSelector.appendChild(fragment);
    els.loadingSpinner.style.display = "none";

    await Promise.allSettled(
      state.catalogItems.map(async (item) => {
        const [meta, previewBlob] = await Promise.all([
          fetchCapeMeta(item.capeId).catch(() => ({
            category: "Hex",
            authorName: "Unknown",
            playerpermission: ["*"],
          })),
          fetchCapePreview(item.capeId),
        ]);
        updateCatalogItem(item, meta, previewBlob);
      })
    );

    refreshCatalogVisibility();
  } catch (error) {
    console.error("Error loading catalog:", error);
    els.loadingSpinner.innerHTML = `<p>Failed to load capes: ${error.message}</p>`;
    setStatus("Catalog failed to load", "error");
  }
}

function bindCatalogTabs() {
  els.catalogTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab-btn");
    if (!button) return;
    els.catalogTabs.querySelectorAll(".tab-btn").forEach((t) => t.classList.remove("active"));
    button.classList.add("active");
    state.activeTab = button.dataset.tab || "all";
    refreshCatalogVisibility();
  });
}

function bindActions() {
  els.generateBtn.addEventListener("click", generatePack);
  els.sharePackBtn.addEventListener("click", shareGeneratedPack);
  els.packName.addEventListener("input", () => {});
  els.catalogSearch.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    refreshCatalogVisibility();
  });
  els.openShareLink.addEventListener("click", async () => {
    if (state.generatedPackFile) {
      await shareGeneratedPack();
      return;
    }
    if (state.selectedCapeId) {
      try {
        const result = await shareOrCopy({
          title: `Hex Cape ${state.selectedCapeId}`,
          text: `Hex cape ${state.selectedCapeId}`,
          url: createPreviewLink(state.selectedCapeId),
        });
        setStatus(result === "shared" ? "Cape shared" : "Cape link copied", "success");
        return;
      } catch (error) {
        console.error(error);
        setStatus(error.message || "Unable to share", "error");
        return;
      }
    }
    try {
      await copyText(window.location.href);
      setStatus("Page link copied", "success");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Unable to share", "error");
    }
  });
  els.templateInfoBtn.addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = "Cape_Template.zip";
    a.download = "Cape_Template.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus("Downloaded default template", "success");
  });
}

async function loadTemplateIntoState() {
  els.templateState.textContent = "Loading";
  try {
    state.templateZip = await loadTemplate();
    if (!state.templateZip.file("textures/entity/cape_invisible.png")) {
      throw new Error("Template is missing required cape texture files");
    }
    els.templateState.textContent = "Ready";
    els.templateState.style.color = "#4ade80";
    setStatus("Select a cape from the library to get started.");
    els.generateBtn.disabled = !state.selectedCapeBlob;
  } catch (error) {
    console.error("Template error:", error);
    els.templateState.textContent = "Failed";
    els.templateState.style.color = "#ff6b6b";
    setStatus(`Template loading failed: ${error.message}`, "error");
    els.generateBtn.disabled = true;
  }
}

async function boot() {
  initViewer();
  bindActions();
  bindCatalogTabs();
  els.generateBtn.disabled = true;
  els.sharePackBtn.disabled = true;

  state.previewParam = new URLSearchParams(window.location.search).get("previewId");
  state.autoOpenedPreview = false;

  await loadTemplateIntoState();
  await loadCatalog();

  if (state.previewParam && !state.autoOpenedPreview) {
    state.autoOpenedPreview = true;
    selectCape(state.previewParam).catch(console.error);
  }
}

boot().catch((error) => {
  console.error(error);
  setStatus(error.message || "Unexpected startup error", "error");
});
