// History for undo/redo
let capeHistory = [];
let historyIndex = 0;

// popup
function showPopup(message, type, duration) {
  const colors = {
    success: { border: '#58d8ff', icon: '✓' },
    error:   { border: '#e14c55', icon: '✕' },
    warning: { border: '#ffbc44', icon: '⚠' },
    info:    { border: '#7f5cff', icon: 'ℹ' },
  };

  const { border, icon } = colors[type] || colors.info;

  const popup = document.createElement('div');
  popup.className = `popup ${type}`;
  popup.style.borderLeftColor = border;
  popup.innerHTML = `${icon} ${message}`;
  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    popup.style.opacity = '0';
    popup.style.transform = 'translateX(400px)';
    setTimeout(() => popup.remove(), 200);
  }, duration);
}

// Show modal for token error with Discord registration instructions
function showTokenErrorModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10000';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.maxWidth = '500px';

    const title = document.createElement('h2');
    title.textContent = 'Registration Required';
    title.style.color = '#e14c55';
    modalContent.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'You need to register and login to use the services oh hex';
    description.style.cssText = 'margin: 1rem 0; color: #999;';
    modalContent.appendChild(description);

    const steps = document.createElement('ol');
    steps.style.cssText = 'margin: 1.5rem 0; color: #ccc; line-height: 1.8;';
    
    const stepTexts = [
        'Join our Discord server',
        //'Go to the #cmd channel',
        'Type /register to create an account',
        'Type /login to login with your account',
        'Then open the link provided by the bot'
    ];

    stepTexts.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        li.style.marginBottom = '0.5rem';
        steps.appendChild(li);
    });

    modalContent.appendChild(steps);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const discordBtn = document.createElement('button');
    discordBtn.textContent = 'Join Discord';
    discordBtn.className = 'modal-btn modal-btn-apply';
    discordBtn.style.backgroundColor = '#5865f2';
    discordBtn.onclick = () => {
        window.open('https://dsc.gg/hexcapes', '_blank');
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.className = 'modal-btn modal-btn-cancel';
    closeBtn.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(discordBtn);
    buttonContainer.appendChild(closeBtn);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
}

// extract the token from the url

const params = new URLSearchParams(window.location.search);

const token = params.get("token");

async function checkforToken(token) {
    if (!token) {
        showTokenErrorModal();
    }
}

checkforToken(token);

async function getuserdata(token) {
    const response = await fetch(`/profile/meta/${token}`);
    const userData = await response.json();
    console.log("User data:", userData);
    return userData;
}

const userData = await getuserdata(token).catch(error => {
    console.error("Error fetching user data:", error);
    showTokenErrorModal();
    return null;
});

if (!userData || userData.error) {
    showTokenErrorModal();
}

const discordid = userData?.userId ?? null;
const ign = userData?.ign ?? null;
const capeId = userData?.capeid ?? null;

// Stop if user data is invalid
if (!ign || !capeId) {
    showPopup("Invalid user data", "error", 3000);
}

// Initialize cape history with current cape
capeHistory = [capeId];

const viewer = new skinview3d.SkinViewer({
    canvas: document.getElementById("skin_container"),
    width: 280,
    height: 490,
    skin: `https://minotar.net/skin/${ign}`,
    cape: `/assets/capes/${capeId}.png`
});

document.getElementById("skin_container").addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

viewer.animation =
    new skinview3d.IdleAnimation();

viewer.playerObject.rotation.y = -158 * Math.PI / 180;    


function updateviewerinfo(capeId, ign, discordid) {
    // Update the viewer with the new cape and skin
    const element = document.getElementById("username");
    element.textContent = ign;
    const element2 = document.getElementById("capeid");
    element2.textContent = capeId;
    const element3 = document.getElementById("discordtag");
    element3.textContent = `<@${discordid}>`;
    const headerIgn = document.getElementById("header-ign");
    const headerDiscord = document.getElementById("header-discord");
    if (headerIgn) headerIgn.textContent = ign;
    if (headerDiscord) headerDiscord.textContent = discordid ? String(discordid) : "{discordid}";
    
    // Set the user avatar from Minotar
    const avatarElement = document.querySelector(".user-chip-avatar");
    if (avatarElement && ign) {
        avatarElement.style.backgroundImage = `url('https://minotar.net/avatar/${ign}')`;
    }
}

updateviewerinfo(capeId, ign, discordid);

//get capes list

