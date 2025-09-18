# 🗺️ ANN 的程式學習路線圖

## 🎯 學習目標與願景

### 🌟 長期目標 (6個月-1年)
- 成為能夠獨立開發全端應用的開發者
- 掌握現代前後端技術棧
- 建立個人技術品牌和作品集
- 具備解決複雜技術問題的能力

### 🎪 短期目標 (1-3個月)
- 深化 JavaScript 和現代前端技能
- 學習 React 框架開發
- 接觸後端和資料庫技術
- 建立持續學習的習慣

---

## 📅 詳細學習計劃

### 🔥 第一階段：鞏固基礎 (第1-2週)

#### Week 1: HTML5 & CSS3 進階
```
📅 Day 1-2: HTML5 語義化深入
🎯 學習目標:
- 掌握所有 HTML5 語義化標籤
- 理解 SEO 和無障礙設計
- 學習 HTML5 新 API

📚 學習內容:
- <header>, <nav>, <main>, <section>, <article>, <aside>, <footer>
- <figure>, <figcaption>, <time>, <mark>, <details>
- aria-label, role 無障礙屬性
- HTML5 表單新類型 (date, color, range)

💻 實作練習:
[ ] 重構現有網站使用完整語義化標籤
[ ] 創建一個新聞網站首頁 (練習文章結構)
[ ] 製作無障礙表單 (包含 aria 標籤)

---

📅 Day 3-4: CSS3 進階佈局
🎯 學習目標:
- 深入 CSS Grid 和 Flexbox
- 掌握 CSS 自定義屬性
- 學習現代 CSS 架構

📚 學習內容:
CSS Grid 深入:
- grid-template-areas 命名佈局
- auto-fit vs auto-fill
- minmax() 函數應用
- grid-gap 和 gap 屬性

CSS Flexbox 進階:
- flex-grow, flex-shrink, flex-basis
- order 屬性重排
- align-content vs align-items

CSS 自定義屬性:
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --spacing-unit: 1rem;
}

💻 實作練習:
[ ] 使用 Grid 重建作品集佈局
[ ] 創建可切換主題的網站 (CSS Variables)
[ ] 建立響應式卡片組件系統

---

📅 Day 5-7: CSS 動畫大師級
🎯 學習目標:
- 創造複雜的 CSS 動畫
- 理解動畫效能優化
- 掌握 3D 變換

📚 學習內容:
進階動畫技巧:
- animation-fill-mode, animation-direction
- 多重動畫組合
- cubic-bezier() 自定義緩動

3D 變換效果:
- perspective, transform-style: preserve-3d
- rotateX(), rotateY(), rotateZ()
- 3D 翻轉卡片效果

效能優化:
- will-change 屬性
- transform vs position 動畫
- GPU 硬體加速

💻 實作練習:
[ ] 創建 3D 立方體展示效果
[ ] 製作載入動畫庫 (10種不同效果)
[ ] 建立滾動觸發動畫系統
```

