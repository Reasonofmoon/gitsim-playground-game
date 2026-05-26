/* ==========================================================================
   PostGitSim Virtual Git Logic Engine (Courier Analogy)
   ========================================================================== */

export class GitEngine {
    constructor() {
        this.reset();
    }

    reset() {
        this.isInitialized = false;     // For project path: /content/test
        this.isHomeInitialized = false; // For home path: /
        this.currentBranch = 'main';
        this.workingDir = '/content/test'; // Current active path

        // Upgraded virtual file system: Absolute Paths
        this.files = {
            // Campaign 1 & Project files in /content/test
            '/content/test/README2.md': { name: 'README2.md', exists: false, content: '', status: 'untracked', dir: '/content/test' },
            '/content/test/README.md': { name: 'README.md', exists: false, content: '', status: 'untracked', dir: '/content/test' },
            '/content/test/.gitignore': { name: '.gitignore', exists: false, content: '', status: 'untracked', dir: '/content/test' },
            '/content/test/secret.txt': { name: 'secret.txt', exists: false, content: '', status: 'untracked', dir: '/content/test' },
            '/content/test/node_modules': { name: 'node_modules', exists: false, content: '', status: 'untracked', dir: '/content/test' },
            
            // Campaign 2 Home Directory sensitive files in / (representing ~)
            '/.ssh/id_rsa': { name: '.ssh/id_rsa', exists: true, content: '-----BEGIN RSA PRIVATE KEY-----', status: 'untracked', dir: '/' },
            '/personal_tax.txt': { name: 'personal_tax.txt', exists: true, content: 'TAX RECORD SECRET 2026', status: 'untracked', dir: '/' },
            '/.zshrc': { name: '.zshrc', exists: true, content: 'alias gs="git status"\nexport PATH=$PATH:/usr/local/bin', status: 'untracked', dir: '/' },
            '/bank_info.json': { name: 'bank_info.json', exists: true, content: '{"account": "110-345-6789", "balance": "$10,240"}', status: 'untracked', dir: '/' }
        };

        this.stagingArea = new Set();
        this.commits = []; // Array of { hash: string, message: string, author: string, files: string[] }
        
        this.config = {
            userName: '',
            userEmail: ''
        };

        this.remote = {
            name: '',
            url: ''
        };
    }

