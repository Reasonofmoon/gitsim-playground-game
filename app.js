/* ==========================================================================
   PostGitSim Upgraded Application Controller & Scenario orchestrator (Courier analogy)
   ========================================================================== */

import { GitEngine } from './gitEngine.js';

// Initialize the simulated Git Engine
const git = new GitEngine();

// Application State
let activeCampaign = 'colab'; // 'colab' or 'security'
let currentLevelIndex = 0;
let commandHistory = [];
let historyIndex = -1;
let userEncounteredAuthError = false;
let userVisitedContentDir = false;
let userVisitedHomeDir = false;
let lastExecutedCommand = '';

// Level Configurations for Both Campaigns
const campaignMissions = {
    colab: [
        {
            level: 1,
            badge: 'LEVEL 1',
            title: '내 방에 우체국 취급점 개설하기 (git init)',
            description: 'Git 버전 관리를 시작하기 위해 내 방 폴더에 우체국 민간 취급점 1호점을 개설하고 비밀 장부실 겸 보관 창고(.git)를 처음으로 차려 봅니다.',
            checklist: [
                { text: 'test 폴더에서 git init -b main 취급점 차리기', id: 'init-check' }
            ],
            hint: '터미널에 `git init -b main`을 입력해 보세요. 느낌표(!)를 붙여 `!git init -b main`으로 입력해도 작동합니다!',
            summary: '우체국 취급점을 차리려면 폴더 내에서 `git init`을 실행해야 합니다. `-b main` 옵션은 창고 보관 선반(기본 브랜치)의 이름을 `main`으로 짓겠다는 약속입니다.',
            checkCompleted: () => {
                return git.isInitialized && git.currentBranch === 'main' && git.workingDir === '/content/test';
            }
        },
        {
            level: 2,
            badge: 'LEVEL 2',
            title: '첫 수공예 부품 제작 및 물류 상태 조회',
            description: '첫 번째 수공예 부품인 README2.md를 만들고, 취급점 장부실에 물류 보관 상태를 조회해 봅니다.',
            checklist: [
                { text: 'README2.md 파일 생성 (가상 파일 탐색기 버튼 클릭)', id: 'create-readme2-check' },
                { text: 'git status 명령어로 파일 물류 상태 확인', id: 'status-check' }
            ],
            hint: '1. 우측 상단 탐색기 창 하단에 활성화된 [README2.md 생성] 버튼을 클릭하세요!\n2. 그 다음 터미널에 `git status`를 입력하세요.',
            summary: '새로 만든 물건은 아직 박스 포장 전이라 대기대에 올라가지 않은 `Untracked(미추적)` 상태입니다. 아직 우체국장(Git)이 관리하기 전 단계의 물건입니다.',
            checkCompleted: () => {
                const readme2 = git.files['/content/test/README2.md'];
                return readme2.exists && lastExecutedCommand === 'git status' && git.workingDir === '/content/test';
            }
        },
        {
            level: 3,
            badge: 'LEVEL 3',
            title: '접수 대기대 등록 및 서명 누락 퇴짜 경험하기',
            description: '만든 물건을 박스에 넣어 \'접수 대기 테이블(Staging Area)\'에 임시로 올리고, 첫 정식 접수를 시도해 봅니다.',
            checklist: [
                { text: 'git add README2.md 명령으로 대기 테이블에 올리기', id: 'add-check' },
                { text: 'git commit -m "..." 실행 후 서명 누락 오류 마주하기', id: 'commit-err-check' }
            ],
            hint: '1. `git add README2.md`를 입력하여 파일을 접수 대기 테이블에 올리세요.\n2. `git commit -m "test: making2 md files"`를 입력하여 발송자 서명 누락(Author identity unknown) 오류를 경험해 보세요!',
            summary: '누가 보낸 택배인지 우체국 장부에 서명이 남아야 하므로, 발송인 정보(이름, 이메일) 설정이 완료되지 않으면 접수가 완전히 거부됩니다.',
            checkCompleted: () => {
                const readme2 = git.files['/content/test/README2.md'];
                return readme2.status === 'staged' && userEncounteredAuthError && git.workingDir === '/content/test';
            }
        },
        {
            level: 4,
            badge: 'LEVEL 4',
            title: '발송인 서명 등록 및 대망의 첫 정식 접수 성공!',
            description: '오류 해결을 위한 발송인 이름과 이메일을 등록하고, 고유 운송장 번호가 찍힌 첫 정식 택배 박스를 영구 적재해 봅니다.',
            checklist: [
                { text: 'git config로 user.name과 user.email 발송자 서명하기', id: 'config-check' },
                { text: '첫 번째 택배 박스 성공적으로 정식 접수하기', id: 'commit-success-check' },
                { text: 'git log --oneline으로 발행된 운송장 영수증 확인', id: 'log-check' }
            ],
            hint: '1. `git config --global user.name "닉네임"`과 `git config --global user.email "이메일"`을 입력해 서명하세요.\n2. 다시 `git commit -m "test: making2 md files"`를 실행하여 정식 접수하세요!\n3. 마지막으로 `git log --oneline`을 입력하여 히스토리 영수증을 확인하세요.',
            summary: '발송인 정보를 장부에 등록하면 비로소 정식 접수(Commit)에 성공합니다. `--oneline` 옵션은 발행된 영수증 대장을 한 줄 단위로 아주 요약하여 보여주는 기특한 기능입니다.',
            checkCompleted: () => {
                return git.config.userName && git.config.userEmail && git.commits.length > 0 && lastExecutedCommand === 'git log --oneline' && git.workingDir === '/content/test';
            }
        },
        {
            level: 5,
            badge: 'LEVEL 5',
            title: '두 번째 택배 접수 및 중앙 허브 연결',
            description: '추가 수공예품 README.md를 두 번째 택배 상자로 접수하고, 거대한 우체국 중앙 물류 허브(GitHub) 창고 주소를 단골 연결해 봅니다.',
            checklist: [
                { text: 'README.md 부품 제작 및 대기대 업로드', id: 'create-readme-check' },
                { text: 'add fourth draft 운송장으로 두 번째 접수 완수', id: 'commit2-check' },
                { text: 'git remote add origin으로 중앙 허브 창고 주소를 origin으로 등록', id: 'remote-check' }
            ],
            hint: '1. 탐색기 하단의 [README.md 생성] 버튼을 누르세요.\n2. `git add .` 후 `git commit -m "add fourth draft"`를 실행해 보세요.\n3. `git remote add origin https://github.com/Reasonofmoon/test-github.git`를 입력하세요.',
            summary: '내 컴퓨터 지점(Local)에 쌓인 영수증 박스들을 전 세계로 보내기 위해, 물류 허브 주소를 주소록에 별칭 `origin`으로 챡 등록하는 과정입니다.',
            checkCompleted: () => {
                const hasSecondCommit = git.commits.some(c => c.message.includes('fourth') || c.message.includes('README.md'));
                return git.commits.length >= 2 && git.remote.name === 'origin' && git.workingDir === '/content/test';
            }
        },
        {
            level: 6,
            badge: 'LEVEL 6',
            title: '취급점 계약 범위의 이해와 기본 마스터',
            description: '민간 취급점 간판이 없는 방 바깥(/content 폴더)으로 나가 명령을 쳤을 때 일어나는 업무 마비 상태를 분석하고 되돌아옵니다.',
            checklist: [
                { text: '%cd /content 명령으로 취급점 바깥으로 외출', id: 'cd-out-check' },
                { text: 'git status 명령 실행 시 장부 인식 에러 확인', id: 'status-err-check' },
                { text: '%cd /content/test 명령으로 복귀 및 git status 최종 점검', id: 'cd-in-check' }
            ],
            hint: '1. `%cd /content`를 입력해 보세요.\n2. `git status`로 에러가 나는 것을 확인하세요.\n3. `%cd /content/test`로 복귀한 후 `git status`를 쳐서 완성하세요!',
            summary: '우체국 장부는 오직 취급점 대장(.git)이 숨겨져 있는 폴더 범위 내에서만 작동합니다. 바깥으로 나가는 순간 버전 추적과 물류 조회가 완전히 마비됩니다.',
            checkCompleted: () => {
                return userVisitedContentDir && git.workingDir === '/content/test' && lastExecutedCommand === 'git status';
            }
        }
    ],
    security: [
        {
            level: 1,
            badge: 'LEVEL 7',
            title: '가상 시스템의 최상위 홈 디렉터리로 이동',
            description: '잘못된 위치의 위험한 취급점 개설 사고를 경험하기 위해 터미널을 통해 홈 디렉터리로 잠시 외출해 봅니다.',
            checklist: [
                { text: 'cd ~ 또는 cd / 명령으로 홈 디렉터리 이동', id: 'cd-home-check' }
            ],
            hint: '터미널에 `cd ~` 또는 `cd /`를 입력해 보세요. 경로가 최상위 경로로 바뀐 것을 확인하세요!',
            summary: '`cd` 명령어는 작업 폴더를 변경합니다. `~` 기호는 컴퓨터 내부에서 가장 최상위의 개인 사용자의 홈 디렉터리를 가리키는 기호입니다.',
            checkCompleted: () => {
                return git.workingDir === '/';
            }
        },
        {
            level: 2,
            badge: 'LEVEL 8',
            title: '엉뚱한 위치의 위험천만한 취급점 개설',
            description: '내 전용 방이 아닌, 컴퓨터 전체가 모여 있는 홈 경로(/)에서 실수로 취급점 간판을 다는 대참사를 재현합니다.',
            checklist: [
                { text: 'git init -b main 명령 실행', id: 'bad-init-check' }
            ],
            hint: '홈 디렉터리에 위치한 상태에서 `git init -b main` 명령어를 터미널에 실행하여 위험한 간판을 달아보세요!',
            summary: '내 방이 아닌 최상위 홈 디렉터리에서 `git init`을 누르는 순간, 내 컴퓨터 내부의 온갖 보이지 않는 민감한 개인 정보들까지 장부 추적 대상이 될 위험이 생깁니다.',
            checkCompleted: () => {
                return git.workingDir === '/' && git.isHomeInitialized;
            }
        },
        {
            level: 3,
            badge: 'LEVEL 9',
            title: '개인 비밀 파일 노출 대참사 감지',
            description: '홈 디렉터리에 잘못 개설된 취급점 장부를 열어보고, 어떤 극비 보안 파일들이 박스에 실려 노출되기 직전인지 확인합니다.',
            checklist: [
                { text: 'git status 명령 실행 및 보안 유출 경고 관찰', id: 'danger-status-check' }
            ],
            hint: '현재 상태에서 `git status`를 입력하여 개인키(`.ssh/id_rsa`), 세금 데이터(`personal_tax.txt`) 등이 붉게 노출된 상황을 확인해 보세요!',
            summary: '이 상태로 만약 `git add` 후 커밋하여 중앙 물류 허브(GitHub)에 트럭을 쏘게 된다면, 전 세계 해커들에게 내 개인 비밀 파일들을 무료로 나눔 하는 끔찍한 사태가 발생합니다.',
            checkCompleted: () => {
                return git.workingDir === '/' && git.isHomeInitialized && lastExecutedCommand === 'git status';
            }
        },
        {
            level: 4,
            badge: 'LEVEL 10',
            title: '잘못 세워진 취급점 폭파 및 철거',
            description: '보안 유출 대참사를 막기 위해, 잘못 개설된 홈 디렉터리의 비밀 장부실(.git)을 흔적 없이 안전하게 폭파시킵니다.',
            checklist: [
                { text: 'rm -rf .git 명령으로 취급점 폭파하기', id: 'rm-git-check' },
                { text: 'git status로 철거 완료 상태(에러 발생) 확인', id: 'status-rm-check' }
            ],
            hint: '1. `rm -rf .git`을 입력하여 잘못된 저장소 폴더를 철거하세요.\n2. 그 다음 `git status`를 입력하여 우체국장이 에러를 올바르게 뱉어주는지 확인하세요.',
            summary: '`rm -rf .git`은 소스 코드를 지우지 않고 오직 Git이 관리하던 버전 비밀 기록실만 흔적 없이 날리므로, 잘못 설치된 저장소를 깔끔하게 초기화해 주는 유일한 소방수입니다.',
            checkCompleted: () => {
                return git.workingDir === '/' && !git.isHomeInitialized && lastExecutedCommand === 'git status';
            }
        },
        {
            level: 5,
            badge: 'LEVEL 11',
            title: '안전 복귀 및 금지 물품 대장 설계 (.gitignore)',
            description: '내 방 작업실로 복귀한 뒤, 대용량 파일이나 극비 번호가 인터넷 허브에 올라가지 않도록 차단 대장(.gitignore)을 설계해 봅니다.',
            checklist: [
                { text: 'cd /content/test 명령으로 프로젝트 폴더 안전 복귀', id: 'return-project-check' },
                { text: '.gitignore 생성 및 node_modules/ 차단 패턴 등록', id: 'gitignore-check' },
                { text: 'secret.txt 및 node_modules/ 생성 후 git add . 실행', id: 'add-unignored-check' },
                { text: 'git status로 secret.txt만 접수 대기대에 올랐는지 검증', id: 'status-ignore-check' }
            ],
            hint: '1. `%cd /content/test`로 복귀하세요.\n2. 탐색기 아래에 새로 열린 [.gitignore 생성] 버튼을 클릭하세요!\n3. 이어 [secret.txt 생성]과 [node_modules/ 생성] 버튼을 클릭하세요.\n4. 터미널에 `git add .`를 쳐서 카트에 담고, `git status`를 입력하여 대용량인 node_modules는 무시되고 secret.txt만 대기 테이블에 올라갔는지(초록색 🟢) 확인하세요!',
            summary: '`.gitignore` 대장에 차단할 폴더(node_modules/)나 파일 패턴을 써두면, Git은 대용량 파일이나 의존성 더미들을 추적 대상에서 완전히 배제하여 깔끔하고 쾌적한 창고 관리를 유지해 줍니다.',
            checkCompleted: () => {
                const gitignore = git.files['/content/test/.gitignore'];
                const secret = git.files['/content/test/secret.txt'];
                const nodeModules = git.files['/content/test/node_modules'];
                
                return git.workingDir === '/content/test' && 
                       gitignore && gitignore.exists && 
                       secret && secret.status === 'staged' && 
                       nodeModules && nodeModules.exists && 
                       !git.stagingArea.has('/content/test/node_modules') &&
                       (lastExecutedCommand === 'git status' || lastExecutedCommand.includes('status'));
            }
        }
    ]
};

