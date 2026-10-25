   /* GAME DATA DEFINITIONS */
        const RACES = {
            BAKEMON: { name: '化門', color: 'bg-red-700', border: 'border-red-500', text: 'text-red-400' },
            HUMAN: { name: '人間', color: 'bg-blue-700', border: 'border-blue-500', text: 'text-blue-400' }
        };

        const CHARACTERS_DATA = {
            tosaka: {
                id: 'tosaka',
                name: '【「調査兵団」渡査過】',
                race: 'BAKEMON',
                stars: 2,
                maxHp: 50,
                maxSp: 70,
                image: 'cards/tosaka card.png',
                bgGradient: 'from-amber-900/40 to-red-950/60',
                skills: [
                    { id: 'tosaka_1', hand: 'gu', handIcon: '✊', name: '鶏冠 (クラウン)', desc: '次からダメージ二倍 (重複有り)', type: 'buff' },
                    { id: 'tosaka_2', hand: 'choki', handIcon: '✌️', name: '産卵', desc: '自分のSPが 5 下がる', type: 'debuff_self' },
                    { id: 'tosaka_3', hand: 'pa', handIcon: '✋', name: '威嚇 (プレッシャー)', desc: '相手のバケモンのHP上限を5下げる', type: 'debuff_enemy' }
                ]
            },
            doradora: {
                id: 'doradora',
                name: '【ドラドラ】',
                race: 'BAKEMON',
                stars: 3,
                maxHp: 75,
                maxSp: 75,
                image:'cards/doradora card.png',
                bgGradient: 'from-red-900/40 to-rose-950/60',
                skills: [
                    { id: 'doradora_1', hand: 'gu', handIcon: '✊1', name: 'ドラ確', desc: 'あいこでも自分の攻撃ターンになる。相手に20ダメージ', damage: 20, priorityOnDraw: true, type: 'attack' },
                    { id: 'doradora_2', hand: 'choki', handIcon: '✌️', name: '気合いのチョキ', desc: '次の受けるダメージ半減', type: 'defense' },
                    { id: 'doradora_3', hand: 'gu', handIcon: '✊2', name: 'パンチ', desc: '相手に30ダメージ', damage: 30, type: 'attack' }
                ]
            },
            kakuseiti: {
                id: 'kakuseiti',
                name: '【「有為転変」覚醒ちい】',
                race: 'BAKEMON',
                stars: 4,
                maxHp: 150,
                maxSp: 55,
                image:'cards/kakuseiti card.png',
                bgGradient: 'from-purple-900/40 to-slate-950/60',
                skills: [
                    { id: 'kakuseiti_1', hand: 'gu', handIcon: '✊', name: 'パンチ', desc: '相手に20ダメージ', damage: 20, type: 'attack' },
                    { id: 'kakuseiti_2', hand: 'choki', handIcon: '✌️', name: 'キショキショ攻撃', desc: '相手に20ダメージ、その後毎ターン5の継続ダメージ', damage: 20, dot: 5, type: 'attack_dot' },
                    { id: 'kakuseiti_3', hand: 'pa', handIcon: '✋', name: '無為転変', desc: '相手が人間なら35ダメージ、化門なら20ダメージ', damageHuman: 35, damageBakemon: 20, type: 'attack_race' }
                ]
            },
            masayoshi: {
                id: 'masayoshi',
                name: '【( ˆωˆ ) おっ骨まさよし】',
                race: 'HUMAN',
                stars: 5,
                maxHp: 100,
                maxSp: 300,
                image:'cards/masayosi card.png',
                bgGradient: 'from-blue-900/40 to-indigo-950/60',
                skills: [
                    { id: 'masayoshi_1', hand: 'gu', handIcon: '✊', name: '純愛砲', desc: '相手に45ダメージ', damage: 45, type: 'attack' },
                    { id: 'masayoshi_2', hand: 'choki', handIcon: '✌️', name: '反転術式', desc: '25回復。相手が化門の場合SP15ダウン', heal: 25, spDrainBakemon: 15, type: 'heal_sp' },
                    { id: 'masayoshi_3', hand: 'pa', handIcon: '✋', name: '無制限の呪力', desc: '相手に30ダメージ、自分のSP5アップ', damage: 30, spUp: 5, type: 'attack_sp' }
                ]
            }
        };
/* ==============================
   漫画風バトルエフェクト
============================== */

