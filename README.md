# Musitix API
Release: v1.3.6
Node: 建議 v16 以上

2023-05-28

檔案
- bin // 開啟伺服器
- connections // 連資料庫
- middleware // middleware 管理
- models // mongoose model 跟 ts interface
- routes // api routes
- service // 處理 api 傳過來的成功或失敗的資訊
- dist // Render 部屬用
  
Install
- copy .env.example to .env, 設定資料庫連線、自定義的變數
- npm i 下載套件即可
- npm run start:dev // 測試用
- npm run start:production // 測試用(production 版)
- npm run production // 打包後版本(上線前測試用)
- npm run build // ts 打包用