// DOM Elements
const elements = {
    campaignSelect: document.getElementById('campaign-select'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    missionLevel: document.getElementById('mission-level'),
    missionTitle: document.getElementById('mission-title'),
    missionDescription: document.getElementById('mission-description'),
    missionChecklist: document.getElementById('mission-checklist'),
    btnHint: document.getElementById('btn-hint'),
    hintText: document.getElementById('hint-text'),
    levelNodes: document.getElementById('level-nodes'),
    summaryContent: document.getElementById('summary-content'),
    
    // Tab Views
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Explorer & Staging
    fileList: document.getElementById('file-list'),
    stagingBox: document.getElementById('staging-box'),
    btnCreateReadme2: document.getElementById('btn-create-readme2'),
    btnCreateReadme: document.getElementById('btn-create-readme'),
    btnModifyReadme: document.getElementById('btn-modify-readme'),
    
    // Campaign 2 Specific buttons
    btnCreateGitignore: document.getElementById('btn-create-gitignore'),
    btnCreateSecret: document.getElementById('btn-create-secret'),
    btnCreateNodeModules: document.getElementById('btn-create-nodemodules'),
    
    // Git Graph Tab
    gitTreeGraph: document.getElementById('git-tree-graph'),
    gitTreePlaceholder: document.getElementById('git-tree-placeholder'),
    graphSvg: document.getElementById('graph-svg'),
    commitNodesLayer: document.getElementById('commit-nodes-layer'),

    // Terminal
    terminalBody: document.getElementById('terminal-body'),
    terminalOutput: document.getElementById('terminal-output'),
    terminalInput: document.getElementById('terminal-input'),
    terminalPrompt: document.getElementById('terminal-prompt'),
    
    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalMessage: document.getElementById('modal-message'),
    btnNextLevel: document.getElementById('btn-next-level')
};

// ==========================================================================
// Initialization & Core UI Renders
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadMission(0);
    renderLevelNodes();
    updateVisualState();
    
    // Input Event Listeners
    elements.terminalInput.addEventListener('keydown', handleTerminalKey);
    elements.btnHint.addEventListener('click', toggleHint);
    
    // Campaign Selector Dropdown Event
    elements.campaignSelect.addEventListener('change', (e) => {
        activeCampaign = e.target.value;
        git.reset(); // Full reset on campaign switch
        
        if (activeCampaign === 'security') {
            git.workingDir = '/content/test';
            writeSystemWelcome('고급 보안 미션 캠페인이 시작되었습니다. 미션 설명을 잘 읽어보세요!');
        } else {
            git.workingDir = '/content/test';
            writeSystemWelcome('기본 Colab 탈출 미션 캠페인으로 다시 초기화되었습니다.');
        }

        userEncounteredAuthError = false;
        userVisitedContentDir = false;
        userVisitedHomeDir = false;
        lastExecutedCommand = '';
        commandHistory = [];
        
        loadMission(0);
        renderLevelNodes();
    });

    // File Action Buttons
    elements.btnCreateReadme2.addEventListener('click', () => {
        git.createFile('README2.md', 'second draft\n');
        writeSystemMessage('README2.md 파일이 생성되었습니다. (상태: Untracked 🔴)');
        updateVisualState();
        checkMissionProgress();
    });

    elements.btnCreateReadme.addEventListener('click', () => {
        git.createFile('README.md', 'first draft\n');
        writeSystemMessage('README.md 파일이 생성되었습니다. (상태: Untracked 🔴)');
        updateVisualState();
        checkMissionProgress();
    });

    elements.btnModifyReadme.addEventListener('click', () => {
        git.modifyFile('README.md', 'first draft -> modified to fourth draft\n');
        writeSystemMessage('README.md 파일의 내용이 수정되었습니다. (상태: Modified 🟡)');
        updateVisualState();
        checkMissionProgress();
    });

    // Campaign 2 Action Buttons
    elements.btnCreateGitignore.addEventListener('click', () => {
        git.createFile('.gitignore', 'node_modules/\n*.key\n');
        writeSystemMessage('.gitignore 설정 파일이 생성되었습니다. (차단 패턴: node_modules/, *.key)');
        updateVisualState();
        checkMissionProgress();
    });

    elements.btnCreateSecret.addEventListener('click', () => {
        git.createFile('secret.txt', 'DB_PASSWORD=my_precious_secret\n');
        writeSystemMessage('secret.txt 비밀 파일이 생성되었습니다. (상태: Untracked 🔴)');
        updateVisualState();
        checkMissionProgress();
    });

    elements.btnCreateNodeModules.addEventListener('click', () => {
        git.createFile('node_modules', 'Large node modules dependencies dummy data\n');
        writeSystemMessage('node_modules/ 대용량 디렉터리 더미가 설치되었습니다.');
        updateVisualState();
        checkMissionProgress();
    });

    // Tab buttons
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            elements.tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    // Modal Action button
    elements.btnNextLevel.addEventListener('click', () => {
        elements.modalOverlay.classList.add('hidden');
        const activeMissions = campaignMissions[activeCampaign];
        if (currentLevelIndex < activeMissions.length - 1) {
            loadMission(currentLevelIndex + 1);
            elements.terminalInput.focus();
        } else {
            if (activeCampaign === 'colab') {
                alert('🎉 LEVEL 6 미션 성공! 다음은 [캠페인 2: 고급 보안 코스]로 넘어가 더 깊은 난이도를 학습해 보세요!');
                elements.campaignSelect.value = 'security';
                elements.campaignSelect.dispatchEvent(new Event('change'));
            } else {
                alert('🏆 축하합니다! PostGitSim의 모든 게이미피케이션 캠페인을 완벽하게 정복하셨습니다. 당신은 이제 완벽한 물류 마스터입니다!');
            }
        }
    });

    elements.terminalBody.addEventListener('click', () => {
        elements.terminalInput.focus();
    });
});