#### Week 2: JavaScript 基礎強化
```
📅 Day 1-2: ES6+ 現代語法
🎯 學習目標:
- 掌握 ES6+ 所有新特性
- 理解異步程式設計基礎
- 學習模組化開發

📚 學習內容:
變數和函數:
- const, let vs var 區別和使用場景
- 箭頭函數 this 綁定規則
- 預設參數和 rest/spread 運算符

解構和範本:
- 物件和陣列解構賦值
- 範本字串和標籤模板
- 簡寫屬性和方法

現代特性:
- Promise 和 async/await 基礎
- import/export 模組語法
- class 類別語法

💻 實作練習:
[ ] 重構現有 JavaScript 使用 ES6+ 語法
[ ] 創建模組化的 JavaScript 專案
[ ] 練習 30 個 ES6+ 特性範例

---

📅 Day 3-4: DOM 操作精通
🎯 學習目標:
- 掌握高效 DOM 操作技巧
- 理解事件機制和委託
- 學習效能優化方法

📚 學習內容:
高效選取器:
- querySelector 進階用法
- NodeList vs HTMLCollection
- 快取 DOM 元素避免重複查詢

事件處理進階:
- 事件冒泡和捕獲機制
- 事件委託 (Event Delegation)
- 自定義事件 (CustomEvent)

效能優化:
- DocumentFragment 批量操作
- requestAnimationFrame 動畫
- 節流 (throttle) 和防抖 (debounce)

💻 實作練習:
[ ] 建立高效的 ToDo List 應用
[ ] 創建拖拽排序組件
[ ] 實作無限滾動載入

---

📅 Day 5-7: 小專案實戰
🎯 學習目標:
- 整合所有學習內容
- 建立完整應用程式
- 培養專案規劃能力

💻 實作專案 (選擇1-2個):

🔢 專案1: 多功能計算機
功能需求:
- 基本四則運算
- 科學計算功能
- 歷史記錄
- 鍵盤快捷鍵支援
- 主題切換

技術重點:
- 事件處理和狀態管理
- 複雜邏輯處理
- localStorage 資料儲存

📝 專案2: 智能待辦清單
功能需求:
- 任務增刪改查
- 分類和標籤系統
- 優先級和截止日期
- 進度統計
- 資料匯入匯出

技術重點:
- 資料結構設計
- 本地儲存管理
- 使用者介面互動

🕐 專案3: 動態時鐘儀表板
功能需求:
- 多種時鐘樣式
- 世界時區顯示
- 倒數計時器
- 鬧鐘功能
- 動畫效果

技術重點:
- 日期時間處理
- Canvas 或 SVG 繪圖
- 定時器管理
```

---

### 🚀 第二階段：框架學習 (第3-6週)

#### Week 3-4: React 入門篇
```
📅 Day 1-3: React 核心概念
🎯 學習目標:
- 理解組件化思維
- 掌握 JSX 語法
- 學會 Props 和 State

📚 學習內容:
React 基礎:
- 什麼是組件 (Component)
- 函數組件 vs 類組件
- JSX 語法和規則
- 虛擬 DOM 概念

Props 數據傳遞:
- 父子組件通信
- Props 驗證 (PropTypes)
- 預設 Props 設定
- children 屬性使用

State 狀態管理:
- useState Hook 基礎
- 狀態更新原則
- 狀態提升 (Lifting State Up)
- 受控組件概念

💻 實作練習:
[ ] 創建第一個 React 應用
[ ] 建立可重用的 Button 組件
[ ] 製作 Counter 計數器組件
[ ] 開發 ProductCard 商品卡組件

---

📅 Day 4-7: React Hooks 深入
🎯 學習目標:
- 掌握所有常用 Hooks
- 理解 Hook 運作原理
- 學會自定義 Hook

📚 學習內容:
基礎 Hooks:
- useState: 狀態管理
- useEffect: 生命週期和副作用
- useContext: 跨組件狀態共享

進階 Hooks:
- useReducer: 複雜狀態管理
- useMemo: 效能優化
- useCallback: 函數記憶化
- useRef: DOM 引用和可變值

自定義 Hook:
- Hook 設計原則
- 邏輯抽取和重用
- 第三方 Hook 庫

💻 實作練習:
[ ] 使用 useEffect 建立資料載入組件
[ ] 創建 useLocalStorage 自定義 Hook
[ ] 開發 useToggle 開關 Hook
[ ] 實作 useFetch 資料獲取 Hook
```

