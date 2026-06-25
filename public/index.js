// History for undo/redo
let capeHistory = [];
let historyIndex = 0;

// popup
function showPopup(message, type, duration) {
  const colors = {
    success: { border: '#58d8ff', icon: '✓' },
    error:   { border: '#e14c55', icon: '✕' },
    warning: { border: '#e63030', icon: '⚠' },
    info:    { border: '#7f5cff', icon: 'ℹ' },
  };

  const { border, icon } = colors[type] || colors.info;

  const popup = document.createElement('div');
  popup.className = `popup ${type}`;
  popup.style.borderLeftColor = border;
  popup.style.zIndex = '10001';
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
    steps.style.cssText = 'margin: 1.5rem 0; color: #ccc; line-height: 1.8; list-style: none; padding-left: 0;';
    
const stepTexts = [
    '<i class="fa-brands fa-discord"></i> Join the Hex Discord server.',
    '<i class="fa-solid fa-hashtag"></i> Open <a class="cmd-link" href="https://discord.com/channels/1387030831142277240/1510559775107055726" target="_blank">#cmd</a>.',
    '<i class="fa-solid fa-user-plus"></i> Run <code>/register &lt;ign&gt; &lt;acctype&gt;</code>.',
    '<i class="fa-solid fa-right-to-bracket"></i> Run <code>/login</code> and open the login link.',
    '<i class="fa-solid fa-download"></i> If you haven\'t installed the Hex mod yet, download it from <a class="cmd-link" href="https://modrinth.com/mod/hex-capes" target="_blank">Modrinth</a>.',
    '<i class="fa-solid fa-shirt"></i> Upload, manage, and equip your capes from the Hex dashboard.',
    '<i class="fa-solid fa-rocket"></i> Launch Minecraft and enjoy your cape <i class="fa-solid fa-crown"></i>.',
    'Already have an account? then click <a href="https://dash.hexcapes.qzz.io/?token=login_error_modal">here</a>.'
];
    stepTexts.forEach(html => {
        const li = document.createElement('li');
        li.innerHTML = html;
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

    const linkStyle = document.createElement('style');
    linkStyle.textContent = `.cmd-link { display: inline-block; background: rgba(88, 101, 242, .25); border: 1px solid rgba(88, 101, 242, .5); color: #8be0ff; border-radius: 4px; padding: 2px 4px; text-decoration: none; font-size: 12px; }`;
    modalContent.appendChild(linkStyle);

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
}

// Show modal for invalid/expired token - prompts user to login
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = '10000';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.maxWidth = '500px';

    const title = document.createElement('h2');
    title.textContent = 'Login Required';
    title.style.color = '#e14c55';
    modalContent.appendChild(title);

    const description = document.createElement('p');
    description.textContent = 'Your session has expired or the token is invalid. Please login again to continue.';
    description.style.cssText = 'margin: 1rem 0; color: #999;';
    modalContent.appendChild(description);

    const steps = document.createElement('ol');
    steps.style.cssText = 'margin: 1.5rem 0; color: #ccc; line-height: 1.8; list-style: none; padding-left: 0;';

    const stepTexts = [
        '<i class="fa-brands fa-discord"></i> Go to <a class="cmd-link" href="https://discord.com/channels/1387030831142277240/1510559775107055726" target="_blank">#cmd</a> in the Hex Discord',
        '<i class="fa-solid fa-hashtag"></i> Type <code>/login</code> to get a new token',
        '<i class="fa-solid fa-arrow-right"></i> Click the new link provided by the bot'
    ];

    stepTexts.forEach(html => {
        const li = document.createElement('li');
        li.innerHTML = html;
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

    const linkStyle = document.createElement('style');
    linkStyle.textContent = `.cmd-link { display: inline-block; background: rgba(88, 101, 242, .25); border: 1px solid rgba(88, 101, 242, .5); color: #8be0ff; border-radius: 4px; padding: 2px 4px; text-decoration: none; font-size: 12px; }`;
    modalContent.appendChild(linkStyle);

    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };

    document.body.appendChild(modal);
}

document.getElementById('how-to-use-btn').addEventListener('click', showTokenErrorModal);

const params = new URLSearchParams(window.location.search);
const urlToken = params.get("token");
const previewId = params.get("previewId");

let token = null;
let userData = null;

const COOKIE_NAME = 'hex_token';

function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

async function validateTokenOnServer(tok) {
    try {
        const response = await fetch(`/profile/meta/${tok}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.error ? null : data;
    } catch {
        return null;
    }
}

async function init() {
    const cookieToken = getCookie(COOKIE_NAME);

    if (urlToken) {
        const urlUserData = await validateTokenOnServer(urlToken);
        if (urlUserData) {
            token = urlToken;
            userData = urlUserData;
            setCookie(COOKIE_NAME, urlToken, 3);
            return;
        }
    }

    if (cookieToken) {
        const cookieUserData = await validateTokenOnServer(cookieToken);
        if (cookieUserData) {
            token = cookieToken;
            userData = cookieUserData;
            return;
        }
        if (!urlToken) {
            showLoginModal();
        }
        return;
    }

    if (urlToken) {
        showLoginModal();
    } else {
        showTokenErrorModal();
    }
}

await init();

if (!userData) {
    console.warn("No session data, running without personalization");
}

const discordid = userData?.userId ?? null;
const ign = userData?.ign ?? null;
const capeId = userData?.capeid ?? null;

if (!ign || !capeId) {
    console.warn("Incomplete session data, running without personalization");
}

// Initialize cape history with current cape
capeHistory = [capeId];

// Favorites state
let favorites = userData?.favorites || [];

async function addFavorite(capeId) {
    const response = await fetch('/fav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, capeId })
    });
    return await response.json();
}

async function removeFavorite(capeId) {
    const response = await fetch('/fav', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, capeId })
    });
    return await response.json();
}

function isFavorite(capeId) {
    return favorites.includes(capeId);
}

function toggleFavorite(capeId) {
    const idx = favorites.indexOf(capeId);
    if (idx === -1) {
        favorites.push(capeId);
    } else {
        favorites.splice(idx, 1);
    }
}

async function getSkinUrl(ign) {
    const hexUrl = `/assets/skins/${ign}.png`;

    try {
        const response = await fetch(hexUrl, {
            method: "GET"
        });

        if (response.ok) {
            return hexUrl;
        }
    } catch {}

    return `https://minotar.net/skin/${ign}`;
}
const skinurl = await getSkinUrl(ign)

const viewer = (ign && capeId)
    ? new skinview3d.SkinViewer({
        canvas: document.getElementById("skin_container"),
        width: 280,
        height: 490,
        skin: skinurl,
        cape: `/assets/capes/${capeId}.png`
    })
    : null;

document.getElementById("skin_container")?.addEventListener('wheel', (e) => {
    e.preventDefault();
}, { passive: false });

if (viewer) {
    viewer.controls.enableZoom = false;
    viewer.animation = new skinview3d.IdleAnimation();
    viewer.playerObject.rotation.y = -158 * Math.PI / 180;
}   


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

if (ign && capeId) {
    updateviewerinfo(capeId, ign, discordid);
}

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
            if (viewer) {
                viewer.loadCape(`/assets/capes/${String(newCapeId)}.png`);
            }

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
        if (viewer) {
            viewer.loadCape(`/assets/capes/${String(prevCapeId)}.png`);
        }
        updateCapeHighlight();
        showPopup(`Undid to cape ${prevCapeId}`, "info", 2000);
    } else {
        showPopup("Nothing to undo", "warning", 2000);
    }
}

// Show cape preview modal
async function showCapePreview(capeId, preview, meta) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const title = document.createElement('h2');
    title.textContent = `Cape ${capeId}`;
    modalContent.appendChild(title);

    if (meta) {
        const authorEl = document.createElement('p');
        authorEl.style.cssText = 'margin: -8px 0 12px; color: #999; font-size: 13px;';
        authorEl.textContent = `@${meta.authorName || 'Unknown'}`;
        modalContent.appendChild(authorEl);
    }

    // Preview image (shown by default)
    const previewImg = document.createElement('img');
    modalContent.appendChild(previewImg);

    // 3D canvas (hidden by default)
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = 280;
    previewCanvas.height = 400;
    previewCanvas.style.cssText = 'width: 100%; max-width: 280px; margin: 0 auto; border-radius: 12px; display: none;';
    modalContent.appendChild(previewCanvas);

    // View toggle
    const toggleContainer = document.createElement('div');
    toggleContainer.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px;';

    const toggleLabel2d = document.createElement('span');
    toggleLabel2d.innerHTML = '<i class="fa-solid fa-image"></i>';
    toggleLabel2d.style.cssText = 'color: #999; font-size: 14px;';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'view-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle 3D view');
    toggleBtn.innerHTML = '<i class="fa-solid fa-toggle-off"></i>';
    toggleBtn.style.cssText = 'background: none; border: none; color: #666; font-size: 20px; cursor: pointer; display: inline-flex; align-items: center; transition: color 0.2s;';

    const toggleLabel3d = document.createElement('span');
    toggleLabel3d.innerHTML = '<i class="fa-solid fa-cube"></i>';
    toggleLabel3d.style.cssText = 'color: #666; font-size: 14px;';

    toggleContainer.appendChild(toggleLabel2d);
    toggleContainer.appendChild(toggleBtn);
    toggleContainer.appendChild(toggleLabel3d);
    modalContent.appendChild(toggleContainer);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const favBtn = document.createElement('button');
    const isFav = isFavorite(capeId);
    favBtn.innerHTML = isFav
        ? '<i class="fa-solid fa-heart"></i> Liked'
        : '<i class="fa-regular fa-heart"></i> Like';
    favBtn.className = 'modal-btn' + (isFav ? ' modal-btn-fav active' : ' modal-btn-fav');

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply Cape';
    applyBtn.className = 'modal-btn modal-btn-apply';

    const shareBtn = document.createElement('button');
    shareBtn.textContent = 'Share Cape';
    shareBtn.className = 'modal-btn modal-btn-cancle';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'modal-btn modal-btn-cancel';

    buttonContainer.appendChild(favBtn);
    buttonContainer.appendChild(applyBtn);
    buttonContainer.appendChild(shareBtn);
    buttonContainer.appendChild(cancelBtn);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Set preview image
    if (preview) {
        previewImg.src = URL.createObjectURL(preview);
    } else {
        getcapepreviews(capeId).then(fetchedPreview => {
            if (fetchedPreview && !disposed) {
                previewImg.src = URL.createObjectURL(fetchedPreview);
            }
        });
    }

    let is3D = false;
    let previewViewer = null;
    let disposed = false;
    let viewerInitialized = false;

    const disposeViewer = () => {
        disposed = true;
        if (previewViewer) {
            previewViewer.animation = null;
            if (typeof previewViewer.dispose === 'function') {
                previewViewer.dispose();
            }
            previewViewer = null;
        }
    };

    // Pre-load 3D model immediately so it's ready when toggled
    (async () => {
        try {
            const previewSkinUrl = ign ? await getSkinUrl(ign) : 'https://minotar.net/skin/Steve';
            if (disposed) return;
            previewViewer = new skinview3d.SkinViewer({
                canvas: previewCanvas,
                width: 280,
                height: 400,
                skin: previewSkinUrl,
                cape: `/assets/capes/${capeId}.png`
            });
            previewViewer.controls.enableZoom = false;
            previewViewer.animation = new skinview3d.IdleAnimation();
            previewViewer.playerObject.rotation.y = -158 * Math.PI / 180;
            viewerInitialized = true;
        } catch (error) {
            console.error('Error loading 3D preview:', error);
        }
    })();

    modal.onclick = (e) => {
        if (e.target === modal) {
            disposeViewer();
            document.body.removeChild(modal);
        }
    };

    cancelBtn.onclick = () => {
        disposeViewer();
        document.body.removeChild(modal);
    };

    toggleBtn.onclick = async () => {
        is3D = !is3D;
        if (is3D) {
            toggleLabel2d.style.color = '#666';
            toggleLabel3d.style.color = '#999';
            toggleBtn.innerHTML = '<i class="fa-solid fa-toggle-on" style="color: #0f95ff;"></i>';
            previewImg.style.display = 'none';
            previewCanvas.style.display = '';
        } else {
            toggleLabel2d.style.color = '#999';
            toggleLabel3d.style.color = '#666';
            toggleBtn.innerHTML = '<i class="fa-solid fa-toggle-off"></i>';
            previewCanvas.style.display = 'none';
            previewImg.style.display = 'block';
        }
    };

    favBtn.onclick = async () => {
        const wasFav = isFavorite(capeId);
        if (wasFav) {
            const result = await removeFavorite(capeId);
            if (!result.success) {
                showPopup(result.message || 'Failed to remove favorite', 'error', 3000);
                return;
            }
        } else {
            const result = await addFavorite(capeId);
            if (!result.success) {
                showPopup(result.message || 'Failed to add favorite', 'error', 3000);
                return;
            }
        }
        toggleFavorite(capeId);
        favBtn.innerHTML = isFavorite(capeId)
            ? '<i class="fa-solid fa-heart"></i> Liked'
            : '<i class="fa-regular fa-heart"></i> Like';
        favBtn.classList.toggle('active');
        showPopup(wasFav ? 'Removed from favorites' : 'Added to favorites', 'success', 1500);

        const starBtn = document.querySelector(`[data-cape-id="${capeId}"] .fav-star`);
        if (starBtn) {
            starBtn.classList.toggle('active');
            starBtn.innerHTML = isFavorite(capeId)
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
        }
    };

    applyBtn.onclick = () => {
        disposeViewer();
        applyCape(capeId);
        document.body.removeChild(modal);
    };

    shareBtn.onclick = () => {
        navigator.clipboard.writeText("https://dash.hexcapes.qzz.io/?previewId=" + capeId).then(() => {
            showPopup("Cape link copied to clipboard!", "success", 2000);
        });
    };
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
        if (viewer) {
            viewer.loadCape(`/assets/capes/${String(nextCapeId)}.png`);
        }
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
    const tabOrder = ["All", "Favorites", "Hex", "Mojang", "Community", "Partner", "Staff"];
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
            const capeId = item.getAttribute('data-cape-id');
            let matchesTab;
            if (tab === 'all') {
                matchesTab = true;
            } else if (tab === 'favorites') {
                matchesTab = isFavorite(capeId);
            } else {
                matchesTab = category === tab;
            }
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
            capeItemContainer.style.position = 'relative';

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

            const favBtn = document.createElement('button');
            favBtn.className = 'fav-star' + (isFavorite(capeId) ? ' active' : '');
            favBtn.innerHTML = isFavorite(capeId)
                ? '<i class="fa-solid fa-heart"></i>'
                : '<i class="fa-regular fa-heart"></i>';
            favBtn.onclick = async (e) => {
                e.stopPropagation();
                const wasFav = isFavorite(capeId);
                if (wasFav) {
                    const result = await removeFavorite(capeId);
                    if (!result.success) {
                        showPopup(result.message || 'Failed to remove favorite', 'error', 3000);
                        return;
                    }
                } else {
                    const result = await addFavorite(capeId);
                    if (!result.success) {
                        showPopup(result.message || 'Failed to add favorite', 'error', 3000);
                        return;
                    }
                }
                toggleFavorite(capeId);
                favBtn.classList.toggle('active');
                favBtn.innerHTML = isFavorite(capeId)
                    ? '<i class="fa-solid fa-heart"></i>'
                    : '<i class="fa-regular fa-heart"></i>';
                showPopup(wasFav ? 'Removed from favorites' : 'Added to favorites', 'success', 1500);
                filterByTab(activeTab);
            };

            capeItemContainer.appendChild(favBtn);
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

function openSkinUploadModal() {
    if (document.getElementById("skin-upload-modal")) {
        return;
    }

    const overlay = document.createElement("div");
    overlay.id = "skin-upload-modal";
    overlay.className = "submit-modal-overlay";

    const modal = document.createElement("div");
    modal.className = "submit-modal";

    modal.innerHTML = `
        <div class="submit-modal-header">
            <h2>Upload Skin</h2>
            <button id="close-skin-upload-modal" class="submit-modal-close" aria-label="Close skin upload modal">✕</button>
        </div>
        <div class="submit-modal-body">
            <div class="upload-zone" data-upload-zone="skin-texture-input">
                <input id="skin-texture-input" type="file" accept=".png,image/png">
                <div class="upload-zone-icon" aria-hidden="true"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <div class="upload-zone-content">
                    <div class="upload-zone-title">Skin Texture (.png)</div>
                    <div class="upload-zone-help">Drag and drop your skin texture here, or click to browse.</div>
                    <div class="upload-zone-file" data-file-label="skin-texture-input">No file selected yet</div>
                </div>
                <div class="upload-zone-badge">Required</div>
            </div>
            <button id="upload-skin-btn" class="submit-cape-btn">Upload Skin</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById("close-skin-upload-modal").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    setupUploadZone(
        modal.querySelector('[data-upload-zone="skin-texture-input"]'),
        document.getElementById("skin-texture-input"),
        document.querySelector('[data-file-label="skin-texture-input"]')
    );

    document.getElementById("upload-skin-btn").onclick = async () => {
        const file = document.getElementById("skin-texture-input").files[0];
        if (!file) {
            showPopup("Skin texture is required", "warning", 3000);
            return;
        }
        if (!file.type || file.type !== "image/png") {
            showPopup("Skin texture must be a PNG file", "error", 3000);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const skinBase64 = e.target.result.split(",")[1];

            const btn = document.getElementById("upload-skin-btn");
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

            try {
                const res = await fetch("/assets/skins", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, skinBase64 })
                });

                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to upload skin");
                }

                overlay.remove();
                showPopup("Skin uploaded successfully! Reloading...", "success", 2000);
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                console.error(error);
                btn.disabled = false;
                btn.innerHTML = originalText;
                showPopup(error.message || "Failed to upload skin", "error", 3000);
            }
        };
        reader.readAsDataURL(file);
    };
}

const submitBtns = document.querySelectorAll('.header-btn');
for (const btn of submitBtns) {
    if (btn.textContent.includes('Submit Cape')) {
        btn.onclick = openSubmitModal;
        break;
    }
}

document.getElementById("skin-upload-btn")?.addEventListener("click", openSkinUploadModal);

const accountChip = document.getElementById('header-account-chip');
if (accountChip) {
    accountChip.addEventListener('click', () => showAccountInfoModal(token));
}

function getAccountRoleLabel(level) {
    if (level >= 4) return 'Admin';
    if (level >= 3) return 'Staff';
    if (level >= 2) return 'Partner';
    return 'Member';
}

async function showAccountInfoModal(currentToken) {
    const tokenToUse = typeof currentToken === 'string' && currentToken ? currentToken : token;
    if (!tokenToUse) {
        showLoginModal();
        return;
    }

    if (document.getElementById('account-info-modal')) {
        return;
    }

    let response;
    let userInfo;
    try {
        response = await fetch(`/accountdata/${encodeURIComponent(tokenToUse)}`);
        userInfo = await response.json();
    } catch (error) {
        console.error('Error fetching account info:', error);
        showPopup('Failed to fetch account info', 'error', 3000);
        return;
    }

    if (!userInfo || !userInfo.success) {
        if (response?.status === 401) {
            showLoginModal();
            return;
        }
        showPopup(userInfo?.message || 'Failed to fetch account info', 'error', 3000);
        return;
    }

    const avatarUrl = userInfo.ign
        ? `https://minotar.net/avatar/${encodeURIComponent(userInfo.ign)}`
        : 'https://minotar.net/avatar/Steve';
    const capePreviewUrl = userInfo.capeid ? `/assets/capes/${encodeURIComponent(userInfo.capeid)}.png` : null;
    const discordText = userInfo.discordTag || (userInfo.userId ? `<@${userInfo.userId}>` : 'Unknown');
    const roleLabel = getAccountRoleLabel(userInfo.permissionLvl ?? 0);
    const favoriteCount = Array.isArray(userInfo.favorites) ? userInfo.favorites.length : 0;
    const totalCapes = Array.isArray(userInfo.capes)
        ? userInfo.capes.length
        : typeof userInfo.capeCount === 'number'
            ? userInfo.capeCount
            : 0;

    const overlay = document.createElement('div');
    overlay.id = 'account-info-modal';
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '10000';
    overlay.style.padding = '24px';

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.cssText = `
        max-width: 900px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        background: #0b0b14;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 28px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.35);
        color: #e5e7eb;
    `;

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.gap = '16px';
    header.style.marginBottom = '20px';

    const avatar = document.createElement('div');
    avatar.style.width = '90px';
    avatar.style.height = '90px';
    avatar.style.borderRadius = '50%';
    avatar.style.backgroundImage = `url('${avatarUrl}')`;
    avatar.style.backgroundSize = 'cover';
    avatar.style.backgroundPosition = 'center';
    avatar.style.border = '2px solid rgba(88, 216, 255, 0.28)';
    avatar.style.flexShrink = '0';
    header.appendChild(avatar);

    const headerText = document.createElement('div');
    headerText.style.flex = '1 1 auto';

    const title = document.createElement('h2');
    title.textContent = userInfo.ign || 'Unknown Player';
    title.style.margin = '0 0 6px';
    title.style.fontSize = '24px';
    title.style.color = '#ffffff';

    const subtitle = document.createElement('p');
    subtitle.textContent = discordText;
    subtitle.style.margin = '0 0 8px';
    subtitle.style.color = '#9ca3af';

    const metaLine = document.createElement('p');
    metaLine.textContent = `${roleLabel} · ${userInfo.capeid ? `Equipped cape ${userInfo.capeid}` : 'No cape equipped'}`;
    metaLine.style.margin = '0';
    metaLine.style.color = '#8b98a8';
    metaLine.style.fontSize = '0.95rem';

    headerText.appendChild(title);
    headerText.appendChild(subtitle);
    headerText.appendChild(metaLine);
    header.appendChild(headerText);

    modal.appendChild(header);

    // Tab bar
    const tabBar = document.createElement('div');
    tabBar.style.cssText = 'display: flex; gap: 0; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);';

    const setActiveTab = (active) => {
        [profileTabBtn, capesTabBtn].forEach(b => {
            const isActive = b === active;
            b.dataset.active = String(isActive);
            b.style.color = isActive ? '#58d8ff' : '#666';
            b.style.borderBottomColor = isActive ? '#58d8ff' : 'transparent';
            b.style.fontWeight = isActive ? '600' : '500';
        });
        profileContainer.style.display = active === profileTabBtn ? '' : 'none';
        capesContainer.style.display = active === capesTabBtn ? '' : 'none';
        if (active === capesTabBtn && previewViewer) {
            disposeViewer();
        }
    };

    const profileTabBtn = document.createElement('button');
    profileTabBtn.textContent = 'Profile';
    profileTabBtn.style.cssText = 'padding: 8px 16px; background: none; border: none; color: #58d8ff; border-bottom: 2px solid #58d8ff; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;';
    profileTabBtn.onclick = () => setActiveTab(profileTabBtn);

    const capesTabBtn = document.createElement('button');
    capesTabBtn.textContent = `My Capes (${totalCapes})`;
    capesTabBtn.style.cssText = 'padding: 8px 16px; background: none; border: none; color: #666; border-bottom: 2px solid transparent; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;';
    capesTabBtn.onclick = () => setActiveTab(capesTabBtn);

    tabBar.appendChild(profileTabBtn);
    tabBar.appendChild(capesTabBtn);
    modal.appendChild(tabBar);

    // Profile tab content
    const profileContainer = document.createElement('div');

    const contentGrid = document.createElement('div');
    contentGrid.style.display = 'grid';
    contentGrid.style.gridTemplateColumns = capePreviewUrl ? '1fr 1fr' : '1fr';
    contentGrid.style.gap = '20px';
    contentGrid.style.marginBottom = '20px';

    let previewViewer = null;
    let disposeViewer = () => {};

    if (capePreviewUrl) {
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 400;
        previewCanvas.height = 500;
        previewCanvas.style.cssText = 'width: 100%; border-radius: 16px; min-height: 300px;';
        contentGrid.appendChild(previewCanvas);

        const PreviewSkinUrl = await getSkinUrl(userInfo.ign || 'Undefined');

        previewViewer = new skinview3d.SkinViewer({
            canvas: previewCanvas,
            width: 400,
            height: 500,
            skin: PreviewSkinUrl,
            cape: capePreviewUrl
        });
        previewViewer.controls.enableZoom = false;
        previewViewer.animation = new skinview3d.IdleAnimation();
        previewViewer.playerObject.rotation.y = -158 * Math.PI / 180;

        disposeViewer = () => {
            if (previewViewer) {
                previewViewer.animation = null;
                if (typeof previewViewer.dispose === 'function') {
                    previewViewer.dispose();
                }
                previewViewer = null;
            }
        };
    }

    const statsContainer = document.createElement('div');
    statsContainer.style.display = 'grid';
    statsContainer.style.gap = '10px';

    const statRows = [
        ['Discord ID', userInfo.userId || 'Unknown'],
        ['Favorites', String(favoriteCount)],
        ['Total capes', String(totalCapes)],
        ['Role', roleLabel],
        ['Current cape', userInfo.capeid ? String(userInfo.capeid) : 'None'],
    ];

    statRows.forEach(([label, value]) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.padding = '12px 14px';
        row.style.background = 'rgba(255,255,255,0.03)';
        row.style.border = '1px solid rgba(255,255,255,0.05)';
        row.style.borderRadius = '14px';

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        labelEl.style.color = '#9ca3af';
        labelEl.style.fontSize = '0.95rem';

        const valueEl = document.createElement('span');
        valueEl.textContent = value;
        valueEl.style.color = '#ffffff';
        valueEl.style.fontWeight = '600';
        valueEl.style.fontSize = '0.95rem';

        row.appendChild(labelEl);
        row.appendChild(valueEl);
        statsContainer.appendChild(row);
    });

    contentGrid.appendChild(statsContainer);
    profileContainer.appendChild(contentGrid);
    modal.appendChild(profileContainer);

    // My Capes tab content
    const capesContainer = document.createElement('div');
    capesContainer.style.display = 'none';

    const capes = Array.isArray(userInfo.capes) ? userInfo.capes : [];

    if (capes.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.textContent = 'You haven\'t created any capes yet.';
        emptyMsg.style.cssText = 'text-align: center; color: #666; padding: 2rem 0;';
        capesContainer.appendChild(emptyMsg);
    } else {
        const capesGrid = document.createElement('div');
        capesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;';

        for (const cape of capes) {
            const capeId = cape.id;
            const authorName = cape.authorName || 'Unknown';
            const cat = cape.category || 'Hex';

            const item = document.createElement('div');
            item.dataset.capeId = capeId;
            item.style.cssText = 'cursor: pointer; padding: 8px 4px; border-bottom: 1px solid rgba(255,255,255,0.05);';
            item.onmouseenter = () => { item.style.background = 'rgba(255,255,255,0.03)'; };
            item.onmouseleave = () => { item.style.background = 'transparent'; };
            item.onclick = async () => {
                const meta = await getCapeMeta(capeId);
                showCapePreview(capeId, null, meta);
            };

            const label = document.createElement('div');
            label.innerHTML = `
                <div style="color: #ccc; font-size: 14px; font-weight: 600; margin-bottom: 2px;">${capeId}</div>
                <div style="color: #666; font-size: 12px;">@${authorName}</div>
                <div style="color: #555; font-size: 11px; margin-top: 2px;">${cat}</div>
            `;

            item.appendChild(label);
            capesGrid.appendChild(item);
        }

        capesContainer.appendChild(capesGrid);

        // load preview images
        for (const cape of capes) {
            getcapepreviews(cape.id).then(preview => {
                if (!preview) return;
                const item = capesGrid.querySelector(`[data-cape-id="${cape.id}"]`);
                if (item) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(preview);
                    img.style.cssText = 'width: 100%; border-radius: 8px; margin-bottom: 8px;';
                    item.insertBefore(img, item.firstChild);
                }
            });
        }
    }

    modal.appendChild(capesContainer);

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'flex-end';
    buttons.style.gap = '10px';
    buttons.style.flexWrap = 'wrap';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.className = 'modal-btn modal-btn-cancel';
    closeButton.style.padding = '10px 16px';
    closeButton.style.border = '1px solid rgba(255,255,255,0.08)';
    closeButton.style.background = 'transparent';
    closeButton.style.color = '#d1d5db';
    closeButton.style.borderRadius = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => {
        disposeViewer();
        overlay.remove();
    };

    buttons.appendChild(closeButton);
    modal.appendChild(buttons);

    overlay.appendChild(modal);
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            disposeViewer();
            overlay.remove();
        }
    };
    document.body.appendChild(overlay);
}

if (previewId) {
    setTimeout(async () => {
        try {
            const [preview, meta] = await Promise.all([
                getcapepreviews(previewId),
                getCapeMeta(previewId)
            ]);
            showCapePreview(previewId, preview, meta);
        } catch (error) {
            console.error("Error loading preview:", error);
            showCapePreview(previewId, null, null);
        }
    }, );    
}