// Load Mission by index
function loadMission(index) {
    currentLevelIndex = index;
    const activeMissions = campaignMissions[activeCampaign];
    const mission = activeMissions[index];
    
    elements.missionLevel.textContent = mission.badge;
    elements.missionTitle.textContent = mission.title;
    elements.missionDescription.textContent = mission.description;
    elements.summaryContent.textContent = mission.summary;
    
    elements.hintText.classList.add('hidden');
    elements.hintText.textContent = mission.hint;
    elements.btnHint.textContent = '💡 힌트 보기';
    
    elements.missionChecklist.innerHTML = '';
    mission.checklist.forEach(item => {
        const li = document.createElement('li');
        li.id = item.id;
        li.textContent = item.text;
        elements.missionChecklist.appendChild(li);
    });

    document.querySelectorAll('.level-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if (idx === index) btn.classList.add('active');
    });

    updateProgress();
    updateVisualState();
}

function renderLevelNodes() {
    elements.levelNodes.innerHTML = '';
    const activeMissions = campaignMissions[activeCampaign];
    activeMissions.forEach((m, idx) => {
        const btn = document.createElement('button');
        btn.className = `level-btn ${idx === 0 ? 'active' : ''}`;
        btn.textContent = m.level;
        btn.title = m.title;
        btn.addEventListener('click', () => {
            loadMission(idx);
        });
        elements.levelNodes.appendChild(btn);
    });
}

