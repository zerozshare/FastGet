/************************************
 * FastServerV4 Spiget拡張機能(テスト)
 * このプログラムはテストで製作したため正式リリースの時は使えなくなっている場合があります。
 ************************************/

// **FSS_LOCAL_API_SERVER**
const FSS_SERVER = "http://localhost:4001";// (サーバーポート変更の可能性)

// サーバーがオンラインtrue/false
let serverOnline = false;



// マネージャーのコンテナを作成
function createFSSContainer(isDownloaded, pluginJarName, serverName) {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) {
        console.error("[FSS] サイドバーが見つかりません");
        return;
    }

    // 既存のFSSコンテナを削除(デバッグ用)
    const existingContainer = document.getElementById("fss-container");
    if (existingContainer) existingContainer.remove();
    const container = document.createElement("div");
    container.id = "fss-container";
    container.className = "secondaryContent"; 
    container.style.padding = "10px";
    container.style.borderRadius = "10px";
    container.innerHTML = `<h3>FastGetマネージャー</h3>`;

    //サーバー名があるなら表示
    if (serverName) {
        const serverNameElem = document.createElement("div");
        serverNameElem.style.marginBottom = "8px";
        serverNameElem.textContent = `サーバー名: ${serverName}`;
        container.appendChild(serverNameElem);
    }

    // サーバーの状態（オンライン/オフライン）を表示する
    const statusElem = document.createElement("div");
    statusElem.id = "fss-status";
    statusElem.style.marginBottom = "8px";
    statusElem.style.fontWeight = "bold";
    statusElem.textContent = serverOnline ? "●オンライン" : "✖️オフライン";
    statusElem.style.color = serverOnline ? "#28a745" : "#dc3545";
    container.appendChild(statusElem);

    // createボタン
    function createButton(text, color, onClick) {
        const button = document.createElement("button");
        button.textContent = text;
        button.style.cssText = `
            width: 100%;
            margin: 5px 0;
            padding: 10px;
            border: none;
            background: ${color};
            color: white;
            cursor: pointer;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            transition: all 0.2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        `;
        button.disabled = !serverOnline; 
        button.addEventListener("click", onClick);
        return button;
    }

    // 表示非表示条件付き
    if (isDownloaded) {
        // 再転送ボタン(インストール済みなら)
        container.appendChild(
            createButton("🔄 FSSに再転送", "#007bff", async function () {
                await animateButton(this, "/add_fastget");
            })
        );
        // 削除ボタン(インストール済みなら)
        container.appendChild(
            createButton("🗑️ プラグインを削除", "#dc3545", async function () {
                await removePlugin(this, pluginJarName);
            })
        );
    } else {
        // 転送ボタン(初回)
        container.appendChild(
            createButton("➕ FSSに転送", "#28a745", async function () {
                await animateButton(this, "/add_fastget");
            })
        );
    }

    // プラグイン一覧(プラグインフォルダから取得)
    container.appendChild(
        createButton("📋 プラグイン一覧", "#17a2b8", async () => {
            await showPluginList();
        })
    );

    sidebar.prepend(container);
}



// プラグイン一覧を表示
async function showPluginList() {
    try {
        const response = await fetch(`${FSS_SERVER}/list_fastget`);
        if (!response.ok) throw new Error("リスト取得失敗");
        const data = await response.json();
        if (data.status !== "true") throw new Error(data.message);

        const pluginList = data.plugins.length > 0 ? data.plugins.join("\n") : "プラグインはありません。";
        alert("インストール済みプラグイン:\n" + pluginList);
    } catch (error) {
        console.error("[FSS] プラグインリスト取得エラー:", error);
        alert("プラグインリストの取得に失敗しました。");
    }
}

