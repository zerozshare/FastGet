/* ----------------------------------------------------
   ロゴ置き換え
   ---------------------------------------------------- */
// SpigotMCのロゴ画像を置き換える
function replaceSpigotLogo() {
    const logo = document.querySelector('img[src="//static.spigotmc.org/img/spigot.png"]');
    if (logo) {
        logo.src = chrome.runtime.getURL("img/spigot.png");
        logo.alt = "SpigotMC + FastGet"; 
    }
}
// ページロード時にFSSボタンを追加 & SpigotMCロゴ置き換え
(async () => {
    replaceSpigotLogo();
})();