function updateProgress() {
    const activeMissions = campaignMissions[activeCampaign];
    const total = activeMissions.length;
    const percent = Math.round((currentLevelIndex / total) * 100);
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressFill.style.width = `${percent}%`;
    
    document.querySelectorAll('.level-btn').forEach((btn, idx) => {
        if (idx < currentLevelIndex) {
            btn.classList.add('completed');
        } else {
            btn.classList.remove('completed');
        }
    });
}

function toggleHint() {
    if (elements.hintText.classList.contains('hidden')) {
        elements.hintText.classList.remove('hidden');
        elements.btnHint.textContent = '💡 힌트 숨기기';
    } else {
        elements.hintText.classList.add('hidden');
        elements.btnHint.textContent = '💡 힌트 보기';
    }
}

// ==========================================================================
// Virtual State Visualization (Explorer & Commit Tree Graph)
// ==========================================================================

function updateVisualState() {
    const path = git.workingDir;
    elements.terminalPrompt.textContent = `user@postgitsim:${path === '/content/test' ? '~/test' : path}$ `;

    // Render Working Tree Path badge
    document.querySelector('.path-badge').textContent = path;

    // Toggle all Action buttons based on current active directory and level indexes
    elements.btnCreateReadme2.classList.add('hidden');
    elements.btnCreateReadme.classList.add('hidden');
    elements.btnModifyReadme.classList.add('hidden');
    elements.btnCreateGitignore.classList.add('hidden');
    elements.btnCreateSecret.classList.add('hidden');
    elements.btnCreateNodeModules.classList.add('hidden');

    if (activeCampaign === 'colab' && git.isInitialized && git.workingDir === '/content/test') {
        if (!git.files['/content/test/README2.md'].exists && currentLevelIndex >= 1) {
            elements.btnCreateReadme2.classList.remove('hidden');
        }
        if (git.files['/content/test/README2.md'].exists && !git.files['/content/test/README.md'].exists && currentLevelIndex >= 4) {
            elements.btnCreateReadme.classList.remove('hidden');
        }
        if (git.files['/content/test/README.md'].exists && git.files['/content/test/README.md'].status !== 'modified' && currentLevelIndex >= 4) {
            elements.btnModifyReadme.classList.remove('hidden');
        }
    }

    if (activeCampaign === 'security' && git.workingDir === '/content/test') {
        const hasGitignore = git.files['/content/test/.gitignore'].exists;
        const hasSecret = git.files['/content/test/secret.txt'].exists;
        const hasNodeModules = git.files['/content/test/node_modules'].exists;

        if (!hasGitignore && currentLevelIndex === 4) {
            elements.btnCreateGitignore.classList.remove('hidden');
        }
        if (!hasSecret && currentLevelIndex === 4) {
            elements.btnCreateSecret.classList.remove('hidden');
        }
        if (!hasNodeModules && currentLevelIndex === 4) {
            elements.btnCreateNodeModules.classList.remove('hidden');
        }
    }

    // Render file tree based on active working directory
    elements.fileList.innerHTML = '';
    let hasFiles = false;

    for (const [absPath, file] of Object.entries(git.files)) {
        if (!file.exists || file.dir !== git.workingDir) continue;
        hasFiles = true;

        const li = document.createElement('li');
        li.className = 'file-item';
        
        let badgeClass = 'status-untracked';
        let badgeLabel = 'Untracked';

        // Check gitignore match
        const isIgnored = git.isIgnored(absPath);

        if (isIgnored) {
            li.classList.add('ignored');
            badgeClass = 'status-ignored';
            badgeLabel = 'Ignored';
        } else if (file.status === 'staged') {
            badgeClass = 'status-staged';
            badgeLabel = 'Staged';
        } else if (file.status === 'committed') {
            badgeClass = 'status-committed';
            badgeLabel = 'Committed';
        } else if (file.status === 'modified') {
            badgeClass = 'status-modified';
            badgeLabel = 'Modified';
        }

        li.innerHTML = `
            <div class="file-meta">
                <span class="file-icon">${isIgnored ? '⚪' : '📄'}</span>
                <span class="file-name">${file.name}</span>
            </div>
            <span class="file-status-badge ${badgeClass}">${badgeLabel}</span>
        `;
        elements.fileList.appendChild(li);
    }

    if (!hasFiles) {
        elements.fileList.innerHTML = `<div class="empty-placeholder">파일이 아직 존재하지 않습니다. 작업 디렉터리에 파일을 생성해 보세요!</div>`;
    }

    // Render Staging area
    elements.stagingBox.innerHTML = '';
    const stagedFiles = [];
    for (const [absPath, file] of Object.entries(git.files)) {
        if (file.exists && file.dir === git.workingDir && file.status === 'staged') {
            stagedFiles.push(file.name);
        }
    }

    if (stagedFiles.length > 0) {
        elements.stagingBox.classList.add('has-items');
        stagedFiles.forEach(f => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.style.borderColor = 'var(--accent-green)';
            div.innerHTML = `
                <div class="file-meta">
                    <span class="file-icon" style="color: var(--accent-green)">🟢</span>
                    <span class="file-name" style="color: var(--accent-green)">${f}</span>
                </div>
                <span class="file-status-badge status-staged">STAGED</span>
            `;
            elements.stagingBox.appendChild(div);
        });
    } else {
        elements.stagingBox.classList.remove('has-items');
        elements.stagingBox.innerHTML = `<div class="empty-placeholder">대기 테이블에 물건이 없습니다. 터미널에 \`git add\`를 실행해 보세요.</div>`;
    }

    renderCommitGraph();
}

