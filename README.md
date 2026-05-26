# 🚀 PostGitSim: 대화형 시각적 Git 시뮬레이터 (Git Playground)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FReasonofmoon%2Fgitsim-playground-game)

이 웹 애플리케이션은 초보자들이 복잡하게 느낄 수 있는 Git 명령어들과 동작 흐름을 웹 브라우저 내 가상 터미널 환경에서 **실시간 파일 상태의 시각적 변화**와 **커밋 그래프 애니메이션**을 통해 직관적으로 학습할 수 있도록 제작되었습니다.

세훈님이 만드신 **`code-gamification`** 프로젝트의 훌륭한 핵심 아이디어들(잘못된 홈 폴더 초기화의 위험성 확인, `.gitignore` 설정 및 강제 철거 등)을 완벽하게 흡수하여 **게이미피케이션 플랫폼**으로 초강력 업그레이드했습니다!

---

## 🎯 캠페인 코스 가이드 (Two Campaigns)

좌측 상단에 있는 **🎯 학습 코스 선택** 드롭다운 메뉴를 통해 두 가지 서로 다른 테마의 학습을 진행할 수 있습니다.

### 📦 캠페인 1: 우체국 취급점 개설과 기본 택배 (기본 코스)
- **대상**: Git의 가장 기본적인 저장, 스테이징, 커밋 흐름을 배우고 싶을 때.
- **주요 미션**:
  - `git init -b main`으로 저장소 생성
  - `git status`로 Untracked 파일 확인
  - `git add` ➡️ `git commit` 스테이징과 저장 메커니즘 학습
  - `git config --global` 설정 에러 해결
  - `git remote add origin`으로 GitHub 주소 연동
  - `git status`를 실행할 때 발생하는 작업 영역 범위 파악

### 🛡️ 캠페인 2: 위험한 홈디렉터리 & .gitignore (고급 보안 코스) 🌟 *New*
- **대상**: 세훈님의 `code-gamification` 앱에서 영감을 얻은 어드벤처식 보안 실습 코스.
- **주요 미션**:
  - `cd ~` 또는 `cd /`를 통한 홈 디렉터리로의 디렉터리 경로 스위칭
  - 홈 디렉터리에서 실수로 `git init -b main`을 실행하여 대참사 경험하기
  - `git status`를 쳤을 때 노출되는 개인 보안 정보 파일(`.ssh/id_rsa`, `bank_info.json`, `personal_tax.txt`) 확인 및 아찔한 경고 경험
  - `rm -rf .git`으로 잘못 생성된 저장소를 안전하고 깔끔하게 강제 철거하기
  - 제자리로 복귀 후 `.gitignore` 생성 및 `node_modules/` 무시 패턴을 설정하여 완벽한 방어막 설계하기 (무시된 파일은 탐색기에서 **Ignored ⚪** 상태로 실시간 투영됨!)

---

## 🎨 주요 업그레이드 기능 및 비주얼 이펙트

1. **학습 코스 셀렉터 (Campaign Dropdown)**:
   - 드롭다운을 스위칭하는 즉시 가상 시스템 메모리가 부드럽게 초기화되며 완전히 새로운 레벨 가이드와 가상 머신 환경이 준비됩니다.
2. **다중 디렉터리 경로 시뮬레이터**:
   - 가상 홈 폴더(`/`)와 프로젝트 폴더(`/content/test`)를 실시간으로 넘나들 수 있으며 터미널 프롬프트 뱃지 경로(`user@postgitsim:~$` vs `user@postgitsim:~/test$ `)가 그에 맞추어 완벽히 스위칭됩니다.
3. **고급 터미널 쉘 확장**:
   - `rm -rf .git` 삭제 시뮬레이션 지원.
   - `echo "node_modules/" > .gitignore`와 같은 터미널 파일 쓰기 Redirection을 지원하여 실제로 터미널에 쳐서 `.gitignore` 파일 내용을 기록할 수 있습니다.
4. **비주얼 `.gitignore` 상태 (Ignored File Rendering)**:
   - `.gitignore`가 설정되면 차단된 폴더나 파일들은 파일 탐색기 내에서 **회색 빛(Ignored ⚪) 취소선 상태**로 실시간 변화합니다!

---

## ⚡ Vercel 즉시 웹 배포 가이드 (Vercel Deployment)

정적 정밀 파일로 구성되어 있어 Vercel을 통해 10초 만에 글로벌 웹사이트로 배포할 수 있습니다.

### 방법 1: 1-Click 원클릭 배포 (추천 🚀)
1. README 상단에 있는 [**Deploy with Vercel**](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FReasonofmoon%2Fgitsim-playground-game) 버튼을 클릭합니다.
2. 클릭 후 Vercel 대시보드에서 본인의 GitHub 계정을 연동하면, 자동으로 이 리포지토리가 복제되어 본인의 무료 HTTPS 도메인 웹서비스로 즉시 개설됩니다!

### 방법 2: Vercel CLI 이용하기
로컬 컴퓨터 터미널에서 Vercel CLI를 사용해 수동으로 즉시 배포할 수 있습니다.
```bash
# 1. vercel 설치 (전역)
npm install -g vercel

# 2. 프로젝트 폴더 내부에서 로그인 및 즉시 배포 진행
vercel
```
가이드 문항에 모두 엔터(Default)로 응답하면 배포된 단축 URL을 즉시 돌려받을 수 있습니다.

---

## 🛠️ 로컬 실행 방법 (내 컴퓨터에서 열기)

### Python을 이용한 초간단 서버 실행 (추천 🌟)
터미널(PowerShell 등)을 켜고 이 프로젝트 폴더 내부로 이동한 후 아래 명령어를 입력합니다.

```bash
python -m http.server 3000
```
명령어를 실행한 뒤 브라우저 주소창에 `http://localhost:3000`을 입력하여 접속합니다.
