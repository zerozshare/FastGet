// ファイルの内容読み込み
async function loadAllLanguageMaps() {
  const indexResponse = await fetch(chrome.runtime.getURL('langs/index.json'));
  const indexData = await indexResponse.json();

  // filesを読み取り
  const fileList = Array.isArray(indexData) ? indexData : indexData.files;

  if (!Array.isArray(fileList)) {
    throw new Error("index.json の形式がおかしいかも");
  }

  const languageMap = {};

  await Promise.all(
    fileList.map(async (fileName) => {
      const res = await fetch(chrome.runtime.getURL(`langs/${fileName}`));
      const map = await res.json();
      Object.assign(languageMap, map);
    })
  );

  return languageMap;
}

// ページ内のテキストを置換
function translatePage(map) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    let newText = node.nodeValue;
    // 各キーに対して置換
    for (const [source, target] of Object.entries(map)) {
      if (newText.includes(source)) {
        newText = newText.replace(source, target);
      }
    }
    if (newText !== node.nodeValue) {
      node.nodeValue = newText;
    }
  }
}

// 全ファイルの読み込み後に翻訳を実行
loadAllLanguageMaps()
  .then((map) => {
    translatePage(map);
  })
  .catch((err) => {
    console.error("言語マップの読み込みに失敗しました:", err);
  });