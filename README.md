# EA SPORTS FC™ Squad Updater

A modern, standalone, single-screen web application to download the latest official EA SPORTS FC squad updates and import them into your game across PC, PlayStation, Xbox, and Nintendo Switch.

Supports **EA SPORTS FC 27**, **FC 26**, **FC 25**, and **FC 24**.

---

## ⚡ Key Features

- **🌐 100% Client-Side & Standalone**: Runs directly in any modern browser (`Chrome`, `Edge`, `Firefox`, `Safari`) or via any static host (GitHub Pages, Vercel, Netlify).
- **🕹️ Multi-Title Selector**: Switch seamlessly between **EA SPORTS FC 27**, **FC 26**, **FC 25**, and **FC 24** via the header dropdown.
- **📅 Dynamic Roster Date Extraction**: Automatically extracts the 8-digit date string directly from squad file names (e.g., `Squads20261006000000` ➡️ `Oct 06, 2026`) and reflects it across the status pill, download button, and guide steps.
- **🎮 Console-Specific Import Guides**: Dynamic, step-by-step instructions that update instantly when switching between:
  - **PC Windows** (EA App, Steam, Epic Games)
  - **PlayStation 5 & PS4** (USB transfer & Apollo / Save Wizard resigning)
  - **Xbox Series X|S & Xbox One** (In-game roster sync & cloud saves)
  - **Nintendo Switch** (JKSV homebrew SD card restore)
- **📋 1-Click Directory Copy**: Instant clipboard copy with visual confirmation for the game's settings folder path.
- **🗜️ Client-Side RefPack LZ Decompressor**: Built-in drag-and-drop converter (`js/refpack.js`) to decompress raw EA `.bin` roster files into official binary save files (`FBCHUNKS`, `SaveType_Squads`, `BNRY`) entirely in the browser.
- **🖥️ Non-Scrolling Responsive UI**: Designed to fit seamlessly inside a single viewport (`100vh`) on desktop screens, with fluid scaling and full mobile/tablet responsiveness.
- **🔍 SEO & Social Discovery Optimized**: Full Open Graph preview cards (Discord, Reddit, X/Twitter, WhatsApp), Schema.org (`WebApplication` & `HowTo`) JSON-LD structured data for Google rich snippets, PWA web manifest, `robots.txt`, and XML sitemap.

---

## 🚀 Quick Start

### Local Static Server
You can serve the directory using any lightweight static server:

```powershell
# Using Python's built-in HTTP server:
python -m http.server 8000

# Or using npx serve:
npx serve .
```
Then visit: `http://localhost:8000`

### GitHub Pages Deployment
- Keep `.nojekyll` in your repository root to bypass Jekyll processing so GitHub Pages serves raw squad binary packages.
- The built-in downloader automatically fetches the binary package and prompts your browser to save it as `SquadsYYYYMMDD000000` with no `.htm` or file extensions.

---

## 🎮 How to Import Squad Files

### 💻 PC Windows (EA App / Steam / Epic Games)

1. **Download Squad File**:
   Click **Download Squad File** on the left panel to save your roster file (e.g. `Squads20261006000000`).
   > **Note on File Naming:** PC save files must strictly follow the format `SquadsYYYYMMDD000000` with **no file extension**.

2. **Copy to FC Settings Directory**:
   Press <kbd>Win</kbd> + <kbd>R</kbd> on your keyboard, paste the path below, and press Enter:
   ```text
   %USERPROFILE%\AppData\Local\EA SPORTS FC 27\settings
   ```
   *(For older titles, replace `27` with `26`, `25`, or `24`. Alternate folder: `%USERPROFILE%\Documents\FC 27\settings`)*

3. **Paste the Squad File**:
   Move or copy your downloaded squad file directly into this `settings` folder.

4. **Load Squads In-Game**:
   - Launch **EA SPORTS FC**.
   - From the Main Menu, go to **Settings / Customize** (gear icon in the top-left).
   - Navigate to **Profile** ➡️ **Load Squads**.
   - Select your squad file (`EA_Squads...`) and confirm.

5. **Career Mode & Kick Off Tips**:
   - **Career Mode:** When starting a new career, always choose **"Use Current Squads"**. *(Never choose "Download Latest" or EA will overwrite your roster with default server data).*
   - **Kick Off:** On the team selection screen, press <kbd>Y</kbd> (Xbox) or <kbd>Triangle</kbd> (PlayStation) to toggle **Live Form OFF**.

---

### 🎮 PlayStation 5 & PS4

1. Click download to obtain the console-formatted save file.
2. Format a USB drive as **FAT32** or **exFAT**.
3. Because PlayStation encrypted saves are tied to your PSN Account ID:
   - Use **Apollo Save Tool** (PS4 / Jailbroken PS5) or **Save Wizard** to resign the squad save to your PSN account.
   - Place the resigned save in `/PS4/SAVEDATA/<AccountID>/` on your USB drive.
4. Plug the USB drive into your console. Go to **Settings ➡️ Saved Data ➡️ USB Drive ➡️ Copy to Console Storage**.
5. Launch the game, navigate to **Customize ➡️ Profile ➡️ Load Squads**, and turn **Live Form OFF** in Kick Off.

---

### 🎮 Xbox Series X|S & Xbox One

1. Retail Xbox consoles sandbox local game saves via Xbox Live Cloud Storage.
2. Launch the game on your Xbox console.
3. Navigate to **Settings ➡️ Edit Teams ➡️ Download Updates** to sync the official database.
4. Verify by opening **Settings / Customize ➡️ Profile ➡️ Load Squads**.
5. When creating a Career Mode save, select **"Use Current Squads"** and turn **Live Form OFF** in Kick Off.

---

### 🔴 Nintendo Switch

1. Click download to obtain the Switch squad package.
2. On your custom firmware Switch, open the homebrew app **JKSV**.
3. Select your EA SPORTS FC title and create a new backup to your SD card.
4. Connect via FTP or mount the SD card on your PC.
5. Place the squad file into `/JKSV/EA SPORTS FC <Title>/<YourBackup>/`.
6. Re-open **JKSV**, select your backup, and choose **Restore Save**.
7. Launch the game and load your squad under **Customize ➡️ Profile ➡️ Load Squads**.

---

## 📂 Project Structure

```text
fc27-squad-updater/
├── index.html           # Semantic HTML5 single-screen application with SEO metadata
├── README.md            # Project documentation and platform guides
├── site.webmanifest     # Web App Manifest for PWA & mobile installation
├── robots.txt           # Crawler indexing directives
├── sitemap.xml          # XML search engine sitemap
├── assets/
│   ├── favicon.ico      # App icon
│   └── logo.webp        # Official EA SPORTS FC logo asset
├── css/
│   └── style.css        # Responsive styling, design tokens & 120° gradient theme
├── js/
│   ├── refpack.js       # Pure JS RefPack/QFS LZ decompressor & EA save file builder
│   └── app.js           # Multi-title database, date extraction, dynamic guides & download logic
```

---

## 👤 Author & Credits

- Made with ⚽ by **Janav Dua**.
- EA SPORTS FC™ is a registered trademark of Electronic Arts Inc. This tool is an independent utility created for personal offline squad management.