function renderCommitGraph() {
    elements.commitNodesLayer.innerHTML = '';
    
    if (git.commits.length === 0) {
        elements.gitTreePlaceholder.style.display = 'block';
        elements.graphSvg.style.display = 'none';
        return;
    }

    elements.gitTreePlaceholder.style.display = 'none';
    elements.graphSvg.style.display = 'block';

    git.commits.forEach(commit => {
        const node = document.createElement('div');
        node.className = 'commit-node';
        node.innerHTML = `
            <div class="commit-dot"></div>
            <div class="commit-info">
                <span class="commit-hash">commit ${commit.hash}</span>
                <span class="commit-msg">${commit.message}</span>
                <span class="commit-author">${commit.author}</span>
            </div>
        `;
        elements.commitNodesLayer.appendChild(node);
    });

    setTimeout(() => {
        const dots = document.querySelectorAll('.commit-dot');
        const svg = elements.graphSvg;
        svg.innerHTML = '';

        if (dots.length > 1) {
            for (let i = 0; i < dots.length - 1; i++) {
                const dot1 = dots[i].getBoundingClientRect();
                const dot2 = dots[i+1].getBoundingClientRect();
                const svgRect = svg.getBoundingClientRect();

                const x1 = dot1.left + dot1.width/2 - svgRect.left;
                const y1 = dot1.top + dot1.height/2 - svgRect.top;
                const x2 = dot2.left + dot2.width/2 - svgRect.left;
                const y2 = dot2.top + dot2.height/2 - svgRect.top;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'var(--accent-blue)');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
            }
        }
    }, 50);
}