// 追加リクエスト(アニメーション)
async function animateButton(button, endpoint, bodyData = {}) {
    const originalText = button.textContent;
    button.disabled = true;

    let dots = 0;
    const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        const iconMatch = originalText.match(/^(\S+)\s/);
        const iconPart = iconMatch ? iconMatch[1] + " " : "";
        const textPart = originalText.replace(iconPart, "").replace(/\.+$/, "");
        button.textContent = iconPart + textPart + ".".repeat(dots);
    }, 500);

    try {
        const response = await fetch(`${FSS_SERVER}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: window.location.href, ...bodyData })
        });

        clearInterval(interval);

        const data = await response.json();
        if (data.status === "true") {
            // XPアニメーション発動
            spawnXpEffect(button);

            button.textContent = "✓ 完了";
            button.style.background = "#28a745";

            // 完了時に「完了」が表示するために1秒待ってるだけ
            setTimeout(async () => {
                await initializeFSSButtons();
            }, 1000);

        } else {
            button.textContent = "エラー";
            button.style.background = "#dc3545";
        }
    } catch (error) {
        clearInterval(interval);
        console.error("[FSS] エラー:", error);// (デバッグ用)
        button.textContent = "通信エラー";
        button.style.background = "#dc3545";
    }

    setTimeout(() => {
        button.textContent = originalText;
        if (originalText.includes("削除")) {
            button.style.background = "#dc3545";
        } else if (originalText.includes("転送")) {
            button.style.background = "#28a745";
        } else if (originalText.includes("再転送")) {
            button.style.background = "#007bff";
        } else {
            button.style.background = "#17a2b8";
        }
        button.disabled = !serverOnline; 
    }, 2000);
}

// プラグイン削除ボタンの動作を変更
async function removePlugin(button, pluginJarName) {
    if (!pluginJarName) {
        console.error("[FSS] 削除するプラグインの名前が取得できません(デバッグ用)");
        return;
    }

    const confirmDelete = confirm(` ${pluginJarName} をプラグインフォルダから削除しますか？`);
    if (!confirmDelete) return;

    await animateButton(button, "/remove_fastget", { plugin: pluginJarName });
}



// サーバーがオンラインかチェック
async function checkServerAlive() {
    try {
        const response = await fetch(`${FSS_SERVER}/check_alive`);
        if (!response.ok) throw new Error("サーバー応答なし");
        const data = await response.json();
        return data.status === "ok";
    } catch (error) {
        console.error("[FSS] サーバーがオフラインです:", error);
        return false;
    }
}


// 定期的に生きてるかチェック(死んでたらオフラインモード)
function startAliveChecker() {
    setInterval(async () => {
        const wasOnline = serverOnline;
        serverOnline = await checkServerAlive();
        if (serverOnline !== wasOnline) {
            updateFSSStatus();
        }
    }, 10000);
}

// サーバー名を取得 (プロジェクト名とも呼ぶ)※ただ表示だけのため
async function getServerName() {
    try {
        const response = await fetch(`${FSS_SERVER}/get_servername`);
        if (!response.ok) throw new Error("サーバー名取得失敗");
        const data = await response.json();
        if (data.status === "true" && data.message) {
            return data.message;
        }
    } catch (error) {
        console.error("[FSS] サーバー名取得エラー:", error);
    }
    return null;
}


// プラグインの.jar名を取得 (Fast.jar)※インストール済みかチェックするために使う
async function getPluginJarName() {
    try {
        const response = await fetch(`${FSS_SERVER}/check_jarfile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: window.location.href })
        });
        if (!response.ok) throw new Error("プラグイン名取得失敗");
        const data = await response.json();
        return data.status === "true" ? data.message : null;
    } catch (error) {
        console.error("[FSS] プラグイン名取得エラー:", error);
        return null;
    }
}


// サーバーバージョンを取得 (プロジェクトから)※プラグインとの相性があるか
async function getServerVersion() {
    try {
        const response = await fetch(`${FSS_SERVER}/get_serverversion`);
        if (!response.ok) throw new Error("サーバーバージョン取得失敗");
        const data = await response.json();
        if (data.status === "true" && data.message) {
            return data.message;
        }
    } catch (error) {
        console.error("[FSS] サーバーバージョン取得エラー:", error);
    }
    return null;
}


// FSSボタンの初期化
async function initializeFSSButtons() {
    serverOnline = await checkServerAlive();

    const pluginJarName = await getPluginJarName();
    if (!pluginJarName) {
        console.error("[FSS] プラグイン名取得失敗");
        return;
    }

    let installedPlugins = [];
    try {
        const response = await fetch(`${FSS_SERVER}/list_fastget`);
        if (!response.ok) throw new Error("リスト取得失敗");
        const data = await response.json();
        installedPlugins = data.status === "true" ? data.plugins : [];
    } catch (error) {
        console.error("[FSS] プラグインリスト取得エラー:", error);
    }

    const serverName = await getServerName();

    createFSSContainer(installedPlugins.includes(pluginJarName), pluginJarName, serverName);

    const serverVersion = await getServerVersion();
    if (serverVersion) {
        checkVersionSupport(serverVersion);
    }
}

// サーバー状態に応じてUIを更新(aliveのチェックの時に呼び出し~)
function updateFSSStatus() {
    const statusElem = document.getElementById("fss-status");
    if (statusElem) {
        statusElem.textContent = serverOnline ? "●オンライン" : "✖️オフライン";
        statusElem.style.color = serverOnline ? "#28a745" : "#dc3545";
    }

    const fssButtons = document.querySelectorAll("#fss-container button");
    fssButtons.forEach(btn => {
        btn.disabled = !serverOnline;
    });
}