function playBattleHitEffect(damage) {
    // 画面にエフェクトを重ねる
    const fx = document.createElement('div');
    fx.className = 'battle-fx-overlay';
    fx.setAttribute('aria-hidden', 'true');

    // 白いヒットフラッシュ
    const flash = document.createElement('div');
    flash.className = 'battle-flash';
    fx.appendChild(flash);

    // 衝撃波
    const shockwave = document.createElement('div');
    shockwave.className = 'battle-shockwave';
    fx.appendChild(shockwave);

    // ダメージ数字
    const number = document.createElement('div');
    number.className = 'damage-number';
    number.textContent = `−${damage}`;
    fx.appendChild(number);

    // 飛び散る光の粒子
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'battle-particle';

        const angle = (Math.PI * 2 * i) / 12;
        const distance = 65 + Math.random() * 100;

        particle.style.setProperty('--dx',
            `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--dy',
            `${Math.sin(angle) * distance}px`);

        fx.appendChild(particle);
    }

    document.body.appendChild(fx);

    // ゲーム画面を揺らす
    const app = document.getElementById('app-container');
    if (app) {
        app.classList.remove('battle-shake');
        void app.offsetWidth;
        app.classList.add('battle-shake');

        setTimeout(() => {
            app.classList.remove('battle-shake');
        }, 300);
    }

    setTimeout(() => fx.remove(), 800);
}

function playBattleResultEffect(isWin) {
    // 同じ結果演出の重複を防ぐ
    document.getElementById('battle-result-fx')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'battle-result-fx';
    overlay.className =
        `battle-result-fx${isWin ? '' : ' is-defeat'}`;

    const text = document.createElement('span');
    text.textContent = isWin ? 'VICTORY!' : 'DEFEAT...';

    overlay.appendChild(text);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.remove(), 2300);
}

        class GameEngine {
            constructor() {
                this.currentScreen = 'SELECT'; // SELECT, BATTLE, RESULT
                this.playerTeam = [];
                this.cpuTeam = [];
                this.playerActiveIdx = 0;
                this.cpuActiveIdx = 0;
                
                this.lastPlayerSkillId = null;
                this.lastCpuSkillId = null;
                
                this.battleLogs = [];
                this.roundCount = 1;
                this.isProcessing = false;
            }

            init() {
                this.currentScreen = 'SELECT';
                this.playerTeam = [];
                this.cpuTeam = [];
                this.playerActiveIdx = 0;
                this.cpuActiveIdx = 0;
                this.lastPlayerSkillId = null;
                this.lastCpuSkillId = null;
                this.battleLogs = ["戦闘開始！出撃バケモン/人間を選んでバトルを始めてください。"];
                this.roundCount = 1;
                this.isProcessing = false;
                this.render();
            }

            // Create character object with battle state
            createBattleChar(charKey) {
                const base = CHARACTERS_DATA[charKey];
                return {
                    ...base,
                    hp: base.maxHp,
                    maxHp: base.maxHp,
                    sp: base.maxSp,
                    maxSp: base.maxSp,
                    multiplier: 1, // ダメージ2倍の重複フラグ等
                    halfDamageNext: false, // ダメージ半減フラグ
                    dotDamage: 0, // 毎ターンダメージ
                    dotTurns: 0,
                    isFainted: false
                };
            }

            startBattle(selectedKeys) {
                if (selectedKeys.length !== 3) return;
                
                this.playerTeam = selectedKeys.map(key => this.createBattleChar(key));
                
                // CPU gets random 3 characters (or duplicates if allowed, here random selection)
                const allKeys = Object.keys(CHARACTERS_DATA);
                const cpuKeys = [];
                for(let i=0; i<3; i++) {
                    const randKey = allKeys[Math.floor(Math.random() * allKeys.length)];
                    cpuKeys.push(randKey);
                }
                this.cpuTeam = cpuKeys.map(key => this.createBattleChar(key));

                this.playerActiveIdx = 0;
                this.cpuActiveIdx = 0;
                this.currentScreen = 'BATTLE';
                this.battleLogs = ["バトルスタート！じゃんけんの手と技を選択してください。"];
                this.render();
            }

            // 1: Player wins, -1: CPU wins, 0: Draw
            judgeJanken(pHand, cHand) {
                if (pHand === cHand) return 0;
                if (
                    (pHand === 'gu' && cHand === 'choki') ||
                    (pHand === 'choki' && cHand === 'pa') ||
                    (pHand === 'pa' && cHand === 'gu')
                ) {
                    return 1;
                }
                return -1;
            }

           executeTurn(playerSkillIndex) {
              　this.render();
                if (this.isProcessing) return;

                const playerChar = this.playerTeam[this.playerActiveIdx];
                const cpuChar = this.cpuTeam[this.cpuActiveIdx];

                const playerSkill = playerChar.skills[playerSkillIndex];

                // Check Same Skill Cooldown Rule
                if (playerSkill.id === this.lastPlayerSkillId) {
                    this.addLog("⚠️ 同じ技を連続で使用することはできません！他の技を選んでください。");
                    this.render();
                    return;
                }

                this.isProcessing = true;

                // CPU chooses a valid random skill (not consecutive)
                const availableCpuIndices = cpuChar.skills
                    .map((s, idx) => ({ s, idx }))
                    .filter(item => item.s.id !== this.lastCpuSkillId)
                    .map(item => item.idx);
                
                const cpuSkillIndex = availableCpuIndices.length > 0 
                    ? availableCpuIndices[Math.floor(Math.random() * availableCpuIndices.length)]
                    : Math.floor(Math.random() * cpuChar.skills.length);
                
                const cpuSkill = cpuChar.skills[cpuSkillIndex];

                // Save last skills
                this.lastPlayerSkillId = playerSkill.id;
                this.lastCpuSkillId = cpuSkill.id;

                const pHandGroup = playerSkill.hand;
                const cHandGroup = cpuSkill.hand;

                let outcome = this.judgeJanken(pHandGroup, cHandGroup);

                this.addLog(`--- ターン ${this.roundCount} ---`);
                this.addLog(`【あなた】${playerChar.name} の 『${playerSkill.name}』 (${playerSkill.handIcon})`);
                this.addLog(`【相手】${cpuChar.name} の 『${cpuSkill.name}』 (${cpuSkill.handIcon})`);

                // Check Draw Priority (e.g. Doradora's ドラ確)
                if (outcome === 0) {
                    const pPriority = !!playerSkill.priorityOnDraw;
                    const cPriority = !!cpuSkill.priorityOnDraw;

                    if (pPriority && !cPriority) {
                        outcome = 1;
                        this.addLog(`💡 [あいこ判定] あなたの『${playerSkill.name}』の効果で攻撃権を獲得！`);
                    } else if (!pPriority && cPriority) {
                        outcome = -1;
                        this.addLog(`💡 [あいこ判定] 相手の『${cpuSkill.name}』の効果で相手の攻撃権を獲得！`);
                    } else if (playerChar.sp > cpuChar.sp) {
                        outcome = 1;
                        this.addLog(`⚡ あいこ！SPが高いあなたが攻撃権を獲得！`);
                    } else if (cpuChar.sp > playerChar.sp) {
                        outcome = -1;
                        this.addLog(`⚡ あいこ！SPが高い相手が攻撃権を獲得！`);
                    } else {
                        this.addLog(`🤝 あいこ！SPも同じなので攻撃なし！`);
                }
                }

                // Execute Attacks/Effects
                if (outcome === 1) {
                    this.addLog(`✨ あなたの勝利！『${playerSkill.name}』発動！`);
                    this.applySkillEffects(playerChar, cpuChar, playerSkill);
                } else if (outcome === -1) {
                    this.addLog(`💥 相手の勝利！『${cpuSkill.name}』発動！`);
                    this.applySkillEffects(cpuChar, playerChar, cpuSkill);
                }

                // Apply End-of-turn DoT Damage
                this.applyDoT(playerChar, "あなた");
                this.applyDoT(cpuChar, "相手");

                // Check Fainting & Switch
                this.checkFaintAndSwitch();

                this.roundCount++;
                this.isProcessing = false;

                // Check Game Over
                if (this.checkGameOver()) return;

                this.render();
                }
    
　　executeOnlineTurn(playerSkillIndex, cpuSkillIndex) {
    if (this.currentScreen !== "BATTLE") return;

    this.isProcessing = true;

    const player = this.playerTeam[this.playerActiveIdx];
    const cpu = this.cpuTeam[this.cpuActiveIdx];

    const playerSkill = player.skills[playerSkillIndex];
    const cpuSkill = cpu.skills[cpuSkillIndex];

    if (!player || !cpu || !playerSkill || !cpuSkill) {
        this.isProcessing = false;
        return;
    }

    this.lastPlayerSkillId = playerSkill.id;
    this.lastCpuSkillId = cpuSkill.id;

    const result = this.judgeJanken(
        playerSkill.hand,
        cpuSkill.hand
    );

    if (result === 1) {
        this.addLog(`あなたの「${playerSkill.name}」が勝利！`);
        this.applySkillEffects(player, cpu, playerSkill);
    } else if (result === -1) {
        this.addLog(`相手の「${cpuSkill.name}」が勝利！`);
        this.applySkillEffects(cpu, player, cpuSkill);
    } else {
        this.addLog("じゃんけんはあいこ！");

        if (playerSkill.priorityOnDraw) {
            this.addLog(`あなたの「${playerSkill.name}」があいこで発動！`);
            this.applySkillEffects(player, cpu, playerSkill);
        } else if (cpuSkill.priorityOnDraw) {
            this.addLog(`相手の「${cpuSkill.name}」があいこで発動！`);
            this.applySkillEffects(cpu, player, cpuSkill);
        } else if (player.sp > cpu.sp) {
            this.addLog("SPが多いあなたが攻撃！");
            this.applySkillEffects(player, cpu, playerSkill);
        } else if (cpu.sp > player.sp) {
            this.addLog("SPが多い相手が攻撃！");
            this.applySkillEffects(cpu, player, cpuSkill);
        } else {
            this.addLog("SPも同じなので攻撃なし！");
        }
    }

    this.applyDoT(player, "あなた");
    this.applyDoT(cpu, "相手");

    this.checkFaintAndSwitch();
    this.roundCount++;

    this.isProcessing = false;
    this.checkGameOver();
    this.render();
}
            
            applySkillEffects(attacker, defender, skill) {
                // Base Damage Calculation
                let rawDamage = 0;

                if (skill.damage) {
                    rawDamage = skill.damage;
                } else if (skill.damageHuman || skill.damageBakemon) {
                    // Race specific damage (無為転変)
                    rawDamage = (defender.race === 'HUMAN') ? skill.damageHuman : skill.damageBakemon;
                }

                if (rawDamage > 0) {
                    // Apply Multiplier (e.g. 鶏冠 double damage)
                    let finalDamage = rawDamage * attacker.multiplier;
                    if (attacker.multiplier > 1) {
                        this.addLog(`🔥 ダメージが ${attacker.multiplier} 倍に強化された！`);
                        attacker.multiplier = 1; // Reset after attack
                    }

                    // Apply Defense Halving (気合いのチョキ)
                    if (defender.halfDamageNext) {
                        finalDamage = Math.floor(finalDamage / 2);
                        this.addLog(`🛡️ 相手はダメージを半減した！`);
                        defender.halfDamageNext = false;
                    }

                    defender.hp = Math.max(0, defender.hp - finalDamage);
                    this.addLog(`💥 ${defender.name} に ${finalDamage} ダメージ！`);
                   playBattleHitEffect(finalDamage);
                }

                // Specific Buffs & Debuffs
                if (skill.id === 'tosaka_1') { // 鶏冠
                    attacker.multiplier *= 2;
                    this.addLog(`💪 次からの攻撃ダメージが 2 倍になった！（重複可: 現在 ${attacker.multiplier}倍）`);
                }

                if (skill.id === 'tosaka_2') { // 産卵
                    attacker.sp = Math.max(0, attacker.sp - 5);
                    this.addLog(`🍳 産卵により自分のSPが 5 下がった。(残SP: ${attacker.sp})`);
                }

                if (skill.id === 'tosaka_3') { // 威嚇
                    if (defender.race === 'BAKEMON') {
                        defender.maxHp = Math.max(1, defender.maxHp - 5);
                        defender.hp = Math.min(defender.hp, defender.maxHp);
                        this.addLog(`😱 プレッシャー！相手の化門の最大HPが 5 下がった！(最大HP: ${defender.maxHp})`);
                    } else {
                        this.addLog(`相手は人間なので威嚇の効果は薄いようだ...`);
                    }
                }

                if (skill.id === 'doradora_2') { // 気合いのチョキ
                    attacker.halfDamageNext = true;
                    this.addLog(`🛡️ 次の攻撃を受けるダメージを半減する態勢をとった！`);
                }

                if (skill.dot) { // キショキショ攻撃
                    defender.dotDamage = skill.dot;
                    defender.dotTurns = 99; // Continuous
                    this.addLog(`🤢 ${defender.name} は精神的苦痛(毎ターン5ダメージ)を受けた！`);
                }

                if (skill.heal) { // 反転術式
                    const healed = Math.min(attacker.maxHp - attacker.hp, skill.heal);
                    attacker.hp += healed;
                    this.addLog(`💚 ${attacker.name} のHPが ${healed} 回復した！`);

                    if (skill.spDrainBakemon && defender.race === 'BAKEMON') {
                        defender.sp = Math.max(0, defender.sp - skill.spDrainBakemon);
                        this.addLog(`⚡ 相手の化門のSPを ${skill.spDrainBakemon} ダウンさせた！`);
                    }
                }

                if (skill.spUp) { // 無制限の呪力
                    attacker.sp = Math.min(attacker.maxSp, attacker.sp + skill.spUp);
                    this.addLog(`✨ 自分のSPが ${skill.spUp} 上昇した！`);
                }
            }

            applyDoT(target, ownerLabel) {
                if (target.hp > 0 && target.dotTurns > 0 && target.dotDamage > 0) {
                    target.hp = Math.max(0, target.hp - target.dotDamage);
                    this.addLog(`🤢 [継続ダメ] ${ownerLabel}の ${target.name} は精神的苦痛で ${target.dotDamage} ダメージ！`);
                }
            }

            checkFaintAndSwitch() {
                const pActive = this.playerTeam[this.playerActiveIdx];
                if (pActive.hp <= 0 && !pActive.isFainted) {
                    pActive.isFainted = true;
                    this.addLog(`💀 あなたの ${pActive.name} は倒れた！`);
                    
                    const nextIdx = this.playerTeam.findIndex(c => !c.isFainted);
                    if (nextIdx !== -1) {
                        this.playerActiveIdx = nextIdx;
                        this.lastPlayerSkillId = null; // reset cooldown for new active
                        this.addLog(`🔄 いけっ！ ${this.playerTeam[nextIdx].name}！`);
                    }
                }

                const cActive = this.cpuTeam[this.cpuActiveIdx];
                if (cActive.hp <= 0 && !cActive.isFainted) {
                    cActive.isFainted = true;
                    this.addLog(`💀 相手の ${cActive.name} は倒れた！`);
                    
                    const nextIdx = this.cpuTeam.findIndex(c => !c.isFainted);
                    if (nextIdx !== -1) {
                        this.cpuActiveIdx = nextIdx;
                        this.lastCpuSkillId = null;
                        this.addLog(`🔄 相手は ${this.cpuTeam[nextIdx].name} を繰り出してきた！`);
                    }
                }
            }

            checkGameOver() {
                const pAllFainted = this.playerTeam.every(c => c.isFainted);
                const cAllFainted = this.cpuTeam.every(c => c.isFainted);

                if (pAllFainted || cAllFainted) {
                    this.currentScreen = 'RESULT';
                    this.winner = pAllFainted ? 'CPU' : 'PLAYER';

　　　　　　　　　　　playBattleResultEffect(this.winner === 'PLAYER');
                   
                    this.render();
                    return true;
                }
                return false;
            }

            addLog(msg) {
                this.battleLogs.unshift(msg);
                if (this.battleLogs.length > 30) this.battleLogs.pop();
            }

            render() {
                const container = document.getElementById('app-container');
                container.innerHTML = '';

                if (this.currentScreen === 'SELECT') {
                    container.appendChild(this.renderSelectScreen());
                } else if (this.currentScreen === 'BATTLE') {
                    container.appendChild(this.renderBattleScreen());
                } else if (this.currentScreen === 'RESULT') {
                    container.appendChild(this.renderResultScreen());
                }
            }
            // Screen 1: Character Select Screen
            renderSelectScreen() {
                const wrapper = document.createElement('div');
                wrapper.className = 'w-full max-w-6xl mx-auto p-4 text-white';

                const selectedKeys = [];

                wrapper.innerHTML = `
                    <div class="text-center mb-6">
                        <h2 class="text-2xl md:text-3xl font-black text-amber-400">
                            キャラクター選択
                        </h2>
                        <p class="text-slate-300 mt-2">
                            バトルに出すキャラクターを3体選んでください
                        </p>
                        <p id="selected-count" class="text-lg font-bold mt-3">
                            選択中：0 / 3
                        </p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${Object.entries(CHARACTERS_DATA).map(([key, character]) => `
                            <button
                                type="button"
                                data-character-key="${key}"
                                class="character-select-btn rounded-xl border-2 border-slate-700 bg-slate-900 p-4 text-left hover:border-amber-400 transition"
                            >
                                <img
                                    src="${character.image}"
                                    alt="${character.name}"
                                    class="w-full h-40 object-contain mb-3"
                                >
                                <h3 class="font-bold text-lg">${character.name}</h3>
                                <p class="text-sm text-slate-300 mt-2">
                                    種族：${RACES[character.race].name}
                                </p>
                                <p class="text-sm text-slate-300">
                                    HP：${character.maxHp}
                                </p>
                                <p class="text-sm text-slate-300">
                                    SP：${character.maxSp}
                                </p>
                                <p class="character-selected-label text-amber-400 font-bold mt-3">
                                    未選択
                                </p>
                            </button>
                        `).join('')}
                    </div>

                    <div class="text-center mt-6">
                        <button
                            id="start-cpu-battle-btn"
                            type="button"
                            disabled
                            class="px-8 py-4 rounded-xl bg-slate-700 text-slate-400 font-black text-lg cursor-not-allowed"
                        >
                            3体選択してください
                        </button>
                    </div>
                `;

                const countLabel = wrapper.querySelector('#selected-count');
                const startButton = wrapper.querySelector('#start-cpu-battle-btn');
                const characterButtons = wrapper.querySelectorAll('.character-select-btn');

                const updateSelection = () => {
                    countLabel.textContent = `選択中：${selectedKeys.length} / 3`;

                    characterButtons.forEach(button => {
                        const key = button.dataset.characterKey;
                        const isSelected = selectedKeys.includes(key);
                        const label = button.querySelector('.character-selected-label');

                        label.textContent = isSelected
                            ? `✓ ${selectedKeys.indexOf(key) + 1}体目`
                            : '未選択';

                        button.classList.toggle('border-amber-400', isSelected);
                        button.classList.toggle('border-slate-700', !isSelected);
                        button.classList.toggle('bg-amber-900/30', isSelected);
                    });

                    startButton.disabled = selectedKeys.length !== 3;
                    startButton.textContent = selectedKeys.length === 3
                        ? 'バトル開始！'
                        : '3体選択してください';

                    startButton.className = selectedKeys.length === 3
                        ? 'px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg cursor-pointer'
                        : 'px-8 py-4 rounded-xl bg-slate-700 text-slate-400 font-black text-lg cursor-not-allowed';
                };

                characterButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const key = button.dataset.characterKey;
                        const index = selectedKeys.indexOf(key);

                        if (index !== -1) {
                            selectedKeys.splice(index, 1);
                        } else if (selectedKeys.length < 3) {
                            selectedKeys.push(key);
                        }

                        updateSelection();
                    });
                });

startButton.addEventListener('click', () => {
    if (selectedKeys.length !== 3) return;

    if (onlineMode) {
        if (!onlineSocket || onlineSocket.readyState !== WebSocket.OPEN) {
            alert('オンラインサーバーに接続されていません。');
            return;
        }

        onlineSocket.send(JSON.stringify({
            type: 'selectTeam',
            team: [...selectedKeys]
        }));

        startButton.disabled = true;
        startButton.textContent = '相手のチームを待っています…';
        return;
    }

    this.startBattle([...selectedKeys]);
});

                return wrapper;
            }
            // Screen 2: Battle Screen
            renderBattleScreen() {
                const wrapper = document.createElement('div');
                wrapper.className = "w-full max-w-6xl mx-auto flex flex-col gap-4 animate-fade-in";

                const playerActive = this.playerTeam[this.playerActiveIdx];
                const cpuActive = this.cpuTeam[this.cpuActiveIdx];

                const characterPanel = (character, isPlayer, remaining) => {
                    const hpPercent = Math.max(0, Math.min(100, character.hp / character.maxHp * 100));
                    const spPercent = Math.max(0, Math.min(100, character.sp / character.maxSp * 100));

                    return `
                        <section class="rounded-2xl border ${isPlayer ? 'border-blue-500/60' : 'border-red-500/60'} bg-slate-900 p-4 shadow-lg">
                            <div class="flex items-center justify-between gap-2 mb-3">
                                <div>
                                    <div class="text-xs font-bold ${isPlayer ? 'text-blue-300' : 'text-red-300'}">
                                        ${isPlayer ? 'あなた' : 'CPU'}
                                    </div>
                                    <span class="inline-block text-xs px-2 py-1 rounded ${RACES[character.race].color} text-white font-bold mt-1">
                                        ${RACES[character.race].name}
                                    </span>
                                    <h3 class="text-lg md:text-xl font-black text-white mt-1">
                                        ${character.name}
                                    </h3>
                                </div>
                                <div class="text-xs text-slate-400 text-right whitespace-nowrap">
                                    控え<br>
                                    <span class="text-lg font-bold text-white">${remaining}</span>体
                                </div>
                            </div>

                            <div class="bg-slate-950/70 rounded-xl flex items-center justify-center p-2 mb-4 min-h-40">
                                <img
                                    src="${character.image}"
                                    alt="${character.name}"
                                    class="w-full h-44 md:h-56 object-contain"
                                >
                            </div>

                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between items-center text-sm mb-1">
                                        <span class="font-bold text-red-300">HP</span>
                                        <span class="font-mono text-white">${character.hp} / ${character.maxHp}</span>
                                    </div>
                                    <div class="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                                        <div class="${isPlayer ? 'bg-emerald-500' : 'bg-red-500'} h-full rounded-full transition-all duration-300" style="width: ${hpPercent}%"></div>
                                    </div>
                                </div>

                                <div>
                                    <div class="flex justify-between items-center text-sm mb-1">
                                        <span class="font-bold text-blue-300">SP</span>
                                        <span class="font-mono text-white">${character.sp} / ${character.maxSp}</span>
                                    </div>
                                    <div class="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                                        <div class="bg-blue-500 h-full rounded-full transition-all duration-300" style="width: ${spPercent}%"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 mt-3 text-xs">
                                ${character.multiplier > 1 ? `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-lg">攻撃${character.multiplier}倍</span>` : ''}
                                ${character.halfDamageNext ? `<span class="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-1 rounded-lg">ダメージ半減</span>` : ''}
                                ${character.dotDamage > 0 ? `<span class="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-1 rounded-lg">精神苦痛 (-${character.dotDamage})</span>` : ''}
                            </div>

                            ${!isPlayer ? `
                                <div class="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                                    <i class="fa-solid fa-eye-slash"></i>
                                    相手の技構成は非表示
                                </div>
                            ` : ''}
                        </section>
                    `;
                };
                wrapper.innerHTML += `
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    ${characterPanel(playerActive, true, this.playerTeam.filter(c => !c.isFainted).length - 1)}
    ${characterPanel(cpuActive, false, this.cpuTeam.filter(c => !c.isFainted).length - 1)}
</div>
                    <!-- 中央のじゃんけんバトル表示 -->
                    <div class="rounded-2xl border border-amber-500/40 bg-slate-950 p-4 text-center shadow-lg">
                        <div class="text-sm font-bold text-amber-300 mb-2">
                            ⚔️ じゃんけんバトル ⚔️
                        </div>
                        <div class="flex items-center justify-center gap-6">
                            <div class="flex flex-col items-center">
                                <span class="text-xs text-blue-300 mb-1">あなた</span>
                                <span class="text-5xl md:text-6xl">✊</span>
                            </div>
                            <span class="text-2xl font-black text-amber-400">VS</span>
                            <div class="flex flex-col items-center">
                                <span class="text-xs text-red-300 mb-1">CPU</span>
                                <span class="text-5xl md:text-6xl">✋</span>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400 mt-3">
                            技を選ぶと、じゃんけんの勝敗が決まる！
                        </p>
                    </div>

                    <!-- 技を選択 -->
                    <div class="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-lg">
                        <div class="flex flex-wrap justify-between items-center gap-2 mb-3">
                            <h3 class="font-bold text-white">繰り出す技を選択</h3>
                            <span class="text-xs text-amber-300">
                                ※同じ技は連続使用不可
                            </span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                            ${playerActive.skills.map((skill, idx) => {
                                const isCooldown = skill.id === this.lastPlayerSkillId;

                                return `
                                    <button
                                        data-skill-idx="${idx}"
                                        ${isCooldown ? 'disabled' : ''}
                                        class="skill-btn flex items-center gap-3 min-h-20 p-4 rounded-xl border text-left transition-all ${
                                            isCooldown
                                            ? 'bg-slate-950 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                                            : 'bg-slate-800 border-slate-600 hover:border-amber-400 active:scale-95 text-white cursor-pointer'
                                        }"
                                    >
                                        <span class="text-4xl w-12 text-center">
                                            ${skill.handIcon}
                                        </span>
                                        <span class="flex-1 min-w-0">
                                            <span class="block font-bold text-base">
                                                ${skill.name}
                                            </span>
                                            <span class="block text-sm text-slate-400 mt-1">
                                                ${skill.desc}
                                            </span>
                                        </span>
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- バトルログ -->
                    <details class="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                        <summary class="cursor-pointer font-bold text-white">
                            📜 バトルログを表示
                        </summary>
                        <div class="mt-3 max-h-48 overflow-y-auto space-y-2 font-mono text-sm text-slate-300">
                            ${this.battleLogs.map((log, i) => `
                                <div class="${i === 0 ? 'text-amber-300 font-bold' : 'text-slate-400'}">
                                    ${log}
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `;

               // 技ボタンのクリック処理
setTimeout(() => {
    const skillBtns = wrapper.querySelectorAll('.skill-btn');

    skillBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(
                btn.getAttribute('data-skill-idx'),
                10
            );

            if (onlineMode) {
                if (!onlineSocket || onlineSocket.readyState !== WebSocket.OPEN) {
                    alert('オンラインサーバーに接続されていません。');
                    return;
                }

                if (this.isProcessing) return;

                const skill = this.playerTeam[this.playerActiveIdx].skills[idx];

                if (skill.id === this.lastPlayerSkillId) {
                    alert('同じ技は連続して使えません。');
                    return;
                }

                this.isProcessing = true;

                onlineSocket.send(JSON.stringify({
                    type: 'turnChoice',
                    skillIndex: idx,
                    turnNumber: this.roundCount
                }));

                this.addLog('技を選択しました。相手の選択を待っています…');
                this.render();
                return;
            }

            this.executeTurn(idx);
        });
    });
}, 0);

                return wrapper;
            }
            // Screen 3: Result Screen
            renderResultScreen() {
                const wrapper = document.createElement('div');
                wrapper.className = "w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl animate-fade-in my-auto";

                const isWin = this.winner === 'PLAYER';

                wrapper.innerHTML = `
                    <div class="text-5xl mb-4">${isWin ? '🏆' : '💀'}</div>
                    <h2 class="text-2xl md:text-3xl font-black mb-2 ${isWin ? 'text-amber-400' : 'text-red-500'}">
                        ${isWin ? 'VICTORY!' : 'DEFEAT...'}
                    </h2>
                    <p class="text-sm text-slate-300 mb-6">
                        ${isWin ? '相手の化門/人間チームを全て全滅させました！' : 'あなたのチームは全滅してしまいました...'}
                    </p>

                    <button id="restart-game-btn" class="w-full py-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black rounded-xl text-lg shadow-lg active:scale-95 transition">
                        もう一度遊ぶ
                    </button>
                `;

                setTimeout(() => {
                    wrapper.querySelector('#restart-game-btn').addEventListener('click', () => {
                        this.init();
                    });
                }, 0);

                return wrapper;
            }
        }

        // Initialize Engine
        const game = new GameEngine();
        window.onload = () => {
            game.init();
            document.getElementById('reset-btn').addEventListener('click', () => {
                game.init();
            });
        };
// ==============================
// オンライン対戦
// ==============================

let onlineSocket = null;
let currentRoomCode = null;
let currentPlayerNumber = null;
let onlineMode = false;

function startOnlineConnection() {

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";

    onlineSocket = new WebSocket(
        `${protocol}//${location.host}`
    );

    onlineSocket.onopen = () => {
        console.log("オンラインサーバーに接続しました");

        showOnlineMenu();
    };

    onlineSocket.onmessage = (event) => {

        const data = JSON.parse(event.data);

        // ルーム作成成功
        if (data.type === "roomCreated") {

            currentRoomCode = data.roomCode;
            currentPlayerNumber = data.playerNumber;

            showRoomScreen();
        }

        // ルーム参加成功
        if (data.type === "roomJoined") {

            currentRoomCode = data.roomCode;
            currentPlayerNumber = data.playerNumber;

            showRoomScreen();
        }

        // ルーム人数変更
        if (data.type === "roomStatus") {

            updateRoomPlayerCount(data.playerCount);
        }

// 準備状況
if (data.type === "readyStatus") {

    updateReadyStatus(data.readyCount);
}

// 2人とも準備完了
if (data.type === "startCharacterSelect") {

    const menu = document.getElementById("online-menu");

    if (menu) {
        menu.remove();
    }

    game.currentScreen = "SELECT";
    game.render();
}
// オンライン対戦開始
if (data.type === "startOnlineBattle") {
    onlineMode = true;

    game.playerTeam = data.ownTeam.map(key =>
        game.createBattleChar(key)
    );

    game.cpuTeam = data.opponentTeam.map(key =>
        game.createBattleChar(key)
    );

    game.playerActiveIdx = 0;
    game.cpuActiveIdx = 0;
    game.lastPlayerSkillId = null;
    game.lastCpuSkillId = null;
    game.roundCount = 1;
    game.battleLogs = [];
    game.winner = null;
    game.isProcessing = false;

    game.currentScreen = "BATTLE";
    game.render();
}
// 両プレイヤーの技がそろったとき
if (data.type === "turnResolved") {
    const mySkillIndex = currentPlayerNumber === 1
        ? data.player1SkillIndex
        : data.player2SkillIndex;

    const opponentSkillIndex = currentPlayerNumber === 1
        ? data.player2SkillIndex
        : data.player1SkillIndex;

    game.isProcessing = false;

    // 受信した技を使ってオンライン対戦のターンを解決
    game.executeOnlineTurn(mySkillIndex, opponentSkillIndex);
}
        // エラー
        if (data.type === "error") {

            alert(data.message);
        }
    };

    onlineSocket.onclose = () => {
        console.log("サーバーから切断されました");
    };
}


/* ==============================
   ゲームモード選択
============================== */

function showOnlineMenu() {
    const old = document.getElementById("online-menu");
    if (old) old.remove();

    const menu = document.createElement("div");
    menu.id = "online-menu";

    menu.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #0d1117;
        padding: 20px;
        box-sizing: border-box;
    `;

    menu.innerHTML = `
        <div style="
            width: 100%;
            max-width: 440px;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 20px;
            padding: 28px;
            text-align: center;
            box-sizing: border-box;
        ">
            <div style="font-size: 32px; margin-bottom: 8px;">
                ✊ ✌️ ✋
            </div>

            <h1 style="
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 8px;
                color: white;
            ">
                化門 vs 人間
            </h1>

            <p style="
                color: #9ca3af;
                margin-bottom: 28px;
            ">
                ゲームモードを選択
            </p>

            <button id="cpu-mode-btn" style="
                width: 100%;
                padding: 18px;
                margin-bottom: 14px;
                border: none;
                border-radius: 12px;
                background: #2563eb;
                color: white;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
            ">
                🤖 CPU対戦
                <div style="
                    font-size: 12px;
                    font-weight: normal;
                    margin-top: 6px;
                ">
                    CPUチームとバトル！
                </div>
            </button>

            <button id="online-mode-btn" style="
                width: 100%;
                padding: 18px;
                border: none;
                border-radius: 12px;
                background: #7c3aed;
                color: white;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
            ">
                ⚔️ 友達とオンライン対戦
                <div style="
                    font-size: 12px;
                    font-weight: normal;
                    margin-top: 6px;
                ">
                    ルームを作成・参加する
                </div>
            </button>
        </div>
    `;

    document.body.appendChild(menu);

    // CPU対戦：モード画面を閉じて既存のゲームへ
    document.getElementById("cpu-mode-btn")
        .addEventListener("click", () => {
       　　　onlineMode = false;
            menu.remove();

            game.currentScreen = "SELECT";
            game.render();
        });

    // オンライン対戦：ルーム選択画面へ
    document.getElementById("online-mode-btn")
        .addEventListener("click", () => {
       onlineMode = true;
            showOnlineRoomMenu();
        });
}


/* ==============================
   オンラインルーム選択
============================== */

function showOnlineRoomMenu() {
    const menu = document.getElementById("online-menu");
    if (!menu) return;

    menu.innerHTML = `
        <div style="
            width: 90%;
            max-width: 420px;
            background: #111827;
            border: 1px solid #374151;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            box-sizing: border-box;
        ">
            <div style="
                font-size: 26px;
                font-weight: bold;
                margin-bottom: 10px;
                color: white;
            ">
                オンライン対戦
            </div>

            <p style="
                color: #9ca3af;
                margin-bottom: 25px;
            ">
                ルームを作るか、友達のルームに参加しよう
            </p>

            <button id="create-room-btn" style="
                width: 100%;
                padding: 15px;
                margin-bottom: 12px;
                border: none;
                border-radius: 12px;
                background: #2563eb;
                color: white;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
            ">
                ルームを作る
            </button>

            <button id="join-room-btn" style="
                width: 100%;
                padding: 15px;
                margin-bottom: 12px;
                border: none;
                border-radius: 12px;
                background: #374151;
                color: white;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
            ">
                ルームに参加する
            </button>

            <button id="back-mode-btn" style="
                width: 100%;
                padding: 12px;
                border: 1px solid #4b5563;
                border-radius: 12px;
                background: transparent;
                color: white;
                font-size: 15px;
                cursor: pointer;
            ">
                ← モード選択に戻る
            </button>
        </div>
    `;

    document.getElementById("create-room-btn")
        .addEventListener("click", createRoom);

    document.getElementById("join-room-btn")
        .addEventListener("click", joinRoom);

    document.getElementById("back-mode-btn")
        .addEventListener("click", showOnlineMenu);
}


// ルーム作成
function createRoom() {

    onlineSocket.send(JSON.stringify({
        type: "createRoom"
    }));
}


// ルーム参加
function joinRoom() {

    const code = prompt("4桁のルーム番号を入力してください");

    if (!code) {
        return;
    }

    onlineSocket.send(JSON.stringify({
        type: "joinRoom",
        roomCode: code
    }));
}


// ルーム画面
function showRoomScreen() {

    const menu = document.getElementById("online-menu");

    if (!menu) {
        return;
    }

    menu.innerHTML = `
        <div style="
            width:90%;
            max-width:420px;
            background:#111827;
            border:1px solid #374151;
            border-radius:20px;
            padding:30px;
            text-align:center;
        ">

            <div style="
                font-size:22px;
                font-weight:bold;
                margin-bottom:20px;
            ">
                対戦ルーム
            </div>

            <div style="
                font-size:16px;
                color:#9ca3af;
            ">
                ルーム番号
            </div>

            <div style="
                font-size:48px;
                font-weight:bold;
                letter-spacing:8px;
                margin:10px 0 25px;
                color:#60a5fa;
            ">
                ${currentRoomCode}
            </div>

            <div id="room-player-count" style="
                font-size:18px;
                margin-bottom:20px;
            ">
                👤 参加人数：1 / 2
            </div>

            <button id="ready-btn" style="
                width:100%;
                padding:15px;
                margin-top:20px;
                border:none;
                border-radius:12px;
                background:#16a34a;
                color:white;
                font-size:18px;
                font-weight:bold;
                cursor:pointer;
            ">
                準備完了
            </button>

            <div id="ready-status" style="
                margin-top:15px;
                color:#9ca3af;
            ">
                準備完了：0 / 2
            </div>

            <div style="
                color:#9ca3af;
                font-size:14px;
                margin-top:10px;
            ">
                ${currentPlayerNumber === 1
                    ? "相手が参加するのを待っています…"
                    : "ルームに参加しました！"}
            </div>

        </div>
    `;

    if (currentPlayerNumber === 2) {
        updateRoomPlayerCount(2);
    }

    const readyButton = document.getElementById("ready-btn");

    if (readyButton) {
        readyButton.addEventListener("click", sendReady);
    }
}


// 準備完了
function sendReady() {

    console.log("準備完了ボタンが押されました");

    if (!onlineSocket) {
        alert("サーバーに接続されていません。");
        return;
    }

    onlineSocket.send(JSON.stringify({
        type: "ready"
    }));

    const button = document.getElementById("ready-btn");

    if (button) {
        button.disabled = true;
        button.textContent = "準備完了済み";
        button.style.background = "#374151";
    }
}


// 準備人数を更新
function updateReadyStatus(count) {

    const element = document.getElementById("ready-status");

    if (!element) {
        return;
    }

    element.textContent = `準備完了：${count} / 2`;
}


// 人数表示
function updateRoomPlayerCount(count) {

    const element = document.getElementById("room-player-count");

    if (!element) {
        return;
    }

    element.textContent =
        `👤 参加人数：${count} / 2`;

    if (count === 2) {

        setTimeout(() => {

            element.textContent =
                "🎉 2人そろいました！";

        }, 500);
    }
}


// ページ読み込み時
window.addEventListener("load", () => {
    startOnlineConnection();
});