async function getcapelist() {
    try {
        const res = await fetch("/cape-list");
        const capes = await res.json();
        console.log("Available capes:", capes);
        return capes;
    } catch (error) {
        console.error("Error fetching cape list:", error);
        return [];
    }
}
    
const capelist = await getcapelist();

// Build the cape selector
buildcapeselector(capelist);

async function getcapepreviews(capeId) {
    try {
        const res = await fetch(`/preview/capes/${capeId}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch preview for cape ${capeId}`);
        }
        const preview = await res.blob();
        return preview;
    } catch (error) {
        console.error(`Error fetching preview for cape ${capeId}:`, error);
        return null;
    }
}



async function getCapeMeta(capeId) {
    try {
        const res = await fetch(`/cape/meta/${capeId}`);
        if (!res.ok) throw new Error(`Failed to fetch metadata for cape ${capeId}`);
        return await res.json();
    } catch (error) {
        console.error(`Error fetching metadata for cape ${capeId}:`, error);
        return { category: "Hex", authorName: "Unknown", playerpermission: ["*"] };
    }
}

// Apply cape function
async function applyCape(newCapeId) {
    let response;
    try {

        response = await fetch('/change-cape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, capeId: newCapeId })
        });

        const result = await response.json();

        if (result.success) {
            // Update viewer
            viewer.loadCape(`/assets/capes/${String(newCapeId)}.png`);
            
            // Update history
            historyIndex++;
            capeHistory = capeHistory.slice(0, historyIndex);
            capeHistory.push(newCapeId);
            
            // Update cape highlight
            updateCapeHighlight();
            
            showPopup(`Cape updated to ${newCapeId} it may take 60 seconds to update in game`, "success", 2000);
        } else {
            showPopup(result.message || "Failed to update cape", "error", 3000);
        }
    } catch (error) {

        if (response && response.status === 401) {
            showTokenErrorModal();
        }
        console.error("Error applying cape:", error);
        showPopup("Error applying cape", "error", 3000);
    }
}

// Undo function
function undoCape() {
    if (historyIndex > 0) {
        historyIndex--;
        const prevCapeId = capeHistory[historyIndex];
        viewer.loadCape(`/assets/capes/${String(prevCapeId)}.png`);
        updateCapeHighlight();
        showPopup(`Undid to cape ${prevCapeId}`, "info", 2000);
    } else {
        showPopup("Nothing to undo", "warning", 2000);
    }
}

// Show cape preview modal
async function showCapePreview(capeId, preview, meta) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Cape preview title
    const title = document.createElement('h2');
    title.textContent = `Cape ${capeId}`;
    modalContent.appendChild(title);

    if (meta) {
        const authorEl = document.createElement('p');
        authorEl.style.cssText = 'margin: -8px 0 12px; color: #999; font-size: 13px;';
        authorEl.textContent = `@${meta.authorName || 'Unknown'}`;
        modalContent.appendChild(authorEl);
    }

    // Cape preview image
    if (preview) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(preview);
        modalContent.appendChild(img);
    }

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    // Apply button
    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Cape';
    applyBtn.className = 'modal-btn modal-btn-apply';
    applyBtn.onclick = () => {
        applyCape(capeId);
        document.body.removeChild(modal);
    };

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(applyBtn);
    buttonContainer.appendChild(cancelBtn);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);

    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
}

// Update cape highlight in selector
function updateCapeHighlight() {
    const selectorContainer = document.getElementById('cape-selector');
    if (!selectorContainer) return;

    const capeItems = selectorContainer.querySelectorAll('[data-cape-id]');
    const currentCapeId = String(capeHistory[historyIndex]);

    capeItems.forEach(item => {
        const capeId = item.getAttribute('data-cape-id');
        const capeIdLabel = item.querySelector('[data-cape-label]');

        if (capeId === currentCapeId) {
            item.style.background = '#14141e';
            item.style.borderColor = '#333';
            item.style.boxShadow = '';
            if (capeIdLabel) {
                capeIdLabel.style.color = '#58d8ff';
                capeIdLabel.style.fontWeight = 'bold';
            }
        } else {
            item.style.background = '#0a0a0e';
            item.style.borderColor = 'transparent';
            item.style.boxShadow = '';
            if (capeIdLabel) {
                capeIdLabel.style.color = '#666';
                capeIdLabel.style.fontWeight = '500';
            }
        }
    });
}

