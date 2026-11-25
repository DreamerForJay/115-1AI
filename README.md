# 趣解清明上河圖｜汴京漫遊

115-1「人工智慧及其應用」課程專題。把北宋張擇端的《清明上河圖》做成可展卷、可找細節、可測驗的繁體中文數位小展。從畫卷右端的城郊出發，沿汴河走到虹橋，最後穿過城門進入街市。

- [開啟 GitHub Pages 網站](https://dreamerforjay.github.io/115-1AI/)
- [閱讀企劃與開發過程](docs/development.md)

## 網站功能

| 功能 | 操作 |
| --- | --- |
| 互動展卷 | 滑鼠拖曳、手機觸控滑動、鍵盤方向鍵，或透過全卷縮圖移動。 |
| 局部放大 | 使用 ＋、− 或重設按鈕。縮放時會保留目前觀看位置。 |
| 六個站點 | 城郊初見、小路行旅、汴河船隊、虹橋過船、穿過城門、市井百業。點原畫編號或站點按鈕看解說。 |
| 三個延伸故事 | 認識手卷的讀法、虹橋的水陸交通，以及街市的大小店鋪。 |
| 三題眼力小試 | 作答後立即顯示解析，最後統計分數，可重玩。 |

## 在本機預覽

正式網站只用 HTML、CSS、原生 JavaScript 與本地 WebP 圖片，不需要 Node.js、後端或 API 金鑰。

```bash
git clone https://github.com/DreamerForJay/115-1AI.git
cd 115-1AI
python -m http.server 8765
```

開啟 [http://localhost:8765](http://localhost:8765)。使用 Windows 時也可以執行 `py -m http.server 8765`。

## 檔案結構

| 路徑 | 內容 |
| --- | --- |
| `index.html` | 展覽結構、故事、測驗入口與來源 |
| `styles.css` | 視覺、響應式版型、動畫偏好與鍵盤焦點 |
| `app.js` | 站點資料、展卷與測驗邏輯 |
| `assets/` | 全卷、縮圖、局部裁切、網站印章 |
| `docs/development.md` | 企劃、實作步驟、測試方式及限制 |
| `tests/smoke.cjs` | 桌機和手機的 Playwright 瀏覽器測試 |
| `.nojekyll` | 指示 GitHub Pages 直接提供靜態檔案 |

## 部署與更新

在 GitHub 倉庫的 **Settings → Pages**，設定 **Deploy from a branch → `main` → `/(root)`** 並儲存。之後更新推送到 `main` 即可重新發布。網站資源使用 `./` 相對路徑，因此可以在 `/115-1AI/` 子路徑下正常載入。發布進度可到 **Actions** 或 **Settings → Pages** 查看。

## 資料來源與範圍

- 作品資料和畫面脈絡採用[北京故宮博物院《張擇端清明上河圖卷》](https://www.dpm.org.cn/collection/paint/228226.html)。
- 全卷、縮圖與局部使用同一份 [Wikimedia Commons 影像](https://commons.wikimedia.org/wiki/File:Alongtheriver_QingMing.jpg)，為北宋張擇端本，不是清院本。來源頁將該重製圖標為公有領域，詳見其授權說明。
- 網站是教學導覽，不是考證版圖錄。站點名稱、選圖位置和觀察提示是為本展整理的閱讀輔助。測驗不蒐集資料，重新載入網頁即清除結果。