function writeSystemMessage(msg) {
    const line = document.createElement('div');
    line.className = 'output-line';
    line.innerHTML = `<span class="output-success">🔔 SIMULATOR: ${msg}</span>`;
    elements.terminalOutput.appendChild(line);
    elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;
}

function writeSystemWelcome(msg) {
    const line = document.createElement('div');
    line.className = 'output-line system-welcome';
    line.innerHTML = `PostGitSim Interactive CLI Playground:<br>${msg}`;
    elements.terminalOutput.appendChild(line);
    elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;
}

// Reset terminal outputs on campaign switch
function handleTerminalKey(e) {
    if (e.key === 'Enter') {
        const command = elements.terminalInput.value;
        elements.terminalInput.value = '';
        executeTerminalCommand(command);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.length > 0) {
            if (historyIndex === -1) historyIndex = commandHistory.length - 1;
            else if (historyIndex > 0) historyIndex--;
            elements.terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandHistory.length > 0 && historyIndex !== -1) {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                elements.terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = -1;
                elements.terminalInput.value = '';
            }
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentInput = elements.terminalInput.value;
        if (currentInput.startsWith('git st')) {
            elements.terminalInput.value = 'git status';
        } else if (currentInput.startsWith('git ad')) {
            elements.terminalInput.value = 'git add ';
        } else if (currentInput.startsWith('git co') && !currentInput.includes('config')) {
            elements.terminalInput.value = 'git commit -m "';
        } else if (currentInput.startsWith('git log')) {
            elements.terminalInput.value = 'git log --oneline';
        }
    }
}

