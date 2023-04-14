# Musitix API
Release: v1.0.0

2023-04-14

檔案
- bin // 開啟伺服器
- connections // 連資料庫
- middleware // middleware 管理
- models // mongoose model 跟 ts interface
- routes // api routes
  
Install
- copy .env.example to .env, 設定資料庫連線、自定義的變數
- npm i 下載套件即可
- npm run dev // 測試用
- npm run build // ts 打包用
- npm run start:dev // 打包後版本(測試用)
- npm run start:production // 打包後版本(上線用)