#### Week 5-6: React 進階應用
```
📅 Day 1-3: 狀態管理和路由
🎯 學習目標:
- 掌握複雜應用狀態管理
- 學會 React Router 路由
- 理解組件組合模式

📚 學習內容:
Context API:
- createContext 和 useContext
- Provider 和 Consumer
- 避免不必要的重渲染

React Router:
- BrowserRouter vs HashRouter
- Route, Routes, Link 組件
- 程式化導航 (useNavigate)
- 路由參數和查詢字串

組件模式:
- 高階組件 (HOC)
- Render Props
- 組合 vs 繼承

💻 實作練習:
[ ] 建立主題切換 Context
[ ] 創建多頁 SPA 應用
[ ] 開發用戶認證系統
[ ] 實作購物車狀態管理

---

📅 Day 4-7: React 實戰專案
🎯 學習目標:
- 整合所有 React 技能
- 建立完整 SPA 應用
- 學習最佳實踐

💻 React 大專案 (選擇一個深入開發):

🛒 專案選項1: 電商購物網站
功能模組:
- 商品展示和搜尋
- 購物車和結帳
- 用戶註冊登入
- 訂單管理
- 評價系統

技術架構:
- React Router 多頁路由
- Context API 全域狀態
- Custom Hooks 邏輯複用
- 本地儲存購物車資料

📝 專案選項2: 個人部落格系統
功能模組:
- 文章列表和分類
- 文章詳情和留言
- 標籤和搜尋
- 管理後台
- Markdown 編輯器

技術架構:
- 組件化設計
- 路由和導航
- 狀態管理
- 第三方庫整合

📊 專案選項3: 任務管理看板
功能模組:
- 拖拽排序
- 看板和卡片管理
- 篩選和搜尋
- 資料持久化
- 協作功能

技術架構:
- 複雜交互邏輯
- 狀態管理優化
- 效能調校
- 第三方拖拽庫
```

---

### 🔧 第三階段：後端開發 (第7-12週)

#### Week 7-8: Node.js 基礎
```
📅 Day 1-3: Node.js 核心概念
🎯 學習目標:
- 理解 Node.js 運行環境
- 掌握模組系統
- 學會文件系統操作

📚 學習內容:
Node.js 基礎:
- V8 引擎和事件循環
- CommonJS vs ES Module
- global 物件和 process

核心模組:
- fs (文件系統)
- path (路徑處理)
- http (HTTP 服務器)
- url (URL 解析)
- crypto (加密)

NPM 套件管理:
- package.json 配置
- 依賴管理和版本控制
- npm scripts 腳本
- 發布和安裝套件

💻 實作練習:
[ ] 建立第一個 Node.js 應用
[ ] 創建文件讀寫工具
[ ] 開發簡單 HTTP 服務器
[ ] 實作命令行工具

---

📅 Day 4-7: Express.js 框架
🎯 學習目標:
- 掌握 Express 框架
- 學會 RESTful API 設計
- 理解中間件概念

📚 學習內容:
Express 基礎:
- 路由定義和參數
- 請求和響應物件
- 中間件執行順序
- 錯誤處理機制

RESTful API:
- GET, POST, PUT, DELETE
- 狀態碼和響應格式
- API 版本管理
- 文檔和測試

中間件系統:
- 內建中間件 (static, json)
- 第三方中間件 (cors, morgan)
- 自定義中間件開發
- 中間件執行流程

💻 實作練習:
[ ] 建立 Todo API 服務
[ ] 創建用戶管理 API
[ ] 開發檔案上傳功能
[ ] 實作 API 認證中間件
```

#### Week 9-10: 資料庫和認證
```
📅 Day 1-3: MongoDB 資料庫
🎯 學習目標:
- 掌握 NoSQL 資料庫概念
- 學會 MongoDB 操作
- 理解資料模型設計

📚 學習內容:
MongoDB 基礎:
- 文檔型資料庫概念
- 集合和文檔結構
- BSON 數據格式
- 索引和查詢優化

CRUD 操作:
- insertOne/insertMany
- find/findOne 查詢
- updateOne/updateMany
- deleteOne/deleteMany

Mongoose ODM:
- Schema 定義和驗證
- Model 和文檔操作
- 關聯和填充 (populate)
- 中間件和插件

💻 實作練習:
[ ] 設計部落格資料模型
[ ] 建立用戶和文章 Schema
[ ] 實作資料查詢和聚合
[ ] 開發資料遷移腳本

---

📅 Day 4-7: 用戶認證系統
🎯 學習目標:
- 實作完整認證流程
- 掌握 JWT 權杖機制
- 學會密碼安全處理

📚 學習內容:
認證基礎:
- 會話 vs 無狀態認證
- Cookie vs Token
- 對稱 vs 非對稱加密
- 鹽值和雜湊

JWT (JSON Web Token):
- Header, Payload, Signature
- 簽發和驗證流程
- 過期和刷新機制
- 最佳實踐和安全性

密碼安全:
- bcrypt 密碼雜湊
- 密碼強度驗證
- 忘記密碼流程
- 兩步驗證 (2FA)

💻 實作練習:
[ ] 建立註冊登入 API
[ ] 實作 JWT 中間件
[ ] 開發密碼重設功能
[ ] 創建權限控制系統
```

