createHelpContainer();

// 検索ボタン等を追加
function createHelpContainer() {
    if (document.getElementById("help-container")) {
        return;
    }

    // スタイトルを取得して最初の単語だけ取り出す
    const titleElem = document.querySelector(".resourceInfo h1");
    const rawTitle = titleElem ? titleElem.innerText.trim() : "";
    const resourceTitle = parseResourceTitle(rawTitle);

    // ヘルプ用コンテナ
    const container = document.createElement("div");
    container.id = "help-container";
    container.className = "secondaryContent";
    container.style.padding = "10px";
    container.style.borderRadius = "10px";
    container.style.marginTop = "10px";
    container.innerHTML = `<h3>FastQ！ | このプラグインについて...</h3>`;

    // ボタン生成
    function createHelpButton(text, iconPath, bgColor, onClick) {
        const button = document.createElement("button");

        // アイコン
        const iconImg = document.createElement("img");
        iconImg.src = chrome.runtime.getURL(iconPath);
        iconImg.style.width = "1em";
        iconImg.style.height = "1em";

        // テキスト
        const spanText = document.createElement("span");
        spanText.textContent = text;

        // ボタンのスタイル
        button.style.cssText = `
            width: 100%;
            margin: 5px 0;
            padding: 10px;
            border: none;
            background: ${bgColor};
            color: white;
            cursor: pointer;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            transition: all 0.2s ease-in-out;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        `;

        button.addEventListener("click", onClick);

        // ボタンにアイコン＋テキスト
        button.appendChild(iconImg);
        button.appendChild(spanText);

        return button;
    }

    // YouTube検索
    function openYouTube() {
        if (!resourceTitle) return;
        //ここ検索単語ね
        const queryA = resourceTitle + " 使い方 マイクラ";
        // 英語版も
        const queryB = "How To Use " + resourceTitle + " Minecraft";
        const urlA = "https://www.youtube.com/results?search_query=" + encodeURIComponent(queryA);
        const urlB = "https://www.youtube.com/results?search_query=" + encodeURIComponent(queryB);
        window.open(urlA, "_blank");
        window.open(urlB, "_blank");
    }
    // Google検索
    function openGoogle() {
        if (!resourceTitle) return;
        //ここ検索単語ね
        const queryA = resourceTitle + " 使い方 マイクラ";
        // 英語版も
        const queryB = "How To Use " + resourceTitle + " Minecraft";
        const urlA = "https://www.google.com/search?q=" + encodeURIComponent(queryA);
        const urlB = "https://www.google.com/search?q=" + encodeURIComponent(queryB);
        window.open(urlA, "_blank");
        window.open(urlB, "_blank");
    }
    // URLをコピー
    function copyPageURL() {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => alert("URLをコピーしました: " + url))
            .catch(err => console.error("コピー失敗", err));
    }

    // 色と画像指定
    container.appendChild(
        createHelpButton("YouTube検索", "img/yt.png", "#dc3545", openYouTube)
    );
    container.appendChild(
        createHelpButton("Google検索", "img/google.png", "#4285F4", openGoogle)
    );
    container.appendChild(
        createHelpButton("URLをコピー", "img/info.png", "#6c757d", copyPageURL)
    );

    // 右側のサイドバーに追加
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
        if (sidebar.children.length > 0) {
            sidebar.insertBefore(container, sidebar.children[0]);
        } else {
            sidebar.appendChild(container);
        }
    } else {
        console.error("[HELP] sidebarが見つからず、ヘルプを追加できません");
    }
}

/**
 * 検索するプラグイン名をできるだけ単語だけ取り出すやつ
 */
function parseResourceTitle(rawTitle) {
    if (!rawTitle) return "";

    // 絵文字削除
    const removeEmojisRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}]/gu;
    rawTitle = rawTitle.replace(removeEmojisRegex, "");

    // '|' や ',' とかがよく使われてるからスプリット
    rawTitle = rawTitle.split(/[|,]/)[0];

    // 空白で区切る
    const chunks = rawTitle.trim().split(/\s+/);

    // それぞれの chunk に対して、英字(a-zA-Z)のみ抽出する
    for (const chunk of chunks) {
        // 英字以外をすべてばいばい
        const onlyLetters = chunk.replace(/[^a-zA-Z]+/g, "");
        if (onlyLetters.length > 0) {
            return onlyLetters;
        }
    }

    return "";
}