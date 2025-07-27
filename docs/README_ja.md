## 🌐 Select Language

<table align="center">
  <tr>
    <td align="center">
      <a href="../README.md">
        <img src="https://flagcdn.com/24x18/gb.png" alt="English" />  
        <br/><strong>English</strong>
      </a>
    </td>
    <td align="center">
      <a href="README_km.md">
        <img src="https://flagcdn.com/24x18/kh.png" alt="Khmer" />  
        <br/><strong>ខ្មែរ</strong>
      </a>
    </td>
    <td align="center">
      <a href="README_ja.md">
        <img src="https://flagcdn.com/24x18/jp.png" alt="Japanese" />  
        <br/><strong>Japanese</strong>
      </a>
    </td>
  </tr>
</table>

<p align="center">
  Thank you to all our contributors, users, and supporters for making this project thrive.
</p>

<p align="center">
  🚀 <strong>Stay tuned for more updates, features, and improvements.</strong>
</p>

![CheckCle Platform](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/server-detail-page.png)

# 🚀 CheckCleとは？

CheckCleは、フルスタックシステム、アプリケーション、インフラストラクチャのシームレスでリアルタイムな監視を実現するオープンソースソリューションです。開発者、システム管理者、DevOpsチームに対して、環境の全レイヤー（サーバー、アプリケーション、サービス）にわたる深い洞察と実用的なデータを提供します。CheckCleにより、テクノロジースタック全体の可視性、制御、最適なパフォーマンスの確保が可能になります。

