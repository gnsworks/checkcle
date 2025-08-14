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
    <td align="center">
      <a href="README_zhcn.md">
        <img src="https://flagcdn.com/24x18/cn.png" alt="Chinese" />  
        <br/><strong>Chinese</strong>
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

# 🚀 តើឆេកខលគឺជាអ្វី?

ឆេកខល (CheckCle) គឺជាប្រពន័្ធប្រភពបើកចំហមួយដែលបើកអោយប្រើប្រាស់ទូទាំងពីភពលោកដោយឥតគិតថ្លៃ ដែលមានក្នុងមុខងារចំបងក្នុងការត្រួតពិនិត្យវ៉េបសាយ កម្មវិធីបច្ចេកវិទ្យា​និងហេដ្ឋារចនាសម្ព័ន្ធនៃម៉ាសុីនមេជាដើម។ វាផ្តល់ឱ្យអ្នកអភិវឌ្ឍន៍ អ្នកគ្រប់គ្រងប្រព័ន្ធ និងក្រុម DevOps នូវការពត័ស៊ីជម្រៅ និងទិន្នន័យនៃហេដ្ឋារចនាសម្ព័ន្ធ មិនថាជាម៉ាស៊ីនមេ កម្មវិធី ឬសេវាកម្មនោះទេ។ ជាមួយ CheckCle អ្នកមើលឃើញជាក្រាប វិភាគ​ និងហេតុការផ្សេងៗ​ និងធានាបាននូវការជូនដំណើរការនៅហេតុការផ្សេងៗដែលបានកើតឡើង។

## 🎯 តេស្តសាកល្បងផ្ទាល់
👉 **Try it now:** [CheckCle Live Demo](https://demo.checkcle.io)

## 🌟 មុខងារចម្បង

### ពិនិត្យប្រព័ន្ធវ៉េបសាយ និងការត្រួតពិនិត្យហេដ្ឋារចនាសម្ព័ន្ធនៃម៉ាស៊ីនមេ
- ត្រួតពិនិត្យពិធីកម្មវិធី HTTP, DNS, and Ping protocols
- ត្រួតពិនិត្យពិធីកម្មវិធី TCP-based, API services (e.g., FTP, SMTP, HTTP)
- តាមដាននិងវិភាគលម្អិត, response times, and performance issues
- តាមដាននិងវិភាគលម្អិតពីដំបន់ឬប្រទេសផ្សេងៗបាន
- ប្រវត្តិឧប្បត្តិហេតុ (UP/DOWN/WARNING/PAUSE)
- តាមដាន​ SSL & Domain (Domain, Issuer, Expiration Date, Days Left, Status, Last Notified)
- តាមដាននិងត្រួតពិនិត្យម៉ាស៊ីនមេ, Supports Linux (🐧 Debian, Ubuntu, CentOS, Red Hat, etc.) and Windows (Beta). And Servers metrics like CPU, RAM, disk usage, and network activity) with an one-line installation angent script.
- រៀបចំកាលវិភាគ និងការគ្រប់គ្រងឧប្បត្តិហេតុ
- ទំព័រស្ថានភាពប្រតិបត្តិការ
- ការជូនដំណឹងតាមរយៈ email, Telegram, Discord, and Slack
- របាយការណ៍ & វិភាគលម្អិត
- ផ្ទាំងការកំណត់ប្រព័ន្ធគ្រប់គ្រង (User Management, Data Retention, Multi-language, Themes (Dark & Light Mode), Notification and channels and alert templates).

## #️⃣ ការចាប់ផ្តើម

### ដំណើរការលើស្ថាបត្យកម្មដូចជា
* ✅ x86_64 PCs, laptops, servers (amd64)
* ✅ Modern Raspberry Pi 3/4/5 with (64-bit OS), Apple Silicon Macs (arm64)

### អ្នកអាចដំឡើង CheckCle ដោយជ្រើសរើសជម្រើសមួយក្នុងចំណោមជម្រើសខាងក្រោម។


1. CheckCle One-Click Installation - Just copy and run on terminal
```bash 
curl -fsSL https://checkcle.io/install.sh | bash

```
2. Install with docker run. Just copy ready docker run command below
```bash 
docker run -d \
  --name checkcle \
  --restart unless-stopped \
  -p 8090:8090 \
  -v /opt/pb_data:/mnt/pb_data \
  --ulimit nofile=4096:8192 \
  operacle/checkcle:latest

```
3. Install with Docker compose Configuration.
```bash 

version: '3.9'

services:
  checkcle:
    image: operacle/checkcle:latest
    container_name: checkcle
    restart: unless-stopped
    ports:
      - "8090:8090"  # Web Application
    volumes:
      - /opt/pb_data:/mnt/pb_data  # Host directory mapped to container path
    ulimits:
      nofile:
        soft: 4096
        hard: 8192

```
3. ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង

    Default URL: http://0.0.0.0:8090
    User: admin@example.com
    Passwd: Admin123456
    