#### Week 11-12: 全端整合專案
```
🎯 終極專案: 完整全端應用

選擇一個專案深入開發:

📱 專案選項1: 社群媒體平台
前端功能:
- 用戶註冊登入介面
- 動態發布和瀏覽
- 點讚評論系統
- 個人資料管理
- 即時通知

後端功能:
- RESTful API 設計
- 用戶認證授權
- 檔案上傳處理
- 資料庫設計
- API 效能優化

技術棧:
- Frontend: React + React Router
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt

📝 專案選項2: 線上學習平台
前端功能:
- 課程瀏覽和搜尋
- 影片播放器
- 學習進度追蹤
- 討論區功能
- 個人儀表板

後端功能:
- 課程管理 API
- 用戶學習記錄
- 檔案儲存系統
- 權限分級管理
- 數據分析

技術棧:
- Frontend: React + Context API
- Backend: Express + MongoDB
- Storage: 檔案上傳系統
- Auth: 多角色權限

🛒 專案選項3: 電商管理系統
前端功能:
- 商品管理介面
- 訂單處理系統
- 庫存管理
- 銷售數據圖表
- 客戶管理

後端功能:
- 商品 CRUD API
- 訂單處理邏輯
- 庫存管理系統
- 支付系統整合
- 報表生成

技術棧:
- Frontend: React + Chart.js
- Backend: Express + MongoDB
- Payment: 第三方支付
- Admin: 管理後台
```

---

## 📚 學習資源整合