function executeTerminalCommand(cmdString) {
    const command = cmdString.trim();
    if (!command) return;

    commandHistory.push(command);
    historyIndex = -1;

    let processedCmd = command;
    if (command.startsWith('!')) {
        processedCmd = command.substring(1);
    }

    const echoLine = document.createElement('div');
    echoLine.className = 'terminal-input-line';
    const path = git.workingDir;
    const promptLabel = `user@postgitsim:${path === '/content/test' ? '~/test' : path}$ `;
    echoLine.innerHTML = `<span class="terminal-prompt">${promptLabel}</span><span class="output-command">${command}</span>`;
    elements.terminalOutput.appendChild(echoLine);

    lastExecutedCommand = processedCmd.replace(/\s+/g, ' ');

    // Run command on GitEngine
    const result = git.executeCommand(processedCmd);

    // Global Event Triggers
    if (result.isError && result.output.includes('Author identity unknown')) {
        userEncounteredAuthError = true;
    }
    if (processedCmd.includes('cd /content') || processedCmd.includes('%cd /content')) {
        if (!processedCmd.includes('test')) {
            userVisitedContentDir = true;
        }
    }
    if (processedCmd.includes('cd ~') || processedCmd.includes('%cd ~') || processedCmd.includes('cd /') || processedCmd.includes('%cd /')) {
        if (!processedCmd.includes('content')) {
            userVisitedHomeDir = true;
        }
    }

    // Render results
    if (result.output === 'CLEAR_TERMINAL') {
        elements.terminalOutput.innerHTML = '';
    } else if (result.output) {
        const responseLine = document.createElement('div');
        responseLine.className = result.isError ? 'output-error' : 'output-text';
        responseLine.innerHTML = result.output.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        elements.terminalOutput.appendChild(responseLine);
    }

    elements.terminalBody.scrollTop = elements.terminalBody.scrollHeight;

    updateVisualState();
    checkMissionProgress();
}