4. ឯកសារ​ និងរបៀបប្រើប្រាស់ផ្សេង at https://docs.checkcle.io

###
![checkcle-collapse-black](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/uptime-monitoring.png)
![Service Detail Page](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/uptime-service-detail.png)
![checkcle-server-instance](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/instance-server-monitoring.png)
![Schedule Maintenance](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/checkcle-schedule-maintenance.png)
![SSL Monitoring](https://pub-4a4062303020445f8f289a2fee84f9e8.r2.dev/images/ssl-monitoring.png)

## 📝 គម្រោងក្នុងការអភិវឌ្ឍន៍ប្រព័ន្ធគ្រប់គ្រង

- ✅ Health check & uptime monitoring (HTTP)
- ✅ Dashboard UI with live stats  
- ✅ Auth with Multi-users system (admin)
- ✅ Notifications (Telegram)
- ✅ Docker containerization 
- ✅ CheckCle Website
- ✅ CheckCle Demo Server
- ✅ SSL & Domain Monitoring
- ✅ Schedule Maintenance 
- ✅ Incident Management
- [ ] Infrastructure Server Monitoring
- ✅ Operational Status / Public Status Pages
- ✅ Uptime monitoring (HTTP, TCP, PING, DNS) Full functionality
- ✅ Distributed Regional Monitoring Agent [Support Operation](https://github.com/operacle/Distributed-Regional-Monitoring)
- ✅ System Setting Panel and Mail Settings
- ✅ User Permission Roles
- [ ] Notifications (Email/Slack/Discord/Signal)  
- ✅ Data Retention & Automate Strink (Muti Options to Shrink Data & Database )
- ✅ Open-source release with full documentation 

## 🌟 ឆេកខលសម្រាប់សហគមន៍
- **Built with Passion**: Created by an open-source enthusiast for the community
- **Free & Open Source**: Completely free to use with no hidden costs
- **Collaborate & Connect**: Meet like-minded people passionate about Open Source

---

## 🤝 របៀបក្នុងការចូលរួមអភិវឌ្ឍន៍ប្រព័ន្ធកូដបើកជំហ

នេះគឺជាវិធីមួយចំនួនដែលអ្នកអាចជួយកែលម្អ CheckCle:

- 🐞 **រាយការណ៍កំហុស** - រកឃើញកំហុសថ្មី? អនុញ្ញាតឱ្យយើងដឹងដោយបើកផងដោយបង្កើត [GitHub Issue](https://github.com/operacle/checkcle/issues).
- 🌟 **ផ្តល់យោបល់** – មានគំនិតថ្មី?​ អនុញ្ញាតឱ្យយើងដឹងដោយបើកផងដោយបង្កើត [Discussion](https://github.com/operacle/checkcle/discussions) or open a Feature Request issue.
- 🛠 **បញ្ជូនសំណើអភិវឌ្ឍន៍កូដ** – កែលម្អកូដ ជួសជុលកំហុស បន្ថែមមុខងារ ឬកែលម្អឯកសារ។
- 📝 **ធ្វើអោយឯកសារប្រសើរឡើង** – សូម្បីតែការកែលម្អបន្តិចបន្តួចក៏អាចជួយបាន!
- 🌍 **ផ្សព្វផ្សាយ** – ដាក់ផ្កាយ ⭐ repo ចែករំលែកវានៅលើសង្គមហើយអញ្ជើញអ្នកផ្សេងទៀតឱ្យចូលរួមអភិវឌ្ឍន៍!

---

## 🌍 រក្សាទំនាក់ទំនង
- វ៉េបសាយ: [checkcle.io](https://checkcle.io)
- ឯកសារ: [docs.checkcle.io](https://docs.checkcle.io)
- ឃ្លាំងផ្ទុកកូដ: ⭐ [CheckCle](https://github.com/operacle/checkcle.git)
- ទំនាក់ទំនងក្រុម: Engage via discussions and issues!
- បណ្តាញសង្គម: Join our community [@discord](https://discord.gg/xs9gbubGwX)
- X: [@checkcle_oss](https://x.com/checkcle_oss)

## 📜 License

CheckCle ត្រូវបានចេញផ្សាយក្រោមអាជ្ញាប័ណ្ណ MIT ។

---
## 👥 អ្នករួមចំណែក

[![](https://contrib.rocks/image?repo=operacle/checkcle)](https://github.com/operacle/checkcle/graphs/contributors)


## ស្ថានភាពផ្តាយ

[![Star History Chart](https://api.star-history.com/svg?repos=operacle/checkcle&type=Date)](https://www.star-history.com/#operacle/checkcle&Date)

កុំភ្លេចប្រើប្រាស់ឆេកខលសម្រាប់ការងាររបស់អ្នក! 🌐