// Redo function
function redoCape() {
    if (historyIndex < capeHistory.length - 1) {
        historyIndex++;
        const nextCapeId = capeHistory[historyIndex];
        updateCapeHighlight();
        viewer.loadCape(`/assets/capes/${String(nextCapeId)}.png`);
        showPopup(`Redid to cape ${nextCapeId}`, "info", 2000);
    } else {
        showPopup("Nothing to redo", "warning", 2000);
    }
}

async function buildcapeselector(capelist) {
    const spinner = document.getElementById("loading-spinner");
    const spinnerIcon = spinner?.querySelector("i");
    let spinInterval;
    if (spinnerIcon) {
        let angle = 0;
        spinInterval = setInterval(() => {
            angle = (angle + 6) % 360;
            spinnerIcon.style.transform = `rotate(${angle}deg)`;
        }, 16);
    }

    const wrapperContainer = document.createElement('div');

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search capes by ID or author...';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'clear-btn';
    clearBtn.onclick = () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    };

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(clearBtn);
    wrapperContainer.appendChild(searchContainer);

    // Tab bar
    const tabOrder = ["All", "Hex", "Mojang", "Community", "Partner", "Staff"];
    const tabBar = document.createElement('div');
    tabBar.className = 'tab-bar';

    const tabButtons = {};
    for (const tab of tabOrder) {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (tab === "All" ? ' active' : '');
        btn.textContent = tab;
        btn.setAttribute('data-tab', tab.toLowerCase());
        tabBar.appendChild(btn);
        tabButtons[tab.toLowerCase()] = btn;
    }
    wrapperContainer.appendChild(tabBar);

    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'cape-selector';

    let activeTab = 'all';

    function filterByTab(tab) {
        activeTab = tab;
        const capeItems = selectorContainer.querySelectorAll('[data-cape-id]');
        const searchTerm = searchInput.value.toLowerCase().trim();

        let visibleCount = 0;
        capeItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const matchesTab = tab === 'all' || category === tab;
            const searchable = item.getAttribute('data-searchable');
            const matchesSearch = !searchTerm || searchable.includes(searchTerm);

            if (matchesTab && matchesSearch) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        Object.values(tabButtons).forEach(btn => btn.classList.remove('active'));
        if (tabButtons[tab]) tabButtons[tab].classList.add('active');

        const existing = selectorContainer.querySelector('[data-no-results]');
        if (existing) existing.remove();

        if (visibleCount === 0) {
            const noResults = document.createElement('div');
            noResults.setAttribute('data-no-results', 'true');
            noResults.textContent = 'no capes found :(';
            noResults.style.cssText = `
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem 1rem;
                color: var(--text-muted);
                font-size: 0.95rem;
            `;
            selectorContainer.appendChild(noResults);
        }
    }

    for (const btn of tabBar.querySelectorAll('.tab-btn')) {
        btn.addEventListener('click', () => {
            filterByTab(btn.getAttribute('data-tab'));
        });
    }

    searchInput.addEventListener('input', () => {
        filterByTab(activeTab);
    });

    wrapperContainer.appendChild(selectorContainer);

    const targetContainer = document.getElementById('cape-selector-wrapper');
    if (targetContainer) {
        targetContainer.replaceChildren(wrapperContainer);
    }

    let remaining = capelist.length;

    for (const capeId of capelist) {
        getCapeMeta(capeId).then(meta => {
            const isCurrentCape = String(capeId) === String(capeHistory[historyIndex]);
            const authorName = meta.authorName || 'Unknown';
            const cat = meta.category || 'Hex';

            const capeItemContainer = document.createElement('div');
            capeItemContainer.setAttribute('data-cape-id', capeId);
            capeItemContainer.setAttribute('data-searchable', `${capeId.toLowerCase()} ${authorName.toLowerCase()}`);
            capeItemContainer.setAttribute('data-category', cat.toLowerCase());
            capeItemContainer.style.background = isCurrentCape ? '#14141e' : '#0a0a0e';
            capeItemContainer.style.borderColor = isCurrentCape ? '#333' : 'transparent';

            const capeItem = document.createElement('div');
            capeItem.style.borderColor = '#1a1a24';
            capeItem.style.boxShadow = 'none';
            capeItem.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 12px;">Cape ${capeId}</div>`;

            const capeIdLabel = document.createElement('div');
            capeIdLabel.setAttribute('data-cape-label', 'true');
            capeIdLabel.innerHTML = `
                <span class="cape-number">${capeId}</span>
                <span class="cape-meta">@${authorName}</span>
            `;
            capeIdLabel.style.cssText = `
                color: ${isCurrentCape ? 'var(--accent)' : 'var(--text-secondary)'};
                font-weight: ${isCurrentCape ? 'bold' : '500'};
            `;

            capeItem.onclick = () => showCapePreview(capeId, null, meta);

            capeItemContainer.appendChild(capeItem);
            capeItemContainer.appendChild(capeIdLabel);
            selectorContainer.appendChild(capeItemContainer);

            filterByTab(activeTab);

            getcapepreviews(capeId).then(preview => {
                if (preview) {
                    capeItem.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(preview);
                    capeItem.appendChild(img);
                    capeItem.onclick = () => showCapePreview(capeId, preview, meta);
                }
            });
        }).finally(() => {
            remaining--;
            if (remaining === 0) {
                if (spinInterval) clearInterval(spinInterval);
                if (spinner) spinner.remove();
            }
        });
    }
}

