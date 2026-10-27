/**
 * EA SPORTS FC Squad Updater
 * Dynamic console guide rendering, multi-title support (FC 27 - FC 24), and client-side conversion.
 */

(function () {
    // Game Titles Database
    const FC_TITLES = {
        fc27: {
            id: 'fc27',
            title: 'EA SPORTS FC 27',
            short: 'FC 27',
            num: '27',
            rosterDate: 'Oct 2026',
            pcSource: 'Squads20261006000000',
            pcDownloadName: 'Squads20261006000000',
            fileSize: '10.8 MB',
            pcPath: '%USERPROFILE%\\AppData\\Local\\EA SPORTS FC 27\\settings',
            pcAltPath: '%USERPROFILE%\\Documents\\FC 27\\settings'
        },
        fc26: {
            id: 'fc26',
            title: 'EA SPORTS FC 26',
            short: 'FC 26',
            num: '26',
            rosterDate: 'Jul 2026',
            pcSource: 'Squads_fc26_20260723000000',
            pcDownloadName: 'Squads20260723000000',
            fileSize: '10.5 MB',
            pcPath: '%USERPROFILE%\\AppData\\Local\\EA SPORTS FC 26\\settings',
            pcAltPath: '%USERPROFILE%\\Documents\\FC 26\\settings'
        },
        fc25: {
            id: 'fc25',
            title: 'EA SPORTS FC 25',
            short: 'FC 25',
            num: '25',
            rosterDate: 'Jul 2025',
            pcSource: 'Squads_fc25_20250717000000',
            pcDownloadName: 'Squads20250717000000',
            fileSize: '10.3 MB',
            pcPath: '%USERPROFILE%\\AppData\\Local\\EA SPORTS FC 25\\settings',
            pcAltPath: '%USERPROFILE%\\Documents\\FC 25\\settings'
        },
        fc24: {
            id: 'fc24',
            title: 'EA SPORTS FC 24',
            short: 'FC 24',
            num: '24',
            rosterDate: 'Sep 2024',
            pcSource: 'Squads_fc24_20240903000000',
            pcDownloadName: 'Squads20240903000000',
            fileSize: '10.1 MB',
            pcPath: '%USERPROFILE%\\AppData\\Local\\EA SPORTS FC 24\\settings',
            pcAltPath: '%USERPROFILE%\\Documents\\FC 24\\settings'
        }
    };

    // State
    let currentTitleKey = 'fc27';
    let currentPlatform = 'pc';

    // DOM Elements
    const titleSelect = document.getElementById('game-title-select');
    const headerTitleNum = document.getElementById('header-game-title');
    const headerRosterTag = document.getElementById('header-roster-tag');
    const statusTitleName = document.getElementById('status-title-name');

    const platBtns = document.querySelectorAll('.plat-btn');
    const downloadBtn = document.getElementById('btn-download-squad');
    const btnFileMeta = document.getElementById('btn-file-meta');
    const downloadStatus = document.getElementById('download-status');

    const guideHeaderTitle = document.getElementById('guide-header-title');
    const guideHeaderSubtitle = document.getElementById('guide-header-subtitle');
    const stepsContainer = document.getElementById('steps-container');

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const btnBrowse = document.getElementById('btn-browse');
    const toast = document.getElementById('toast');

    // ==========================================================================
    // Initialization
    // ==========================================================================

    document.addEventListener('DOMContentLoaded', () => {
        initTitleSelector();
        initPlatformSelector();
        initDownloadButton();
        initDropzone();
        renderGuideSteps();
    });

    // ==========================================================================
    // Title Selector (FC 27 - FC 24)
    // ==========================================================================

    /**
     * Extracts and formats the 8-digit date (YYYYMMDD) directly from the squad file name.
     * e.g. "Squads20261006000000" -> "Oct 06, 2026"
     * e.g. "Squads20250717000000" -> "Jul 17, 2025"
     */
    function extractDateFromSquadName(filename) {
        if (!filename) return 'Latest';
        const match = filename.match(/(\d{4})(\d{2})(\d{2})/);
        if (!match) return 'Latest';

        const year = match[1];
        const month = match[2];
        const day = match[3];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(month, 10) - 1;
        const monthName = months[monthIndex] || month;

        return `${monthName} ${day}, ${year}`;
    }

    function updateTitleAndRosterDisplay() {
        const currentTitle = FC_TITLES[currentTitleKey];
        const extractedDate = extractDateFromSquadName(currentTitle.pcDownloadName);

        if (headerTitleNum) headerTitleNum.textContent = currentTitle.num;
        if (headerRosterTag) headerRosterTag.textContent = `Roster: ${extractedDate}`;
        if (statusTitleName) statusTitleName.textContent = currentTitle.short;
    }

    // ==========================================================================
    // Title Selector (FC 27 - FC 24)
    // ==========================================================================

    function initTitleSelector() {
        if (!titleSelect) return;

        titleSelect.addEventListener('change', () => {
            currentTitleKey = titleSelect.value;
            const currentTitle = FC_TITLES[currentTitleKey];

            updateTitleAndRosterDisplay();
            updateDownloadButtonMeta();
            renderGuideSteps();
            showToast(`Switched to ${currentTitle.title}`);
        });

        // Initialize header display
        updateTitleAndRosterDisplay();
    }

    // ==========================================================================
    // Platform Selector (PC, PS5, Xbox, Switch)
    // ==========================================================================

    function initPlatformSelector() {
        platBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                platBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                currentPlatform = btn.getAttribute('data-platform');
                updateDownloadButtonMeta();
                renderGuideSteps();
            });
        });
    }

    function getActiveDownloadInfo() {
        const title = FC_TITLES[currentTitleKey];

        if (currentPlatform === 'pc') {
            return {
                sourceFile: title.pcSource,
                downloadFilename: title.pcDownloadName,
                metaText: `${title.pcDownloadName} • ${title.fileSize}`
            };
        } else if (currentPlatform === 'ps5') {
            return {
                sourceFile: 'Squads20261006000000_PS5',
                downloadFilename: `${title.pcDownloadName}_PS5`,
                metaText: `${title.pcDownloadName}_PS5 • ${title.fileSize}`
            };
        } else if (currentPlatform === 'xbox') {
            return {
                sourceFile: 'Squads20261006000000_XBSX',
                downloadFilename: `${title.pcDownloadName}_XBSX`,
                metaText: `${title.pcDownloadName}_XBSX • ${title.fileSize}`
            };
        } else {
            return {
                sourceFile: 'Squads20261006000000_Switch',
                downloadFilename: `${title.pcDownloadName}_Switch`,
                metaText: `${title.pcDownloadName}_Switch • ${title.fileSize}`
            };
        }
    }

    function updateDownloadButtonMeta() {
        const info = getActiveDownloadInfo();
        const extractedDate = extractDateFromSquadName(info.downloadFilename);
        if (btnFileMeta) btnFileMeta.textContent = `${info.downloadFilename} • ${extractedDate} • ${FC_TITLES[currentTitleKey].fileSize}`;
        if (downloadStatus) {
            const platLabel = currentPlatform === 'pc' ? 'PC' : currentPlatform.toUpperCase();
            downloadStatus.innerHTML = `Ready to download roster for <strong>${FC_TITLES[currentTitleKey].short} (${platLabel})</strong> • Roster Date: <strong>${extractedDate}</strong>.`;
        }
    }

    // ==========================================================================
    // Dynamic Guide Steps for Each Console
    // ==========================================================================

    function renderGuideSteps() {
        const title = FC_TITLES[currentTitleKey];
        const info = getActiveDownloadInfo();

        if (currentPlatform === 'pc') {
            renderPCGuide(title, info);
        } else if (currentPlatform === 'ps5') {
            renderPS5Guide(title, info);
        } else if (currentPlatform === 'xbox') {
            renderXboxGuide(title, info);
        } else if (currentPlatform === 'switch') {
            renderSwitchGuide(title, info);
        }

        bindCopyButtons();
    }

    function renderPCGuide(title, info) {
        if (guideHeaderTitle) guideHeaderTitle.textContent = `Import Instructions (PC Windows)`;
        if (guideHeaderSubtitle) guideHeaderSubtitle.textContent = `Follow these 4 simple steps to install and activate your squad in ${title.short}.`;

        stepsContainer.innerHTML = `
            <!-- Step 1 -->
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-details">
                    <h3>Download Squad File</h3>
                    <p>Download <code class="code-badge">${info.downloadFilename}</code> using the button on the left.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-details">
                    <h3>Paste into ${title.short} Settings Directory</h3>
                    <p>Press <kbd>Win + R</kbd>, paste this directory, and press Enter:</p>
                    <div class="path-box">
                        <code>${title.pcPath}</code>
                        <button class="btn-copy-action" data-copy="${title.pcPath}">
                            <span>📋</span> Copy Path
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-details">
                    <h3>Load Squads in ${title.short}</h3>
                    <p>Launch ${title.short} ➡️ <strong>Settings / Customize</strong> ➡️ <strong>Profile</strong> ➡️ <strong>Load Squads</strong> ➡️ Select <strong><code>EA_Squads...</code></strong></p>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-details">
                    <h3>Career Mode & Kick Off Tips</h3>
                    <ul class="step-list">
                        <li><strong>Career Mode:</strong> Choose <strong>"Use Current Squads"</strong> <span class="warn-text">(Never "Download Latest")</span>.</li>
                        <li><strong>Kick Off:</strong> Press <kbd>Y</kbd> (Xbox) or <kbd>Triangle</kbd> (PS) in team select to turn <strong>Live Form OFF</strong>.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    function renderPS5Guide(title, info) {
        if (guideHeaderTitle) guideHeaderTitle.textContent = `Import Instructions (PlayStation 5 & PS4)`;
        if (guideHeaderSubtitle) guideHeaderSubtitle.textContent = `Steps for PlayStation consoles and USB save transfer tools.`;

        stepsContainer.innerHTML = `
            <!-- Step 1 -->
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-details">
                    <h3>Download Console Save File</h3>
                    <p>Click download to get the formatted save package <code class="code-badge">${info.downloadFilename}</code>.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-details">
                    <h3>Prepare USB Drive & PSN Account Resign</h3>
                    <p>Format USB as <strong>exFAT</strong> or <strong>FAT32</strong>. PS saves are encrypted to your PSN account:</p>
                    <ul class="step-list">
                        <li>Use <strong>Apollo Save Tool</strong> (PS4 / Jailbroken PS5) or Save Wizard to decrypt and resign the squad file to your account ID.</li>
                        <li>Place resigned save in <code>/PS4/SAVEDATA/&lt;AccountID&gt;/</code> on your USB drive.</li>
                    </ul>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-details">
                    <h3>Transfer to Console Storage</h3>
                    <p>Plug USB into console ➡️ Go to <strong>Settings ➡️ Saved Data ➡️ USB Drive</strong> ➡️ Copy to Console Storage.</p>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-details">
                    <h3>Load in ${title.short} & Turn Off Live Form</h3>
                    <p>Open ${title.short} ➡️ <strong>Customize ➡️ Profile ➡️ Load Squads</strong>. On Kick Off team select, press <kbd>Triangle</kbd> to turn <strong>Live Form OFF</strong>.</p>
                </div>
            </div>
        `;
    }

    function renderXboxGuide(title, info) {
        if (guideHeaderTitle) guideHeaderTitle.textContent = `Import Instructions (Xbox Series X|S & Xbox One)`;
        if (guideHeaderSubtitle) guideHeaderSubtitle.textContent = `How roster updates and cloud save sync work on Xbox.`;

        stepsContainer.innerHTML = `
            <!-- Step 1 -->
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-details">
                    <h3>Download Xbox Save Package</h3>
                    <p>Download <code class="code-badge">${info.downloadFilename}</code> for your Xbox offline backup.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-details">
                    <h3>Xbox Live Cloud & Roster Sync</h3>
                    <p>Retail Xbox consoles sandbox save files via Xbox Live Cloud Storage. To apply roster updates in-game:</p>
                    <ul class="step-list">
                        <li>Open ${title.short} on your Xbox.</li>
                        <li>Navigate to <strong>Settings ➡️ Edit Teams ➡️ Download Updates</strong> to sync the latest EA database.</li>
                    </ul>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-details">
                    <h3>Verify Active Squad in Profile</h3>
                    <p>Go to <strong>Settings / Customize ➡️ Profile ➡️ Load Squads</strong> to ensure the loaded squad file is active in memory.</p>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-details">
                    <h3>Career Mode & Matchday Precautions</h3>
                    <p>When starting Career Mode, select <strong>"Use Current Squads"</strong>. In Kick Off, press <kbd>Y</kbd> to disable <strong>Live Form</strong> so EA servers don't override your squads.</p>
                </div>
            </div>
        `;
    }

    function renderSwitchGuide(title, info) {
        if (guideHeaderTitle) guideHeaderTitle.textContent = `Import Instructions (Nintendo Switch)`;
        if (guideHeaderSubtitle) guideHeaderSubtitle.textContent = `Simple SD card injection for Nintendo Switch using JKSV.`;

        stepsContainer.innerHTML = `
            <!-- Step 1 -->
            <div class="step-card">
                <div class="step-number">1</div>
                <div class="step-details">
                    <h3>Download Switch Squad File</h3>
                    <p>Click download to save the Switch-formatted <code class="code-badge">${info.downloadFilename}</code>.</p>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
                <div class="step-number">2</div>
                <div class="step-details">
                    <h3>Backup Existing Save via JKSV</h3>
                    <p>On your Switch (CFW), launch homebrew app <strong>JKSV</strong> ➡️ Select <strong>${title.short}</strong> ➡️ Create a new backup on SD card.</p>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
                <div class="step-number">3</div>
                <div class="step-details">
                    <h3>Copy Squad File to SD Card</h3>
                    <p>Mount SD card or connect via FTP. Paste the squad file into:</p>
                    <div class="path-box">
                        <code>/JKSV/${title.short}/&lt;YourBackup&gt;/</code>
                    </div>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step-card">
                <div class="step-number">4</div>
                <div class="step-details">
                    <h3>Restore Save & Load In-Game</h3>
                    <p>In JKSV, select your backup and choose <strong>Restore Save</strong>. Launch ${title.short} ➡️ <strong>Customize ➡️ Profile ➡️ Load Squads</strong>.</p>
                </div>
            </div>
        `;
    }

    function bindCopyButtons() {
        document.querySelectorAll('.btn-copy-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-copy');
                if (!text) return;

                navigator.clipboard.writeText(text).then(() => {
                    const orig = btn.innerHTML;
                    btn.innerHTML = `<span>✓</span> Copied!`;
                    btn.style.borderColor = 'var(--neon-green)';
                    btn.style.color = 'var(--neon-green)';

                    setTimeout(() => {
                        btn.innerHTML = orig;
                        btn.style.borderColor = '';
                        btn.style.color = '';
                    }, 2000);

                    showToast(`Path copied to clipboard!`);
                }).catch(() => {
                    showToast(`Failed to copy path automatically.`, true);
                });
            });
        });
    }

    // ==========================================================================
    // 1-Click Instant Download
    // ==========================================================================

    function initDownloadButton() {
        if (!downloadBtn) return;

        downloadBtn.addEventListener('click', () => {
            const info = getActiveDownloadInfo();
            const filePath = `downloads/${info.sourceFile}`;

            try {
                const a = document.createElement('a');
                a.href = filePath;
                a.download = info.downloadFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                if (downloadStatus) {
                    downloadStatus.innerHTML = `✅ <strong>Downloaded ${info.downloadFilename}!</strong> Follow the steps on the right.`;
                }
                showToast(`Downloaded ${info.downloadFilename}!`);
            } catch (err) {
                console.error(err);
                if (downloadStatus) {
                    downloadStatus.textContent = `Download notice: File could not be retrieved directly.`;
                }
            }
        });
    }

    // ==========================================================================
    // Drag & Drop Local Converter (.bin -> Squads...)
    // ==========================================================================

    function initDropzone() {
        if (!dropzone || !fileInput) return;

        dropzone.addEventListener('click', () => fileInput.click());

        if (btnBrowse) {
            btnBrowse.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });
        }

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                processLocalFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processLocalFile(e.target.files[0]);
            }
        });
    }

    async function processLocalFile(file) {
        if (!file) return;

        try {
            if (downloadStatus) downloadStatus.textContent = `Decompressing ${file.name}...`;

            const buffer = await file.arrayBuffer();
            const rawBytes = new Uint8Array(buffer);

            let decompressedBytes;
            // Check if already extracted (starts with 'DB\0\x08')
            if (rawBytes.length > 4 && rawBytes[0] === 0x44 && rawBytes[1] === 0x42 && rawBytes[2] === 0x00 && rawBytes[3] === 0x08) {
                decompressedBytes = rawBytes;
            } else if (window.unpackRefpack) {
                const unpacked = window.unpackRefpack(rawBytes);
                decompressedBytes = unpacked.outbuf;
            } else {
                throw new Error('RefPack decompressor module not found.');
            }

            // Extract date or fallback
            const match = file.name.match(/(?:squads|futsquads)_([0-9]{8})/i);
            const datePart = match ? match[1] : '20261006';
            const isFut = file.name.toLowerCase().includes('fut');
            const outputFilename = isFut ? `FutSquads${datePart}000000` : `Squads${datePart}000000`;

            const saveBytes = window.buildSquadFile(decompressedBytes, outputFilename, "JanavDua7", isFut);

            // Download converted save
            const blob = new Blob([saveBytes], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = outputFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 4000);

            const extractedRosterDate = extractDateFromSquadName(outputFilename);
            if (headerRosterTag) headerRosterTag.textContent = `Roster: ${extractedRosterDate}`;

            if (downloadStatus) {
                downloadStatus.innerHTML = `✅ Converted & downloaded <strong>${outputFilename}</strong> (Date: <strong>${extractedRosterDate}</strong>)!`;
            }
            showToast(`Converted & downloaded ${outputFilename}!`);
        } catch (err) {
            console.error(err);
            if (downloadStatus) downloadStatus.textContent = `Error: ${err.message}`;
            showToast(`Error: ${err.message}`, true);
        }
    }

    // ==========================================================================
    // Toast Notification
    // ==========================================================================

    let toastTimer = null;

    function showToast(msg, isError = false) {
        if (!toast) return;

        toast.textContent = msg;
        toast.style.borderColor = isError ? '#ff4a6e' : 'var(--neon-green)';
        toast.classList.add('show');

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
})();
