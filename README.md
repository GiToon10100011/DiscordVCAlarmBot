# Discord Voice Channel Monitor Bot

This Discord bot monitors specified voice channels and sends notifications when users join, leave, or switch between them. It also includes an AFK mode feature that automatically responds to users who join your voice channel while you're away.

## Features

- 🔊 **Voice Channel Monitoring**: Get notified when users join, leave, or switch between specified voice channels
- 📱 **Multiple Notification Methods**: Receive notifications via Discord DMs and [ntfy.sh](https://ntfy.sh/)
- 🚫 **AFK Mode**: Automatically respond to users who join your voice channel while you're away
- 🔔 **Return Notifications**: Automatically notifies users who joined while you were AFK when you return
- ⚙️ **Customizable Settings**: Set custom AFK messages and notification channels

## Setup Instructions

### Prerequisites

- Node.js (v16.9.0 or higher)
- A Discord account and a Discord bot token
- A Discord server where you have permission to add bots

### Step 1: Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "Bot" tab and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable:
   - Server Members Intent
   - Message Content Intent
5. Copy your bot token (you'll need this later)

### Step 2: Invite the Bot to Your Server

1. Go to the "OAuth2" > "URL Generator" tab
2. Select the following scopes:
   - `bot`
   - `applications.commands`
3. Select the following bot permissions:
   - Read Messages/View Channels
   - Send Messages
   - Read Message History
   - Connect to Voice
4. Copy the generated URL and open it in your browser to invite the bot to your server

### Step 3: Set Up the Project

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:

```
# Discord Configuration
DISCORD_TOKEN=your_discord_bot_token
DISCORD_USER_ID=your_discord_user_id
TARGET_VOICE_CHANNEL1_ID=first_voice_channel_id_to_monitor
TARGET_VOICE_CHANNEL2_ID=second_voice_channel_id_to_monitor
...
NOTIFICATION_CHANNEL_ID=channel_id_for_afk_notifications

# NTFY Configuration
NTFY_TOPIC=your_ntfy_topic_name
```

### Step 4: Get the Required IDs

To find the IDs you need:

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on a voice channel and select "Copy ID" to get the voice channel ID
3. Right-click on your username and select "Copy ID" to get your user ID
4. Right-click on a text channel and select "Copy ID" to get the notification channel ID

### Step 5: Set Up NTFY

1. Choose a unique topic name for your notifications
2. Add this topic name to your `.env` file as `NTFY_TOPIC`
3. Install the [ntfy app](https://ntfy.sh/app) on your mobile device
4. Subscribe to your topic in the app

### Step 6: Run the Bot

```bash
node index.js
```

## Usage

### AFK Mode

Use the `/afk` command to manage AFK mode:

- `/afk action:on` - Enable AFK mode with the default message
- `/afk action:on message:Your custom message` - Enable AFK mode with a custom message
- `/afk action:on channel:#channel-name` - Enable AFK mode and set a specific notification channel
- `/afk action:off` - Disable AFK mode

### Notifications

The bot will automatically send notifications when:

1. A user joins one of the monitored voice channels
2. A user switches between monitored voice channels
3. A user leaves a monitored voice channel

Notifications will be sent to:

- Your Discord DMs
- Your ntfy topic (which you can receive on mobile)

When AFK mode is enabled, the bot will also send a message in the specified text channel to notify users who join your voice channel that you're away.

## Customization

You can modify the following aspects of the bot:

- Add more voice channels to monitor by adding them to the `.env` file
- Change the notification format by editing the embed creation in the code
- Customize the AFK message using the `/afk` command

## Troubleshooting

- If the bot doesn't respond to commands, make sure you've enabled the correct intents in the Discord Developer Portal
- If you're not receiving notifications, check that your user ID is correctly set in the `.env` file
- For ntfy issues, verify your topic name and check that you're subscribed to it in the app

## License

This project is open source and available for anyone to use and modify.

---

# 디스코드 음성 채널 모니터링 봇

이 디스코드 봇은 지정된 음성 채널을 모니터링하고 사용자가 입장, 퇴장 또는 채널 간 이동할 때 알림을 보냅니다. 또한 자리를 비울 때 음성 채널에 입장하는 사용자에게 자동으로 응답하는 AFK 모드 기능도 포함되어 있습니다.

## 기능

- 🔊 **음성 채널 모니터링**: 사용자가 지정된 음성 채널에 입장, 퇴장 또는 이동할 때 알림 받기
- 📱 **다양한 알림 방법**: Discord DM과 [ntfy.sh](https://ntfy.sh/)를 통해 알림 받기
- 🚫 **AFK 모드**: 자리를 비울 때 음성 채널에 입장하는 사용자에게 자동으로 응답
- 🔔 **복귀 알람**: 자리를 비울 때 음성 채널에 입장하는 사용자에게 자동으로 응답
- ⚙️ **맞춤 설정**: 사용자 정의 AFK 메시지 및 알림 채널 설정

## 설치 방법

### 필수 조건

- Node.js (v16.9.0 이상)
- Discord 계정 및 Discord 봇 토큰
- 봇을 추가할 권한이 있는 Discord 서버

### 1단계: Discord 봇 생성

1. [Discord 개발자 포털](https://discord.com/developers/applications)로 이동
2. "New Application"을 클릭하고 이름 지정
3. "Bot" 탭으로 이동하여 "Add Bot" 클릭
4. "Privileged Gateway Intents" 섹션에서 다음 항목 활성화:
   - Server Members Intent
   - Message Content Intent
5. 봇 토큰 복사 (나중에 필요함)

### 2단계: 서버에 봇 초대

1. "OAuth2" > "URL Generator" 탭으로 이동
2. 다음 스코프 선택:
   - `bot`
   - `applications.commands`
3. 다음 봇 권한 선택:
   - 메시지 읽기/채널 보기
   - 메시지 보내기
   - 메시지 기록 읽기
   - 음성 연결
4. 생성된 URL을 복사하여 브라우저에서 열어 봇을 서버에 초대

### 3단계: 프로젝트 설정

1. 이 저장소를 클론하거나 다운로드
2. 의존성 설치:
   ```bash
   npm install
   ```
3. 프로젝트 루트에 다음 변수가 포함된 `.env` 파일 생성:

```
# Discord 설정
DISCORD_TOKEN=디스코드_봇_토큰
DISCORD_USER_ID=당신의_디스코드_사용자_ID
TARGET_VOICE_CHANNEL1_ID=모니터링할_첫번째_음성채널_ID
TARGET_VOICE_CHANNEL2_ID=모니터링할_두번째_음성채널_ID
...
NOTIFICATION_CHANNEL_ID=AFK_알림용_채널_ID

# NTFY 설정
NTFY_TOPIC=당신의_NTFY_토픽_이름
```

### 4단계: 필요한 ID 가져오기

필요한 ID를 찾는 방법:

1. Discord에서 개발자 모드 활성화 (사용자 설정 > 고급 > 개발자 모드)
2. 음성 채널을 우클릭하고 "ID 복사"를 선택하여 음성 채널 ID 가져오기
3. 사용자 이름을 우클릭하고 "ID 복사"를 선택하여 사용자 ID 가져오기
4. 텍스트 채널을 우클릭하고 "ID 복사"를 선택하여 알림 채널 ID 가져오기

### 5단계: NTFY 설정

1. 알림을 위한 고유한 토픽 이름 선택
2. 이 토픽 이름을 `.env` 파일에 `NTFY_TOPIC`으로 추가
3. 모바일 기기에 [ntfy 앱](https://ntfy.sh/app) 설치
4. 앱에서 토픽 구독

### 6단계: 봇 실행

```bash
node index.js
```

## 사용 방법

### AFK 모드

`/afk` 명령어를 사용하여 AFK 모드 관리:

- `/afk action:on` - 기본 메시지로 AFK 모드 활성화
- `/afk action:on message:사용자 정의 메시지` - 사용자 정의 메시지로 AFK 모드 활성화
- `/afk action:on channel:#채널-이름` - AFK 모드 활성화 및 특정 알림 채널 설정
- `/afk action:off` - AFK 모드 비활성화

### 알림

봇은 다음 상황에서 자동으로 알림을 보냅니다:

1. 사용자가 모니터링 중인 음성 채널에 입장할 때
2. 사용자가 모니터링 중인 음성 채널 간에 이동할 때
3. 사용자가 모니터링 중인 음성 채널에서 퇴장할 때

알림은 다음 경로로 전송됩니다:

- Discord DM
- ntfy 토픽 (모바일에서 수신 가능)

AFK 모드가 활성화되면, 봇은 지정된 텍스트 채널에 메시지를 보내 음성 채널에 입장한 사용자에게 자리를 비웠음을 알립니다.

## 커스터마이징

다음과 같은 봇의 측면을 수정할 수 있습니다:

- `.env` 파일에 추가하여 모니터링할 음성 채널 추가
- 코드에서 임베드 생성을 편집하여 알림 형식 변경
- `/afk` 명령어를 사용하여 AFK 메시지 사용자 정의

## 문제 해결

- 봇이 명령에 응답하지 않는 경우, Discord 개발자 포털에서 올바른 인텐트를 활성화했는지 확인
- 알림을 받지 못하는 경우, `.env` 파일에 사용자 ID가 올바르게 설정되어 있는지 확인
- ntfy 문제의 경우, 토픽 이름을 확인하고 앱에서 해당 토픽을 구독했는지 확인

## 라이센스

이 프로젝트는 오픈 소스이며 누구나 사용하고 수정할 수 있습니다.