function showSubmitSuccessPopup(capeId) {
    if (document.getElementById("submit-success-modal")) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "submit-success-modal";
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(6px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 24px;
    `;

    overlay.innerHTML = `
        <div style="
            width: min(100%, 440px);
            background: #111827;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 24px;
            color: white;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            font-family: sans-serif;
        ">
            <h2 style="
                margin: 0 0 12px;
                font-size: 22px;
            ">
                Cape uploaded successfully
            </h2>
            <p style="
                margin: 0 0 18px;
                color: #d1d5db;
                line-height: 1.6;
            ">
                Your new cape ID is:
            </p>
            <div style="
                display: inline-block;
                background: rgba(37, 99, 235, 0.16);
                border: 1px solid rgba(59, 130, 246, 0.4);
                color: #93c5fd;
                border-radius: 12px;
                padding: 12px 16px;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 0.08em;
                margin-bottom: 18px;
            ">
                ${capeId}
            </div>
            <p style="
                margin: 0 0 20px;
                color: #9ca3af;
                line-height: 1.5;
                font-size: 14px;
            ">
                The cape library has been refreshed.
                Now go and select your new cape from the selector!
            </p>
            <button
                id="close-submit-success-modal"
                style="
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 12px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                "
            >
                OK
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("close-submit-success-modal").onclick = () => {
        overlay.remove();
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };
}

function setupUploadZone(zone, input, fileLabel) {
    const syncState = () => {
        const file = input.files?.[0];
        zone.classList.toggle("has-file", Boolean(file));
        fileLabel.textContent = file ? file.name : "No file selected yet";
    };

    zone.setAttribute("tabindex", "0");
    zone.setAttribute("role", "button");
    zone.setAttribute("aria-label", `${input.id} upload area`);

    zone.addEventListener("click", () => {
        input.click();
    });

    zone.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            input.click();
        }
    });

    input.addEventListener("change", syncState);

    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
        zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");

        const file = e.dataTransfer?.files?.[0];
        if (!file) return;

        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
        } catch (error) {
            console.error("Unable to assign dropped file:", error);
        }

        input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    syncState();
}

