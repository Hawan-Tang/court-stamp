# 庭務員集章冊

司法特考五等庭務員「法院組織法大意」「民事訴訟法大意與刑事訴訟法大意」的闖關式學習網站。純靜態網頁，不需要伺服器或資料庫。

## 內容

| 項目 | 數量 |
|---|---|
| 關卡（集章） | 100 關，44 個單元，分四段 |
| 選擇題 | 744 題 |
| 挖空填數字 | 292 題 |
| 是非題 | 584 題 |
| 配對 | 51 組 |
| 流程排序 | 10 組 |
| 條文排卡 | 150 題 |
| 角色 | 8 隻台灣動物法庭角色 |
| 數字表 | 291 筆 |
| 註釋詞條 | 27 條 |

今日學習：一鍵開始，每輪 15 題，自動混合新題與到期複習（答對後隔 1、3、7、15、30、60 天再考），答錯的題同一輪會再出現。每日目標答對 30 題，達標拿獎盃；連續天數、每月達標天數、印花（只能靠答題賺）可以解鎖角色。

學法：條文卡翻牌、挖空填數字、限時是非快答（60 秒）、配對、流程排序、隨機選擇題、模擬考（每科 50 題、60 分鐘）、錯題本（連續答對兩次才移出）。

### 條文來源與版本

全部依「全國法規資料庫」現行條文（2026-11-24 下載）：

- 法院組織法：民國 115 年 05 月 13 日修正
- 民事訴訟法：民國 112 年 11 月 29 日修正
- 刑事訴訟法：民國 115 年 05 月 13 日修正
- 法庭席位布置規則（115.07.17）、法庭旁聽規則（110.02.22）、法庭錄音錄影及其利用保存辦法（111.07.22）、臺灣高等法院以下各級法院或分院臨時開庭辦法（88.01.19）
- 法院便民禮民實施要點（司法院 105.02.15 修正，取自六法全書網站）

每一題都標出處（法規＋條號），附的條文原句經程式逐字比對過。題目是「依條文改編」，不是考選部歷屆試題。席位布置的附圖（民事、刑事法庭布置圖）是照官方 PDF 整理成文字，左右以「從旁聽席面向法官席」為準。

## 在電腦上直接打開

雙擊 `index.html` 就能玩。進度存在瀏覽器裡（localStorage），換瀏覽器或換電腦不會同步。

## 部署到網路（GitHub Pages，免費）

**方法一：網頁上傳，不用裝任何東西**

1. 登入 GitHub，右上角「+」→「New repository」，名稱例如 `court-stamp`，選 Public，建立。
2. 在新 repo 頁面按「uploading an existing file」，把 `site` 資料夾**裡面的所有東西**（`index.html`、`css`、`js`、`icons`、`manifest.webmanifest`、`sw.js`、`.nojekyll`、`README.md`）拖進去，按「Commit changes」。
   - `.nojekyll` 是隱藏檔，Windows 檔案總管要開「顯示隱藏的項目」才看得到。
3. 到 repo 的「Settings」→ 左側「Pages」→ Source 選「Deploy from a branch」，Branch 選 `main`、資料夾選 `/ (root)`，按 Save。
4. 等 1～2 分鐘，網址會是 `https://你的帳號.github.io/court-stamp/`。

**方法二：用 git 指令**

```bash
cd site
git init
git add .
git commit -m "庭務員集章冊"
git branch -M main
git remote add origin https://github.com/你的帳號/court-stamp.git
git push -u origin main
```

之後一樣到 Settings → Pages 開啟。

**其他免費空間**：Netlify 可以直接把 `site` 資料夾拖到 https://app.netlify.com/drop 。Vercel、Cloudflare Pages 也都能放純靜態網站。

## 手機安裝成 App

部署到 https 網址後用手機打開：

- iPhone（Safari）：分享 →「加入主畫面」
- Android（Chrome）：選單 →「安裝應用程式」或「加到主畫面」

裝好後離線也能玩（第一次要先在有網路時打開過）。

## 檔案結構

```
site/
├─ index.html            頁面骨架
├─ css/app.css           樣式（淺色／深色自動切換）
├─ js/app.js             遊戲邏輯
├─ js/chars.js           角色（程式繪製的 SVG）
├─ js/data.js            題庫、關卡、數字表、註釋（自動產生）
├─ js/laws.js            條文全文（自動產生）
├─ manifest.webmanifest  PWA 設定
├─ sw.js                 離線快取
├─ icons/                App 圖示
└─ .nojekyll             讓 GitHub Pages 不要用 Jekyll 處理
```

## 更新題庫（修法時）

題庫的原始檔在上一層的 `bank/`，條文在 `laws/`。修法後重新下載條文、更新題目，再執行：

```bash
python bank/build.py       # 合併題目、逐字比對條文原句
python bank/build_site.py  # 產生 site/js/data.js 與 site/js/laws.js
```

## 聲明

題目依法條改編，僅供學習。條文以全國法規資料庫公告為準。