// Objective Checker per step
function checkMissionProgress() {
    const mission = campaignMissions[activeCampaign][currentLevelIndex];
    
    if (activeCampaign === 'colab') {
        if (currentLevelIndex === 0) {
            if (git.isInitialized && git.currentBranch === 'main') {
                tickChecklistItem('init-check');
            }
        } else if (currentLevelIndex === 1) {
            if (git.files['/content/test/README2.md'].exists) {
                tickChecklistItem('create-readme2-check');
            }
            if (lastExecutedCommand === 'git status') {
                tickChecklistItem('status-check');
            }
        } else if (currentLevelIndex === 2) {
            if (git.files['/content/test/README2.md'].status === 'staged') {
                tickChecklistItem('add-check');
            }
            if (userEncounteredAuthError) {
                tickChecklistItem('commit-err-check');
            }
        } else if (currentLevelIndex === 3) {
            if (git.config.userName && git.config.userEmail) {
                tickChecklistItem('config-check');
            }
            if (git.commits.length > 0) {
                tickChecklistItem('commit-success-check');
            }
            if (lastExecutedCommand === 'git log --oneline') {
                tickChecklistItem('log-check');
            }
        } else if (currentLevelIndex === 4) {
            if (git.files['/content/test/README.md'].exists && git.files['/content/test/README.md'].status === 'staged') {
                tickChecklistItem('create-readme-check');
            }
            const hasSecondCommit = git.commits.some(c => c.message.includes('fourth') || c.message.includes('README.md'));
            if (hasSecondCommit) {
                tickChecklistItem('commit2-check');
            }
            if (git.remote.name === 'origin') {
                tickChecklistItem('remote-check');
            }
        } else if (currentLevelIndex === 5) {
            if (userVisitedContentDir) {
                tickChecklistItem('cd-out-check');
            }
            if (userVisitedContentDir && lastExecutedCommand === 'git status' && git.workingDir === '/content') {
                tickChecklistItem('status-err-check');
            }
            if (userVisitedContentDir && git.workingDir === '/content/test' && lastExecutedCommand === 'git status') {
                tickChecklistItem('cd-in-check');
            }
        }
    } else if (activeCampaign === 'security') {
        if (currentLevelIndex === 0) {
            if (git.workingDir === '/') {
                tickChecklistItem('cd-home-check');
            }
        } else if (currentLevelIndex === 1) {
            if (git.workingDir === '/' && git.isHomeInitialized) {
                tickChecklistItem('bad-init-check');
            }
        } else if (currentLevelIndex === 2) {
            if (git.workingDir === '/' && git.isHomeInitialized && lastExecutedCommand === 'git status') {
                tickChecklistItem('danger-status-check');
            }
        } else if (currentLevelIndex === 3) {
            if (git.workingDir === '/' && !git.isHomeInitialized) {
                tickChecklistItem('rm-git-check');
            }
            if (git.workingDir === '/' && !git.isHomeInitialized && lastExecutedCommand === 'git status') {
                tickChecklistItem('status-rm-check');
            }
        } else if (currentLevelIndex === 4) {
            if (git.workingDir === '/content/test') {
                tickChecklistItem('return-project-check');
            }
            
            const hasGitignore = git.files['/content/test/.gitignore'].exists;
            if (hasGitignore) {
                tickChecklistItem('gitignore-check');
            }
            
            const hasSecret = git.files['/content/test/secret.txt'].exists;
            const hasNodeModules = git.files['/content/test/node_modules'].exists;
            
            if (hasSecret && hasNodeModules && lastExecutedCommand.includes('add')) {
                tickChecklistItem('add-unignored-check');
            }

            const secretStaged = git.files['/content/test/secret.txt'].status === 'staged';
            const nodeModulesUntracked = !git.stagingArea.has('/content/test/node_modules');

            if (secretStaged && nodeModulesUntracked && lastExecutedCommand === 'git status') {
                tickChecklistItem('status-ignore-check');
            }
        }
    }

    if (mission.checkCompleted()) {
        triggerLevelComplete();
    }
}

function tickChecklistItem(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('done');
    }
}

function triggerLevelComplete() {
    const activeMissions = campaignMissions[activeCampaign];
    elements.modalMessage.innerHTML = `🎉 축하합니다!<br><strong>LEVEL ${activeMissions[currentLevelIndex].level}: ${activeMissions[currentLevelIndex].title}</strong> 목표를 성공적으로 달성했습니다.`;
    
    if (currentLevelIndex === activeMissions.length - 1) {
        if (activeCampaign === 'colab') {
            elements.btnNextLevel.textContent = '➡️ 고급 보안 코스 진출하기';
        } else {
            elements.btnNextLevel.textContent = '🏆 전체 코스 완료 (자격증 획득) 🏆';
        }
    } else {
        elements.btnNextLevel.textContent = '다음 단계로 이동하기 ➡️';
    }
    
    setTimeout(() => {
        elements.modalOverlay.classList.remove('hidden');
    }, 400);
}