function openSubmitModal() {

    // Prevent duplicate modal
    if (document.getElementById("submit-modal")) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "submit-modal";

    overlay.className = "submit-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "submit-modal";

    modal.innerHTML = `
        <div class="submit-modal-header">
            <h2>
                Submit Cape
            </h2>

            <button
                id="close-submit-modal"
                class="submit-modal-close"
                aria-label="Close submit modal"
            >
                ✕
            </button>
        </div>

        <div class="submit-modal-body">
            <div class="upload-zone" data-upload-zone="cape-texture-input">
                <input
                    id="cape-texture-input"
                    type="file"
                    accept=".png,image/png"
                >
                <div class="upload-zone-icon" aria-hidden="true">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <div class="upload-zone-content">
                    <div class="upload-zone-title">Cape Texture (.png)</div>
                    <div class="upload-zone-help">Drag and drop your cape texture here, or click to browse.</div>
                    <div class="upload-zone-file" data-file-label="cape-texture-input">No file selected yet</div>
                </div>
                <div class="upload-zone-badge">Required</div>
            </div>

            <div class="submit-field">
                <label class="submit-field-label" for="cape-category-select">Category</label>
                <select id="cape-category-select" class="submit-select">
                    <option value="Community">Community</option>
                    <option value="Partner">Partner</option>
                    <option value="Hex">Hex</option>
                    ${userData && userData.permissionLvl >= 3 ? `
                    <option value="Staff">Staff</option>
                    <option value="Mojang">Mojang</option>
                    ` : ''}
                </select>
            </div>

            ${userData && userData.permissionLvl >= 2 ? `
            <div class="submit-field">
                <label class="submit-field-label" for="cape-id-input">Cape ID (Optional)</label>
                <input
                    id="cape-id-input"
                    type="text"
                    class="submit-input"
                    placeholder="Custom ID (e.g. my-cape)"
                >
                <div class="submit-field-hint">Leave empty for auto-generated ID.</div>
            </div>
            ` : ''}

            ${userData && userData.permissionLvl >= 3 ? `
            <div class="submit-field">
                <label class="submit-field-label" for="cape-author-input">Author Name (Optional)</label>
                <input
                    id="cape-author-input"
                    type="text"
                    class="submit-input"
                    placeholder="Custom author name"
                >
                <div class="submit-field-hint">Leave empty to use your IGN.</div>
            </div>
            ` : ''}

            <div class="submit-field">
                <label class="submit-field-label" for="cape-permission-input">Player Permissions</label>
                <input
                    id="cape-permission-input"
                    type="text"
                    class="submit-input"
                    placeholder='* (everyone) or space-separated IGNs, e.g. "Player1 Player2"'
                >
                <div class="submit-field-hint">Leave empty for no restrictions. Use * to allow everyone.</div>
            </div>

            <button
                id="submit-cape-btn"
                class="submit-cape-btn"
            >
                Upload Cape
            </button>

        </div>
    `;

    overlay.appendChild(modal);

    document.body.appendChild(overlay);

    // Close button
    document
        .getElementById("close-submit-modal")
        .onclick = () => {
            overlay.remove();
        };

    // Close when clicking outside
    overlay.onclick = (e) => {

        if (e.target === overlay) {
            overlay.remove();
        }
    };

    setupUploadZone(
        modal.querySelector('[data-upload-zone="cape-texture-input"]'),
        document.getElementById("cape-texture-input"),
        document.querySelector('[data-file-label="cape-texture-input"]')
    );

    // Upload logic
    document
        .getElementById("submit-cape-btn")
        .onclick = async () => {

            const textureFile =
                document.getElementById(
                    "cape-texture-input"
                ).files[0];

            if (!textureFile) {
                showPopup(
                    "Cape texture is required",
                    "warning",
                    3000
                );

                return;
            }

            if (!textureFile.type || textureFile.type !== "image/png") {
                showPopup(
                    "Cape texture must be a PNG file",
                    "error",
                    3000
                );

                return;
            }

            const category = document.getElementById("cape-category-select").value;
            const permissionRaw = document.getElementById("cape-permission-input").value.trim();
            let playerpermission;
            if (!permissionRaw || permissionRaw === "*") {
                playerpermission = ["*"];
            } else {
                playerpermission = permissionRaw.split(/\s+/).filter(s => s.length > 0);
            }

            const formData = new FormData();

            formData.append(
                "capeTexture",
                textureFile
            );

            formData.append("category", category);
            for (const p of playerpermission) {
                formData.append("playerpermission[]", p);
            }

            const capeIdInput = document.getElementById("cape-id-input");
            if (capeIdInput && capeIdInput.value.trim()) {
                formData.append("capeId", capeIdInput.value.trim());
            }

            const authorInput = document.getElementById("cape-author-input");
            if (authorInput && authorInput.value.trim()) {
                formData.append("authorName", authorInput.value.trim());
            }

            const submitBtn = document.getElementById("submit-cape-btn");
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

            try {

                const response = await fetch(
                    "/upload-cape",
                    {
                        method: "POST",
                        headers: {
                            "token": token
                        },
                        body: formData
                    }
                );

                const data =
                    await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Failed to upload cape");
                }

                overlay.remove();
                showSubmitSuccessPopup(data.capeId);

                try {
                    const refreshedCapelist = await getcapelist();
                    await buildcapeselector(refreshedCapelist);
                } catch (refreshError) {
                    console.error("Error refreshing cape list:", refreshError);
                    showPopup(
                        "Cape uploaded, but the cape list could not be refreshed",
                        "warning",
                        3000
                    );
                }

            } catch (error) {

                console.error(error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                showPopup(
                    error.message || "Failed to upload cape",
                    "error",
                    3000
                );
            }
        };
}

const submitBtns = document.querySelectorAll('.header-btn');
for (const btn of submitBtns) {
    if (btn.textContent.includes('Submit Cape')) {
        btn.onclick = openSubmitModal;
        break;
    }
}