### 🌐 官方文檔 (必讀)
- [MDN Web Docs](https://developer.mozilla.org/) - 網頁技術權威文檔
- [React 官方文檔](https://react.dev/) - React 最新文檔
- [Node.js 官方文檔](https://nodejs.org/docs/) - Node.js 完整指南
- [Express.js 指南](https://expressjs.com/) - Express 框架文檔
- [MongoDB 文檔](https://docs.mongodb.com/) - MongoDB 操作指南

### 📖 學習平台
- [FreeCodeCamp](https://www.freecodecamp.org/) - 免費程式課程
- [JavaScript.info](https://javascript.info/) - JS 深度教學
- [React Tutorial](https://react-tutorial.app/) - 互動式 React 教學
- [Node.js 教學](https://nodejs.dev/learn) - Node.js 學習路徑

### 🛠️ 開發工具
- **編輯器**: VS Code + 必裝插件
- **瀏覽器**: Chrome + React DevTools
- **版本控制**: Git + GitHub
- **API 測試**: Postman 或 Insomnia
- **資料庫工具**: MongoDB Compass

### 📺 視頻資源
- YouTube 頻道推薦 (搜尋中文教學)
- Coursera 大學課程
- Udemy 付費課程
- Bilibili 程式教學

---

## ⏰ 時間管理建議

### 📅 每日學習計劃
```
平日安排 (2-3小時):
09:00-10:00  理論學習 (文檔、教學)
19:00-20:30  實作練習 (coding)
21:00-21:30  複習和筆記

週末安排 (4-5小時):
10:00-12:00  深度學習新概念
14:00-16:00  專案開發時間
16:30-17:30  社群學習和分享
```

### 🎯 學習節奏控制
- **25分鐘專注 + 5分鐘休息** (番茄鐘技巧)
- **每小時站起來活動** (避免久坐)
- **每天設定具體目標** (可衡量的成果)
- **每週回顧進度** (調整學習計劃)

### 📊 進度追蹤方法
- **每日學習記錄** (時間、內容、收穫)
- **每週技能評估** (1-10分自評)
- **每月專案檢查** (完成度和品質)
- **每季路線圖更新** (根據市場和興趣調整)

---

## 🎪 學習方法論

### 🧠 高效學習技巧
1. **主動學習** - 邊學邊做，不只是被動吸收
2. **費曼技巧** - 能教會別人才是真正掌握
3. **間隔重複** - 定期回顧之前學過的內容
4. **刻意練習** - 專注於弱點和難點
5. **項目導向** - 以完成具體項目為目標

### 🔍 問題解決策略
1. **仔細閱讀錯誤訊息** - 大部分錯誤都有明確提示
2. **Google 搜尋技巧** - 使用英文關鍵字，加上 "error" 或 "how to"
3. **Stack Overflow** - 程式設計師的問答社群
4. **GitHub Issues** - 查看開源項目的問題和解決方案
5. **官方文檔** - 最權威和最新的資訊來源

### 📝 筆記和文檔
1. **代碼註解** - 為重要邏輯添加清楚註解
2. **學習筆記** - 記錄概念、範例和心得
3. **錯誤日誌** - 記錄遇到的問題和解決方法
4. **項目文檔** - 為每個項目寫清楚的 README
5. **知識整理** - 定期整理和更新學習材料

---

## 🚀 進階發展方向

### 🎯 專業分工選擇 (6個月後)
```
前端專精路線:
- React 生態系 (Redux, Next.js)
- Vue.js 或 Angular
- TypeScript 型別系統
- 前端工程化 (Webpack, Vite)
- 移動端開發 (React Native)

後端專精路線:
- 微服務架構
- 資料庫設計和優化
- DevOps 和部署
- API 設計和文檔
- 雲端服務 (AWS, GCP)

全端發展路線:
- 平衡前後端技能
- 系統架構設計
- 產品思維培養
- 團隊協作技能
- 項目管理能力
```

### 🌟 軟技能培養
- **溝通表達** - 技術說明和團隊協作
- **問題分析** - 複雜問題的拆解能力
- **持續學習** - 跟上技術發展趨勢
- **時間管理** - 平衡學習和實作
- **團隊合作** - 開源貢獻和協作開發

---

## 🎉 里程碑獎勵系統

### 🏆 小里程碑 (每週)
- ✅ 完成一個小專案 → 🎁 看一部電影
- ✅ 學會一個新技術 → 🎁 買一本想要的書
- ✅ 解決一個困難問題 → 🎁 吃一頓好的

### 🌟 大里程碑 (每月)
- ✅ 完成階段學習目標 → 🎁 升級開發設備
- ✅ 建立完整專案 → 🎁 參加技術聚會
- ✅ 掌握新框架 → 🎁 購買進階課程

### 💎 終極里程碑 (每季)
- ✅ 完成全端專案 → 🎁 技術會議或旅行
- ✅ 找到第一份工作 → 🎁 慶祝派對
- ✅ 成為獨立開發者 → 🎁 創業基金

---

## 📞 學習支援系統

### 🤝 尋找學習夥伴
- **線上社群** - Discord、Telegram 開發者群組
- **本地聚會** - Meetup、技術聚會
- **學習小組** - 組織或加入讀書會
- **導師指導** - 尋找經驗豐富的開發者

### 💬 獲得幫助的管道
- **技術論壇** - Stack Overflow、segmentfault
- **社群媒體** - Twitter 技術討論
- **線上課程** - 課程討論區和助教
- **開源社群** - GitHub、GitLab 項目

### 🎯 保持動力的方法
- **設定明確目標** - SMART 原則設定學習目標
- **記錄進步** - 定期回顧學習成果
- **分享成就** - 在社群分享學習心得
- **慶祝小勝利** - 認可每一個進步

---

**最後更新**: 2025年09月16日
**制定者**: Claude Code 🤖
**受益者**: ANN 🌟
**下次更新**: 完成第一階段學習後

---

> 💡 **記住**: 這個路線圖是活的文檔，會根據你的學習進度和市場需求持續調整和優化！
>
> 🚀 **信念**: 每一個專家都曾經是初學者，堅持下去，你一定能達成目標！