    // Helper to check if file is ignored by .gitignore
    isIgnored(filepath) {
        const fileObj = this.files[filepath];
        if (!fileObj) return false;

        const gitignorePath = `${fileObj.dir}/.gitignore`;
        const gitignore = this.files[gitignorePath];

        if (gitignore && gitignore.exists) {
            const patterns = gitignore.content.split('\n')
                .map(p => p.trim())
                .filter(p => p && !p.startsWith('#'));

            for (const pattern of patterns) {
                const cleanPattern = pattern.replace(/\/$/, ''); // strip trailing slash
                
                // Exact or substring match
                if (fileObj.name === cleanPattern || fileObj.name.includes(cleanPattern)) {
                    return true;
                }
                
                // Extension wildcard matching like *.txt
                if (cleanPattern.startsWith('*.')) {
                    const ext = cleanPattern.substring(2);
                    if (fileObj.name.endsWith(`.${ext}`)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Helper to generate a mock git hash
    generateHash() {
        return Math.random().toString(16).substring(2, 9);
    }

    // Action creators from UI buttons
    createFile(filename, content = '') {
        const absPath = this.workingDir === '/content/test' ? `/content/test/${filename}` : `/${filename}`;
        if (this.files[absPath]) {
            this.files[absPath].exists = true;
            this.files[absPath].content = content;
            this.files[absPath].status = 'untracked';
            return true;
        }
        return false;
    }

    modifyFile(filename, content = 'modified') {
        const absPath = this.workingDir === '/content/test' ? `/content/test/${filename}` : `/${filename}`;
        if (this.files[absPath] && this.files[absPath].exists) {
            this.files[absPath].content = content;
            if (this.files[absPath].status === 'committed') {
                this.files[absPath].status = 'modified';
            }
            return true;
        }
        return false;
    }

    // Command parser & executor
    executeCommand(cmdLine) {
        const trimmed = cmdLine.trim();
        if (!trimmed) return { success: true, output: '', isError: false };

        // 1. Directory Change command (cd)
        if (trimmed.startsWith('%cd') || trimmed.startsWith('cd')) {
            return this.handleCdCommand(trimmed);
        }

        // 2. Clear terminal command
        if (trimmed === 'clear') {
            return { success: true, output: 'CLEAR_TERMINAL', isError: false };
        }

        // 3. Simulated file writing with echo redirection (echo "pattern" > filename)
        if (trimmed.startsWith('echo')) {
            return this.handleEchoRedirection(trimmed);
        }

        // 4. Simulated file removal (rm -rf)
        if (trimmed.startsWith('rm')) {
            return this.handleRmCommand(trimmed);
        }

        const tokens = trimmed.split(/\s+/);
        const baseCmd = tokens[0];

        if (baseCmd !== 'git') {
            return {
                success: false,
                isError: true,
                output: `bash: ${baseCmd}: command not found\nDid you forget to prepend 'git'?`
            };
        }

        // Git commands parsing
        const gitSubCmd = tokens[1];
        if (!gitSubCmd) {
            return {
                success: false,
                isError: true,
                output: `usage: git [--version] [--help] <command> [<args>]`
            };
        }

        // Repository Initialization Boundary check
        const activeRepoInitialized = this.workingDir === '/' ? this.isHomeInitialized : this.isInitialized;
        
        if (gitSubCmd !== 'init' && gitSubCmd !== 'config' && !activeRepoInitialized) {
            return {
                success: false,
                isError: true,
                output: `fatal: not a git repository (or any of the parent directories): .git`
            };
        }

        switch (gitSubCmd) {
            case 'init':
                return this.handleInit(tokens);
            case 'status':
                return this.handleStatus();
            case 'add':
                return this.handleAdd(tokens);
            case 'commit':
                return this.handleCommit(tokens);
            case 'log':
                return this.handleLog(tokens);
            case 'config':
                return this.handleConfig(tokens);
            case 'remote':
                return this.handleRemote(tokens);
            default:
                return {
                    success: false,
                    isError: true,
                    output: `git: '${gitSubCmd}' is not a git command. See 'git --help'.`
                };
        }
    }

    // Handle %cd / cd directory switching
    handleCdCommand(cmdLine) {
        const parts = cmdLine.split(/\s+/);
        const path = parts[1];

        if (!path) {
            return { success: true, output: '', isError: false };
        }

        if (path === '/' || path === '~' || path === '..' || path === '../..') {
            this.workingDir = '/';
            return { 
                success: true, 
                output: `/\n\n📮 [우체국 가이드] 내 방을 벗어나 시스템 최상위인 '홈 디렉터리(/)'로 이동했습니다.`, 
                isError: false 
            };
        } else if (path === '/content/test' || path === 'test' || path === './test' || path === 'content/test') {
            this.workingDir = '/content/test';
            return { 
                success: true, 
                output: `/content/test\n\n📮 [우체국 가이드] 안전하고 약속된 내 방 작업 디렉터리(/content/test)로 정상 복귀했습니다.`, 
                isError: false 
            };
        } else if (path === '/content') {
            this.workingDir = '/content';
            return { success: true, output: '/content', isError: false };
        } else {
            return {
                success: false,
                isError: true,
                output: `bash: cd: ${path}: No such file or directory`
            };
        }
    }

    // Handle echo "node_modules/" > .gitignore
    handleEchoRedirection(cmdLine) {
        const match = cmdLine.match(/^echo\s+['"]?(.+?)['"]?\s*>\s*([a-zA-Z0-9\._\-]+)$/);
        if (match) {
            const content = match[1].replace(/\\n/g, '\n');
            const filename = match[2];
            const absPath = this.workingDir === '/content/test' ? `/content/test/${filename}` : `/${filename}`;

            if (this.files[absPath]) {
                this.files[absPath].exists = true;
                this.files[absPath].content = content;
                this.files[absPath].status = this.files[absPath].status === 'committed' ? 'modified' : 'untracked';
                return { 
                    success: true, 
                    output: `📮 [우체국 가이드] 성공적으로 내 방 대장에 ${filename} 규칙을 써넣었습니다.`, 
                    isError: false 
                };
            }
        }
        return {
            success: false,
            isError: true,
            output: `bash: syntax error near unexpected token`
        };
    }

    // Handle rm -rf .git
    handleRmCommand(cmdLine) {
        const tokens = cmdLine.split(/\s+/);
        const target = tokens[tokens.length - 1];

        if (target === '.git' || target === '/.git' || target === 'test/.git') {
            if (this.workingDir === '/') {
                if (this.isHomeInitialized) {
                    this.isHomeInitialized = false;
                    return {
                        success: true,
                        isError: false,
                        output: `🔔 SIMULATOR: 잘못 생성된 홈 디렉터리의 .git 저장소가 안전하게 철거되었습니다.\n\n📮 [우체국 가이드] 휴! 시스템 최상단에 잘못 설치된 비밀 장부실(.git)을 폭파하여 개인 보안 노출 위험을 원천 방어했습니다!`
                    };
                }
            } else if (this.workingDir === '/content/test') {
                if (this.isInitialized) {
                    this.isInitialized = false;
                    return {
                        success: true,
                        isError: false,
                        output: `🔔 SIMULATOR: 프로젝트 디렉터리의 .git 저장소가 삭제되었습니다.\n\n📮 [우체국 가이드] 내 방의 취급점 비밀 장부실을 허물었습니다. 이제부터 이 방 내부의 파일 변화는 추적되지 않습니다.`
                    };
                }
            }
            return {
                success: false,
                isError: true,
                output: `rm: cannot remove '${target}': No such file or directory`
            };
        }

        return {
            success: false,
            isError: true,
            output: `rm: command recognized but simulated only for '.git' removals in this playground.`
        };
    }

    // git init
    handleInit(tokens) {
        let branchArg = 'master';
        const bIdx = tokens.indexOf('-b');
        if (bIdx !== -1 && tokens[bIdx + 1]) {
            branchArg = tokens[bIdx + 1];
        }

        this.currentBranch = branchArg;

        if (this.workingDir === '/') {
            if (this.isHomeInitialized) {
                return { success: true, output: `Reinitialized existing Git repository in /.git/`, isError: false };
            }
            this.isHomeInitialized = true;
            return { 
                success: true, 
                output: `Initialized empty Git repository in /.git/\n\n📮 [우체국 가이드] ⚠️ 대경고! F:\\ 최상위 홈 디렉터리에 실수로 취급점 간판(.git)을 세워 버렸습니다!`, 
                isError: false 
            };
        } else {
            if (this.isInitialized) {
                return { success: true, output: `Reinitialized existing Git repository in /content/test/.git/`, isError: false };
            }
            this.isInitialized = true;
            return { 
                success: true, 
                output: `Initialized empty Git repository in /content/test/.git/\n\n📮 [우체국 가이드] 내 방 작업 폴더 구석에 무사히 '비밀 창고 겸 장부실(.git)'을 개설했습니다! 중심 선반(Branch)의 이름은 '${this.currentBranch}'로 세팅되었습니다.`, 
                isError: false 
            };
        }
    }

    // git status
    handleStatus() {
        let output = `On branch ${this.currentBranch}\n\n`;

        const untracked = [];
        const staged = [];
        const modified = [];

        for (const [absPath, file] of Object.entries(this.files)) {
            if (!file.exists || file.dir !== this.workingDir) continue;

            if (this.isIgnored(absPath)) continue;

            if (file.status === 'untracked') {
                untracked.push(file.name);
            } else if (file.status === 'staged') {
                staged.push(file.name);
            } else if (file.status === 'modified') {
                modified.push(file.name);
            }
        }

        const hasCommits = this.commits.length > 0;
        if (!hasCommits) {
            output += `No commits yet\n\n`;
        }

        let changesStagedText = '';
        if (staged.length > 0) {
            changesStagedText += `Changes to be committed:\n  (use "git rm --cached <file>..." to unstage)\n`;
            staged.forEach(f => {
                changesStagedText += `\tnew file:   ${f}\n`;
            });
            changesStagedText += `\n`;
        }

        let changesNotStagedText = '';
        if (modified.length > 0) {
            changesNotStagedText += `Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n`;
            modified.forEach(f => {
                changesNotStagedText += `\tmodified:   ${f}\n`;
            });
            changesNotStagedText += `\n`;
        }

        let untrackedText = '';
        if (untracked.length > 0) {
            untrackedText += `Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
            untracked.forEach(f => {
                untrackedText += `\t${f}\n`;
            });
            untrackedText += `\n`;
        }

        output += changesStagedText + changesNotStagedText + untrackedText;

        if (staged.length === 0 && untracked.length === 0 && modified.length === 0) {
            output += `nothing to commit, working tree clean`;
        } else if (staged.length === 0 && (untracked.length > 0 || modified.length > 0)) {
            output += `nothing added to commit but untracked files present (use "git add" to track)`;
        }

        // Home Directory initialization Warning
        if (this.workingDir === '/') {
            output += `\n\n⚠️  [보안 위험 경고] 민감한 개인 정보 및 시스템 보안 파일들이 Git 추적 대기 목록에 노출되었습니다!\n이곳은 작업 폴더가 아닌 시스템 전체를 아우르는 '홈(Home) 디렉터리'입니다.\n당장 잘못 설치된 '.git' 저장소를 삭제(rm -rf .git)하세요!`;
        } else {
            // Append Post Office status mapping guides
            if (staged.length > 0 || untracked.length > 0) {
                output += `\n\n📮 [우체국 가이드]`;
                if (untracked.length > 0) {
                    output += `\n  - 빨간색 파일은 포장되지 않아 대기대에 올라가지 않은 'Untracked(작업대)' 상태의 물건입니다.`;
                }
                if (staged.length > 0) {
                    output += `\n  - 초록색 파일은 배송 포장을 마치고 '접수 대기 테이블(Staging Area)'에 예쁘게 정렬된 상태입니다!`;
                }
            }
        }

        return { success: true, output: output.trim(), isError: false };
    }

    // git add
    handleAdd(tokens) {
        const fileArg = tokens.slice(2).join(' ');
        if (!fileArg) {
            return {
                success: false,
                isError: true,
                output: `Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?`
            };
        }

        const targets = [];
        if (fileArg === '.' || fileArg === '*') {
            for (const [absPath, file] of Object.entries(this.files)) {
                if (file.exists && file.dir === this.workingDir && (file.status === 'untracked' || file.status === 'modified')) {
                    if (!this.isIgnored(absPath)) {
                        targets.push(absPath);
                    }
                }
            }
        } else {
            const absPath = this.workingDir === '/content/test' ? `/content/test/${fileArg}` : `/${fileArg}`;
            if (this.files[absPath] && this.files[absPath].exists) {
                if (this.isIgnored(absPath)) {
                    return {
                        success: false,
                        isError: true,
                        output: `The following paths are ignored by one of your .gitignore files:\n  ${fileArg}\nUse -f if you really want to add them.\n\n📮 [우체국 가이드] 차단 리스트(.gitignore)에 걸려 있어 대기 테이블에 올릴 수 없습니다!`
                    };
                }
                targets.push(absPath);
            } else {
                return {
                    success: false,
                    isError: true,
                    output: `fatal: pathspec '${fileArg}' did not match any files`
                };
            }
        }

        if (targets.length === 0) {
            return { success: true, output: '', isError: false };
        }

        targets.forEach(path => {
            this.stagingArea.add(path);
            this.files[path].status = 'staged';
        });

        const names = targets.map(p => this.files[p].name).join(', ');
        return { 
            success: true, 
            output: `📮 [우체국 가이드] ${names} 물건들을 포장해서 '접수 대기 테이블(Staging Area)' 위에 올려놓았습니다.`, 
            isError: false 
        };
    }

    // git commit
    handleCommit(tokens) {
        if (!this.config.userName || !this.config.userEmail) {
            return {
                success: false,
                isError: true,
                output: `Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"\n\nto set your account's default identity.\nOmit --global to set the identity only in this repository.\n\nfatal: unable to auto-detect email address (got 'root@534152b38ccb.(none)')\n\n📮 [우체국 가이드] 발송인 서명(이름, 이메일) 정보가 누락되었습니다! 우체국장은 누가 보낸 택배인지 알지 못하면 접수하지 않습니다.`
            };
        }

        const mIdx = tokens.indexOf('-m');
        let commitMsg = '';
        if (mIdx !== -1 && tokens[mIdx + 1]) {
            const rawMsgTokens = tokens.slice(mIdx + 1);
            commitMsg = rawMsgTokens.join(' ').replace(/^['"]|['"]$/g, '');
        } else {
            return {
                success: false,
                isError: true,
                output: `error: switch 'm' requires a value`
            };
        }

        if (this.stagingArea.size === 0) {
            return {
                success: false,
                isError: true,
                output: `On branch ${this.currentBranch}\nnothing to commit, working tree clean\n\n📮 [우체국 가이드] 접수 대기 테이블에 올린 물건이 아무것도 없습니다. 먼저 'git add'를 하셔야 합니다!`
            };
        }

        const hash = this.generateHash();
        const filesCommitted = Array.from(this.stagingArea);
        const author = `${this.config.userName} <${this.config.userEmail}>`;

        const newCommit = {
            hash,
            message: commitMsg,
            author,
            files: filesCommitted.map(p => this.files[p].name)
        };

        this.commits.push(newCommit);

        filesCommitted.forEach(p => {
            this.files[p].status = 'committed';
        });

        this.stagingArea.clear();

        const isRoot = this.commits.length === 1;
        const commitLabel = isRoot ? 'root-commit' : '';

        return {
            success: true,
            isError: false,
            output: `[${this.currentBranch} ${commitLabel ? '(' + commitLabel + ') ' : ''}${hash}] ${commitMsg}\n ${filesCommitted.length} file${filesCommitted.length > 1 ? 's' : ''} changed\n create mode 100644 ${filesCommitted.map(p => this.files[p].name).join(', ')}\n\n📮 [우체국 가이드] 🎉 축하합니다! 대기대에 쌓여있던 박스들에 고유 '운송장 번호(커밋 해시: ${hash})'를 부착하고 창고의 '${this.currentBranch}' 선반에 완벽하게 영구 적재(Commit)했습니다!`
        };
    }

    // git log
    handleLog(tokens) {
        if (this.commits.length === 0) {
            return {
                success: false,
                isError: true,
                output: `fatal: your current branch '${this.currentBranch}' does not have any commits yet`
            };
        }

        const hasOneLineTypo = tokens.includes('--one') && tokens.includes('line');
        if (hasOneLineTypo) {
            return {
                success: false,
                isError: true,
                output: `fatal: ambiguous argument 'line': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n\n📮 [우체국 가이드] '--oneline' 옵션 오타가 발생했습니다! 띄어쓰기를 지워 한 단어로 적어야 합니다.`
            };
        }

        const isOneLine = tokens.includes('--oneline');
        const logCommits = [...this.commits].reverse();

        if (isOneLine) {
            const output = logCommits.map(c => `<span class="commit-hash">${c.hash}</span> ${c.message}`).join('\n');
            return { 
                success: true, 
                output: `${output}\n\n📮 [우체국 가이드] 현재까지 발행된 택배 운송장 영수증들의 간편 한 줄 요약 목록입니다.`, 
                isError: false 
            };
        } else {
            const output = logCommits.map(c => {
                return `commit ${c.hash} (HEAD -> ${this.currentBranch})\nAuthor: ${c.author}\nDate:   ${new Date().toUTCString()}\n\n    ${c.message}\n`;
            }).join('\n');
            return { 
                success: true, 
                output: `${output}\n\n📮 [우체국 가이드] 현재 창고에 적재된 택배 상자들의 아주 상세한 전송 영수증 대장 목록입니다.`, 
                isError: false 
            };
        }
    }

    // git config
    handleConfig(tokens) {
        const isGlobal = tokens.includes('--global');
        if (!isGlobal) {
            return {
                success: false,
                isError: true,
                output: `error: Omit --global to set the identity only in this repository.`
            };
        }

        const nameIdx = tokens.indexOf('user.name');
        const emailIdx = tokens.indexOf('user.email');

        if (nameIdx !== -1 && tokens[nameIdx + 1]) {
            const rawName = tokens.slice(nameIdx + 1).join(' ').replace(/^['"]|['"]$/g, '');
            this.config.userName = rawName;
            return { 
                success: true, 
                output: `📮 [우체국 가이드] 장부에 발송인 이름('${rawName}')을 등록했습니다.`, 
                isError: false 
            };
        }

        if (emailIdx !== -1 && tokens[emailIdx + 1]) {
            const rawEmail = tokens.slice(emailIdx + 1).join(' ').replace(/^['"]|['"]$/g, '');
            this.config.userEmail = rawEmail;
            return { 
                success: true, 
                output: `📮 [우체국 가이드] 장부에 발송인 이메일 주소('${rawEmail}')를 등록했습니다.`, 
                isError: false 
            };
        }

        return {
            success: false,
            isError: true,
            output: `error: user.name or user.email value is required`
        };
    }

    // git remote
    handleRemote(tokens) {
        const isAdd = tokens[2] === 'add';
        const isList = tokens.includes('-v');

        if (isAdd && tokens[3] === 'origin' && tokens[4]) {
            this.remote.name = 'origin';
            this.remote.url = tokens[4];
            return { 
                success: true, 
                output: `📮 [우체국 가이드] 우체국 중앙 물류 허브(GitHub)의 원격 보관 주소를 장부에 별명 'origin'으로 성공적으로 등록 완료했습니다!`, 
                isError: false 
            };
        }

        if (isList) {
            if (!this.remote.name) {
                return { success: true, output: '', isError: false };
            }
            return {
                success: true,
                isError: false,
                output: `${this.remote.name}\t${this.remote.url} (fetch)\n${this.remote.name}\t${this.remote.url} (push)\n\n📮 [우체국 가이드] 현재 등록된 별명 'origin'의 원격 우체국 허브 연결 상태입니다.`
            };
        }

        return {
            success: false,
            isError: true,
            output: `usage: git remote add <name> <url>\n   or: git remote -v`
        };
    }
}