## 🎯 ライブデモ  
👉 **今すぐ試す:** [CheckCle ライブデモ](https://demo.checkcle.io)

## 🌟 主要機能

### アップタイムサービス & インフラストラクチャサーバー監視
- HTTP、DNS、Pingプロトコルの監視
- TCPベースのAPIサービス（FTP、SMTP、HTTPなど）の監視
- 詳細なアップタイム、レスポンス時間、パフォーマンス問題の追跡
- 分散地域監視
- インシデント履歴（UP/DOWN/WARNING/PAUSE）
- SSL & ドメイン監視（ドメイン、発行者、有効期限、残り日数、ステータス、最終通知日）
- インフラストラクチャサーバー監視：Linux（🐧 Debian、Ubuntu、CentOS、Red Hatなど）およびWindows（ベータ版）をサポート。ワンライン・インストール・エージェント・スクリプトによるサーバーメトリクス（CPU、RAM、ディスク使用量、ネットワーク活動）の監視
- メンテナンススケジュール & インシデント管理
- 運用ステータス / パブリックステータスページ
- メール、Telegram、Discord、Slack経由の通知
- レポート & 分析
- 設定パネル（ユーザー管理、データ保持、多言語、テーマ（ダーク & ライトモード）、通知とチャネル、アラートテンプレート）

## #️⃣ はじめに

### 現在サポートされているアーキテクチャ
* ✅ x86_64 PC、ラップトップ、サーバー（amd64）
* ✅ 最新のRaspberry Pi 3/4/5（64ビットOS）、Apple Silicon Mac（arm64）

### 以下のオプションのいずれかを使用してCheckCleをインストールします。

1. CheckCle ワンクリックインストール - ターミナルにコピーして実行するだけ
```bash 
curl -fsSL https://checkcle.io/install.sh | bash

```
2. docker runでインストール。以下の準備済みdocker runコマンドをコピーするだけ
```bash 
docker run -d \
  --name checkcle \
  --restart unless-stopped \
  -p 8090:8090 \
  -v /opt/pb_data:/mnt/pb_data \
  --ulimit nofile=4096:8192 \
  operacle/checkcle:latest

```
3. Docker compose設定でインストール
```bash 

version: '3.9'

services:
  checkcle:
    image: operacle/checkcle:latest
    container_name: checkcle
    restart: unless-stopped
    ports:
      - "8090:8090"  # Webアプリケーション
    volumes:
      - /opt/pb_data:/mnt/pb_data  # ホストディレクトリをコンテナパスにマップ
    ulimits:
      nofile:
        soft: 4096
        hard: 8192

```
3. 管理Web画面

    デフォルトURL: http://0.0.0.0:8090
    ユーザー: admin@example.com
    パスワード: Admin123456
    
4. https://docs.checkcle.io のクイックスタートガイドに従ってください

###
![checkcle-collapse-black](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/uptime-monitoring.png)
![Service Detail Page](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/uptime-service-detail.png)
![checkcle-server-instance](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/instance-server-monitoring.png)
![Schedule Maintenance](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/checkcle-schedule-maintenance.png)
![SSL Monitoring](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/ssl-monitoring.png)

## 📝 開発ロードマップ

- ✅ ヘルスチェック & アップタイム監視（HTTP）
- ✅ ライブ統計情報付きダッシュボードUI  
- ✅ マルチユーザーシステム認証（管理者）
- ✅ 通知（Telegram）
- ✅ Dockerコンテナ化 
- ✅ CheckCle ウェブサイト
- ✅ CheckCle デモサーバー
- ✅ SSL & ドメイン監視
- ✅ メンテナンススケジュール 
- ✅ インシデント管理
- [ ] インフラストラクチャサーバー監視
- ✅ 運用ステータス / パブリックステータスページ
- ✅ アップタイム監視（HTTP、TCP、PING、DNS）フル機能
- ✅ 分散地域監視エージェント [サポート運用](https://github.com/operacle/Distributed-Regional-Monitoring)
- ✅ システム設定パネル＆メール設定
- ✅ ユーザー権限ロール
- [ ] 通知（Email/Slack/Discord/Signal）  
- ✅ データ保持 & 自動圧縮（データ & データベース圧縮のマルチオプション）
- ✅ 完全なドキュメント付きオープンソースリリース 

## 🌟 CheckCleはコミュニティのため？
- **情熱を持って開発**: コミュニティのためのオープンソース愛好家によって作成
- **フリー & オープンソース**: 隠れたコストなしで完全に無料で使用可能
- **協力 & つながり**: オープンソースに情熱を持つ同志と出会う

---

## 🤝 貢献の方法

CheckCleの改善にご協力いただける方法をご紹介します：

- 🐞 **バグ報告** – 不具合を発見しましたか？[GitHub Issue](https://github.com/operacle/checkcle/issues)を開いてお知らせください。
- 🌟 **機能提案** – アイデアはありますか？[ディスカッション](https://github.com/operacle/checkcle/discussions)を開始するか、機能リクエストのissueを開いてください。
- 🛠 **プルリクエスト送信** – コードの改善、バグ修正、機能追加、ドキュメントの改良を行ってください。
- 📝 **ドキュメント改善** – タイポ修正でも助かります！
- 🌍 **口コミ宣伝** – リポジトリに⭐をつけ、SNSでシェアし、他の人を貢献に招待してください！

---

## 🌍 つながりを保つ
- ウェブサイト: [checkcle.io](https://checkcle.io)
- ドキュメント: [docs.checkcle.io](https://docs.checkcle.io)
- GitHubリポジトリ: ⭐ [CheckCle](https://github.com/operacle/checkcle.git)
- コミュニティチャンネル: ディスカッションやissuesで参加してください！
- Discord: コミュニティに参加 [@discord](https://discord.gg/xs9gbubGwX)
- X: [@checkcle_oss](https://x.com/checkcle_oss)

## 📜 ライセンス

CheckCleはMITライセンスの下でリリースされています。

---
## 👥 貢献者

[![](https://contrib.rocks/image?repo=operacle/checkcle)](https://github.com/operacle/checkcle/graphs/contributors)


## スター履歴

[![Star History Chart](https://api.star-history.com/svg?repos=operacle/checkcle&type=Date)](https://www.star-history.com/#operacle/checkcle&Date)

CheckCleで情報を把握し、オンラインを維持しましょう！ 🌐