/* ----------------------------------------------------
   ここからバージョン解析してる場所(ここは後で直す)
   ---------------------------------------------------- */

function parseVersionString(str) {
    let cleaned = str.replace(/[^0-9.]/g, "");
    let parts = cleaned.split(".");
    let major = parseInt(parts[0] || "0", 10);
    let minor = parseInt(parts[1] || "0", 10);
    let patch = parseInt(parts[2] || "0", 10);
    return [major, minor, patch];
}

function compareVersion(serverVer, pluginVer) {
    const [sMaj, sMin, sPatch] = parseVersionString(serverVer);
    const [pMaj, pMin, pPatch] = parseVersionString(pluginVer);

    if (sMaj === pMaj && sMin === pMin) {
        if (sPatch === pPatch) {
            return "exact"; //完全一致
        } else {
            return "maybe"; //たぶん
        }
    }
    return "no"; //一致なし
}

function checkVersionSupport(serverVersion) {
    const nativeDd = document.querySelector(".customResourceFieldnative_mc_version dd");
    const nativeVersion = nativeDd ? nativeDd.textContent.trim() : null;

    const testedDd = document.querySelector(".customResourceFieldmc_versions dd");
    let testedVersions = [];
    if (testedDd) {
        const liElements = testedDd.querySelectorAll("li");
        testedVersions = Array.from(liElements).map(li => li.textContent.trim());
    }

    let bestResult = "no";
    let matchedVersion = "";

    if (nativeVersion) {
        const res = compareVersion(serverVersion, nativeVersion);
        if (res === "exact") {
            bestResult = "exact";
            matchedVersion = nativeVersion;
        } else if (res === "maybe") {
            bestResult = "maybe";
            matchedVersion = nativeVersion;
        }
    }

    if (bestResult !== "exact") {
        for (const tv of testedVersions) {
            const res = compareVersion(serverVersion, tv);
            if (res === "exact") {
                bestResult = "exact";
                matchedVersion = tv;
                break;
            } else if (res === "maybe") {
                if (bestResult !== "maybe") {
                    bestResult = "maybe";
                    matchedVersion = tv;
                }
            }
        }
    }

    let message = "";
    let bgColor = "#dc3545"; 

    switch (bestResult) {
        case "exact":
            message = `サーバーバージョン「${serverVersion}」はプラグイン「${matchedVersion}」と完全一致で利用できます。`;
            bgColor = "#28a745";
            break;
        case "maybe":
            message = `サーバーバージョン「${serverVersion}」はプラグイン「${matchedVersion}」と一部一致。\n利用できる可能性があります。`;
            bgColor = "#ffc107";
            break;
        default:
            message = `サーバーバージョン「${serverVersion}」には対応していない可能性が高いです。\n利用できません。`;
            bgColor = "#dc3545";
            break;
    }

    showTopToast(message, bgColor);
}

// バージョン警告ポップアップ
function showTopToast(message, bgColor) {
    const toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.top = "100px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.zIndex = "999999";
    toast.style.background = bgColor;
    toast.style.color = "#fff";
    toast.style.padding = "12px 16px";
    toast.style.borderRadius = "6px";
    toast.style.fontSize = "14px";
    toast.style.whiteSpace = "pre-line";
    toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
    toast.textContent = message;

    document.body.appendChild(toast);

    // 60秒で消す(ここは調整していいかも)
    setTimeout(() => {
         if (toast.parentNode) {
             toast.parentNode.removeChild(toast);
         }
     }, 60000);
}

/* ----------------------------------------------------
   XP(経験値)アニメーション: CSSは xpAnimation.css で定義済み
   ---------------------------------------------------- */
function spawnXpEffect(button) {
    console.log("spawnXpEffect start");

    // ボタンの位置を取得
    const rect = button.getBoundingClientRect();
    // ボタン中央の座標
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    // オーブの個数
    const orbCount = 20;

    for (let i = 0; i < orbCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = 50 + Math.random() * 100;
        const dx = distance * Math.cos(angle);
        const dy = distance * -Math.sin(angle);

        const orb = document.createElement("div");
        orb.className = "xp-orb";
        orb.style.transform = `translate(${originX}px, ${originY}px) scale(1)`;
        orb.style.opacity = "1";

        document.body.appendChild(orb);

        requestAnimationFrame(() => {
            orb.style.transform = `translate(${originX + dx}px, ${originY + dy}px) scale(0.5)`;
            orb.style.opacity = "0";
        });
        setTimeout(() => {
            if (orb.parentNode) {
                orb.parentNode.removeChild(orb);
            }
        }, 1000);
    }
}


// 生存チェックとFSSボタン追加など
(async () => {
    await initializeFSSButtons();
    startAliveChecker();
})();
