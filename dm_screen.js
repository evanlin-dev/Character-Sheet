document.addEventListener('DOMContentLoaded', () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%238b2e2e' stroke='%23d4a574' stroke-width='3' stroke-linejoin='round' d='M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z M32 4 L32 32 M32 32 L56 18 M32 32 L8 18 M32 32 L32 60 M32 32 L56 46 M32 32 L8 46'/%3E%3C/svg%3E";
    document.head.appendChild(link);

    const dataList = document.createElement('datalist');
    dataList.id = 'player-datalist';
    document.body.appendChild(dataList);

    const updatePlayerDropdowns = () => {
        const players = Array.from(document.querySelectorAll('#players-list > div > span')).map(span => span.textContent);
        dataList.innerHTML = players.map(p => `<option value="${p}">`).join('');
        
        document.querySelectorAll('.player-select').forEach(select => {
            const currentVal = select.value;
            const isSelectedValid = players.includes(currentVal);
            select.innerHTML = `<option value="" disabled ${isSelectedValid ? '' : 'selected'}>Select Player</option>` + 
                               players.map(p => `<option value="${p}" ${p === currentVal ? 'selected' : ''}>${p}</option>`).join('');
        });
    };

    const sessionsContainer = document.getElementById('sessions-container');
    let sessionCounter = 0;

    const saveDMData = () => {
        const players = Array.from(document.querySelectorAll('#players-list > div > span')).map(s => s.textContent);
        const sessions = [];
        
        document.querySelectorAll('.session').forEach(sessionEl => {
            const sessionData = {
                title: sessionEl.querySelector('h2').textContent,
                rolls: [],
                initiative: [],
                logs: [],   
                monsters: []
            };

            // Save Rolls
            sessionEl.querySelectorAll('.dice-rolls-buckets > div').forEach(bucket => {
                const val = bucket.dataset.value;
                bucket.querySelectorAll('.bucket-players > span').forEach(span => {
                    sessionData.rolls.push({
                        val: val,
                        name: span.dataset.name,
                        count: span.dataset.count || 1
                    });
                });
            });

            // Save Initiative
            sessionEl.querySelectorAll('.character-initiative').forEach(row => {
                sessionData.initiative.push({
                    name: row.querySelector('.char-name').textContent,
                    val: row.querySelector('.char-initiative').textContent
                });
            });

            // Save Logs
            sessionEl.querySelectorAll('.log-entry').forEach(entry => {
                const content = entry.querySelector('.log-content');
                if (content) {
                    sessionData.logs.push(content.innerHTML);
                }
            });

            // Save Monsters
            sessionEl.querySelectorAll('.monsters-list > div > span').forEach(span => {
                sessionData.monsters.push(span.textContent);
            });

            sessions.push(sessionData);
        });

        const data = { players, sessions, sessionCounter };
        localStorage.setItem('dmScreenData', JSON.stringify(data));
    };

    const createPlayerElement = (name) => {
        if (name) {
            const div = document.createElement('div');
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.padding = "8px 12px";
            div.style.marginBottom = "8px";
            div.style.backgroundColor = "white";
            div.style.border = "1px solid var(--gold)";
            div.style.borderRadius = "4px";
            div.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
            div.innerHTML = `
                <span style="font-weight: 600; color: var(--ink); font-family: 'Cinzel', serif;">${name}</span>
                <button class="delete-feature-btn" title="Remove Player">&times;</button>
            `;
            div.querySelector('.delete-feature-btn').addEventListener('click', () => {
                div.remove();
                updatePlayerDropdowns();
                saveDMData();
            });
            document.getElementById('players-list').appendChild(div);
            updatePlayerDropdowns();
            saveDMData();
        }
    };

    const addPlayer = () => {
        const input = document.getElementById('player-name-input');
        if (input.value) {
            createPlayerElement(input.value);
            input.value = '';
        }
    };

    document.getElementById('add-player-btn').addEventListener('click', addPlayer);
    document.getElementById('player-name-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addPlayer();
    });

    const createSession = (data = null) => {
        if (!data) {
            sessionCounter++;
        }
        const title = data ? data.title : `Session ${sessionCounter}`;
        const uniqueID = 'session-' + Math.random().toString(36).substr(2, 9);
        const session = document.createElement('div');
        session.classList.add('session');
        session.innerHTML = `
            <div class="session-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--gold); padding-bottom: 5px; margin-bottom: 10px;">
                <h2 style="margin: 0; cursor: pointer;" title="Click to rename">${title}</h2>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-secondary collapse-session-btn" style="padding: 4px 8px; font-size: 0.8rem; height: auto; min-width: 30px;">-</button>
                    <button class="btn btn-danger delete-session-btn" style="padding: 4px 8px; font-size: 0.8rem; height: auto;">&times;</button>
                </div>
            </div>
            <div class="session-content">
                <div class="dice-log">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <h3 style="margin: 0;">Dice Rolls</h3>
                        <button class="btn btn-secondary stats-btn" style="padding: 2px 8px; font-size: 0.7rem;">Get Stats</button>
                    </div>
                    <div class="dice-rolls-buckets" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; margin-bottom: 10px;"></div>
                    <div class="add-roll">
                        <select class="add-roll-player player-select styled-select"><option value="" disabled selected>Select Player</option></select>
                        <input type="number" class="add-roll-value" placeholder="Roll">
                        <button class="btn btn-secondary add-roll-btn">Add</button>
                    </div>
                </div>
                <div class="battle-container">
                    <div class="monsters-section" style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <h3 style="margin: 0;">Monsters List</h3>
                            <button class="btn btn-secondary clear-monsters-btn" style="padding: 2px 8px; font-size: 0.7rem;">Clear</button>
                        </div>
                        <div class="monsters-list" style="margin-bottom: 10px;"></div>
                        <div class="add-monster" style="display: flex; gap: 5px;">
                            <input type="text" class="add-monster-input styled-select" placeholder="Monster Name" style="flex-grow: 1;">
                            <button class="btn btn-secondary add-monster-btn">Add</button>
                        </div>
                        <datalist id="monster-datalist-${uniqueID}"></datalist>
                    </div>
                    <div class="initiative-tracker">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <h3 style="margin: 0;">Initiative Tracker</h3>
                            <button class="btn btn-secondary clear-init-btn" style="padding: 2px 8px; font-size: 0.7rem;">Clear</button>
                        </div>
                        <div class="initiative-list"></div>
                        <div class="add-character" style="display: flex; gap: 5px;">
                            <div style="flex-grow: 1; display: flex; gap: 5px;">
                                <select class="add-char-name-select player-select styled-select" style="width: 100%;"><option value="" disabled selected>Select Player</option></select>
                                <select class="add-char-name-input styled-select" style="display: none; width: 100%;"><option value="" disabled selected>Select Monster</option></select>
                                <button class="btn btn-secondary toggle-init-input-btn" style="padding: 0 8px; min-width: 30px;" title="Switch to Monsters">M</button>
                            </div>
                            <input type="number" class="add-char-initiative" placeholder="Init" style="width: 60px;">
                            <button class="btn btn-secondary add-char-btn">Add</button>
                        </div>
                    </div>
                    <div class="battle-log">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <h3 style="margin: 0;">Battle Log</h3>
                            <div style="display: flex; gap: 5px;">
                                <button class="btn btn-secondary mvp-btn" style="padding: 2px 8px; font-size: 0.7rem;">MVP Tracker</button>
                                <button class="btn btn-secondary clear-log-btn" style="padding: 2px 8px; font-size: 0.7rem;">Clear Log</button>
                            </div>
                        </div>
                        <div class="battle-log-entries"></div>
                        <div class="add-log-form">
                            <select class="log-player player-select styled-select"><option value="" disabled selected>Select Player</option></select>
                            <select class="log-action-type styled-select">
                                <option value="attacked">attacked</option>
                                <option value="was attacked by">was attacked by</option>
                            </select>
                            <select class="log-monster styled-select"><option value="" disabled selected>Select Monster</option></select>
                            <select class="log-outcome styled-select">
                                <option value="succeed">Succeeded</option>
                                <option value="fail">Failed</option>
                            </select>
                            <input type="number" class="log-damage" placeholder="Damage">
                            <button class="btn btn-secondary add-log-btn">Add Log</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        sessionsContainer.appendChild(session);
        
        // Session Controls
        const sessionTitle = session.querySelector('h2');
        sessionTitle.addEventListener('click', () => {
            const newTitle = prompt("Rename Session:", sessionTitle.textContent);
            if (newTitle) {
                sessionTitle.textContent = newTitle;
                saveDMData();
            }
        });

        const collapseBtn = session.querySelector('.collapse-session-btn');
        const contentDiv = session.querySelector('.session-content');
        collapseBtn.addEventListener('click', () => {
            if (contentDiv.style.display === 'none') {
                contentDiv.style.display = 'block';
                collapseBtn.textContent = '-';
            } else {
                contentDiv.style.display = 'none';
                collapseBtn.textContent = '+';
            }
        });

        session.querySelector('.delete-session-btn').addEventListener('click', () => {
            if (confirm("Delete this session?")) {
                session.remove();
                saveDMData();
            }
        });

        const bucketsContainer = session.querySelector('.dice-rolls-buckets');
        for (let i = 20; i >= 1; i--) {
            const bucket = document.createElement('div');
            bucket.style.border = "1px solid var(--gold)";
            bucket.style.borderRadius = "4px";
            bucket.style.padding = "4px";
            bucket.style.backgroundColor = "white";
            bucket.style.minHeight = "50px";
            bucket.style.fontSize = "0.8rem";
            bucket.dataset.value = i;
            bucket.innerHTML = `<div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid #eee; margin-bottom:2px; text-align:center;">${i}</div><div class="bucket-players" style="display:flex; flex-wrap:wrap; gap:2px; justify-content:center;"></div>`;
            bucketsContainer.appendChild(bucket);
        }

        // Populate data if exists
        if (data) {
            // Rolls
            data.rolls.forEach(rollData => {
                const bucket = session.querySelector(`.dice-rolls-buckets div[data-value="${rollData.val}"] .bucket-players`);
                if (bucket) {
                    const span = document.createElement('span');
                    span.textContent = rollData.count > 1 ? `${rollData.name} x${rollData.count}` : rollData.name;
                    span.dataset.name = rollData.name;
                    span.dataset.count = rollData.count;
                    span.style.backgroundColor = "var(--parchment-dark)";
                    span.style.padding = "1px 4px";
                    span.style.borderRadius = "3px";
                    span.style.fontSize = "0.75rem";
                    span.style.border = "1px solid var(--gold-dark)";
                    bucket.appendChild(span);
                }
            });
            // Initiative
            const initList = session.querySelector('.initiative-list');
            data.initiative.forEach(initData => {
                const charElement = document.createElement('div');
                charElement.classList.add('character-initiative');
                charElement.innerHTML = `<span class="char-name">${initData.name}</span><span class="char-initiative">${initData.val}</span>`;
                initList.appendChild(charElement);
            });
            // Logs
            const logEntries = session.querySelector('.battle-log-entries');
            data.logs.forEach(logHTML => {
                const logElement = document.createElement('div');
                logElement.classList.add('log-entry');
                logElement.style.display = "flex";
                logElement.style.justifyContent = "space-between";
                logElement.style.alignItems = "center";
                logElement.innerHTML = `<span class="log-content">${logHTML}</span><button class="delete-feature-btn" style="margin-left: 8px;">&times;</button>`;
                
                logElement.querySelector('.delete-feature-btn').addEventListener('click', () => {
                    logElement.remove();
                    saveDMData();
                });
                logEntries.appendChild(logElement);
            });
        }

        updatePlayerDropdowns();

        // Monsters Logic
        const monsterList = session.querySelector('.monsters-list');
        const monsterInput = session.querySelector('.add-monster-input');
        const monsterDatalist = session.querySelector(`#monster-datalist-${uniqueID}`);

        const updateMonsterDatalist = () => {
            const monsters = Array.from(monsterList.querySelectorAll('div > span')).map(s => s.textContent);
            monsterDatalist.innerHTML = monsters.map(m => `<option value="${m}">`).join('');
            
            const monsterSelect = session.querySelector('.add-char-name-input');
            if (monsterSelect) {
                const currentVal = monsterSelect.value;
                monsterSelect.innerHTML = `<option value="" disabled ${!monsters.includes(currentVal) ? 'selected' : ''}>Select Monster</option>` + 
                              monsters.map(m => `<option value="${m}" ${m === currentVal ? 'selected' : ''}>${m}</option>`).join('');
            }

            const logMonsterSelect = session.querySelector('.log-monster');
            if (logMonsterSelect) {
                const currentVal = logMonsterSelect.value;
                logMonsterSelect.innerHTML = `<option value="" disabled ${!monsters.includes(currentVal) ? 'selected' : ''}>Select Monster</option>` + 
                              monsters.map(m => `<option value="${m}" ${m === currentVal ? 'selected' : ''}>${m}</option>`).join('');
            }
        };

        function addMonster(name, skipSave = false) {
            const div = document.createElement('div');
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.padding = "8px 12px";
            div.style.marginBottom = "8px";
            div.style.backgroundColor = "white";
            div.style.border = "1px solid var(--gold)";
            div.style.borderRadius = "4px";
            div.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
            div.innerHTML = `
                <span style="font-weight: 600; color: var(--ink); font-family: 'Cinzel', serif;">${name}</span>
                <button class="delete-feature-btn" title="Remove Monster">&times;</button>
            `;
            div.querySelector('.delete-feature-btn').addEventListener('click', () => {
                div.remove();
                updateMonsterDatalist();
                saveDMData();
            });
            monsterList.appendChild(div);
            updateMonsterDatalist();
            if (!skipSave) saveDMData();
        }

        // Populate Monsters if data exists
        if (data && data.monsters) {
            data.monsters.forEach(m => addMonster(m, true));
        }

        const handleAddMonster = () => {
            if (monsterInput.value) {
                addMonster(monsterInput.value);
                monsterInput.value = '';
            }
        };

        session.querySelector('.add-monster-btn').addEventListener('click', handleAddMonster);
        monsterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAddMonster();
        });
        
        session.querySelector('.clear-monsters-btn').addEventListener('click', () => {
            if (confirm("Clear monsters list?")) {
                monsterList.innerHTML = '';
                updateMonsterDatalist();
                saveDMData();
            }
        });

        // Stats Button Logic
        session.querySelector('.stats-btn').addEventListener('click', () => {
            const stats = {
                totalRolls: 0,
                sumRolls: 0,
                nat20: 0,
                nat1: 0,
                players: {}
            };

            session.querySelectorAll('.dice-rolls-buckets > div').forEach(bucket => {
                const val = parseInt(bucket.dataset.value);
                bucket.querySelectorAll('.bucket-players > span').forEach(span => {
                    const name = span.dataset.name;
                    const count = parseInt(span.dataset.count || 1);

                    stats.totalRolls += count;
                    stats.sumRolls += (val * count);
                    if (val === 20) stats.nat20 += count;
                    if (val === 1) stats.nat1 += count;

                    if (!stats.players[name]) {
                        stats.players[name] = { count: 0, sum: 0, nat20: 0, nat1: 0 };
                    }
                    stats.players[name].count += count;
                    stats.players[name].sum += (val * count);
                    if (val === 20) stats.players[name].nat20 += count;
                    if (val === 1) stats.players[name].nat1 += count;
                });
            });

            const avg = stats.totalRolls > 0 ? (stats.sumRolls / stats.totalRolls).toFixed(1) : "0.0";
            
            let html = `
                <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--gold);">
                    <h4 style="color: var(--red-dark); margin-bottom: 10px;">Group Stats</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                        <div style="background: var(--parchment-dark); padding: 8px; border-radius: 4px;">
                            <div style="font-size: 0.8rem; font-weight: bold;">Nat 20s</div>
                            <div style="font-size: 1.2rem; color: var(--red);">${stats.nat20}</div>
                        </div>
                        <div style="background: var(--parchment-dark); padding: 8px; border-radius: 4px;">
                            <div style="font-size: 0.8rem; font-weight: bold;">Nat 1s</div>
                            <div style="font-size: 1.2rem; color: var(--ink);">${stats.nat1}</div>
                        </div>
                        <div style="background: var(--parchment-dark); padding: 8px; border-radius: 4px;">
                            <div style="font-size: 0.8rem; font-weight: bold;">Avg Roll</div>
                            <div style="font-size: 1.2rem; color: var(--gold-dark);">${avg}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 style="color: var(--red-dark); margin-bottom: 10px;">Player Stats</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--gold);">
                                <th style="text-align: left; padding: 4px;">Name</th>
                                <th style="text-align: center; padding: 4px;">20s</th>
                                <th style="text-align: center; padding: 4px;">1s</th>
                                <th style="text-align: center; padding: 4px;">Avg</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            Object.keys(stats.players).sort().forEach(pName => {
                const p = stats.players[pName];
                const pAvg = p.count > 0 ? (p.sum / p.count).toFixed(1) : "0.0";
                html += `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 4px; font-weight: bold;">${pName}</td>
                        <td style="text-align: center; padding: 4px;">${p.nat20}</td>
                        <td style="text-align: center; padding: 4px;">${p.nat1}</td>
                        <td style="text-align: center; padding: 4px;">${pAvg}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;

            document.getElementById('statsContent').innerHTML = html;
            document.getElementById('statsModal').style.display = 'flex';
        });

        // Initiative Controls
        const toggleInitBtn = session.querySelector('.toggle-init-input-btn');
        const initSelect = session.querySelector('.add-char-name-select');
        const initInput = session.querySelector('.add-char-name-input');

        toggleInitBtn.addEventListener('click', () => {
            if (initInput.style.display === 'none') {
                initInput.style.display = 'block';
                initSelect.style.display = 'none';
                toggleInitBtn.textContent = 'P';
                toggleInitBtn.title = "Switch to Players";
            } else {
                initInput.style.display = 'none';
                initSelect.style.display = 'block';
                toggleInitBtn.textContent = 'M';
                toggleInitBtn.title = "Switch to Monsters";
            }
        });

        session.querySelector('.clear-init-btn').addEventListener('click', () => {
            if (confirm("Clear initiative tracker?")) {
                session.querySelector('.initiative-list').innerHTML = '';
                saveDMData();
            }
        });

        const addCharBtn = session.querySelector('.add-char-btn');
        addCharBtn.addEventListener('click', () => {
            const nameVal = initInput.style.display === 'none' ? initSelect.value : initInput.value;
            const initiativeInput = session.querySelector('.add-char-initiative');
            const initiativeList = session.querySelector('.initiative-list');

            const name = nameVal;
            const initiative = parseInt(initiativeInput.value);

            if (name && !isNaN(initiative)) {
                const charElement = document.createElement('div');
                charElement.classList.add('character-initiative');
                charElement.innerHTML = `
                    <span class="char-name">${name}</span>
                    <span class="char-initiative">${initiative}</span>
                `;
                initiativeList.appendChild(charElement);

                // Sort the list
                const items = Array.from(initiativeList.children);
                items.sort((a, b) => {
                    const initiativeA = parseInt(a.querySelector('.char-initiative').textContent);
                    const initiativeB = parseInt(b.querySelector('.char-initiative').textContent);
                    return initiativeB - initiativeA;
                });
                items.forEach(item => initiativeList.appendChild(item));

                initInput.value = '';
                initSelect.value = '';
                initiativeInput.value = '';
                saveDMData();
            }
        });

        const addRollBtn = session.querySelector('.add-roll-btn');
        addRollBtn.addEventListener('click', () => {
            const playerInput = session.querySelector('.add-roll-player');
            const rollInput = session.querySelector('.add-roll-value');

            const player = playerInput.value;
            const roll = parseInt(rollInput.value);

            if (player && !isNaN(roll) && roll >= 1 && roll <= 20) {
                const bucket = session.querySelector(`.dice-rolls-buckets div[data-value="${roll}"] .bucket-players`);
                if (bucket) {
                    const existingSpan = Array.from(bucket.children).find(s => s.dataset.name === player);
                    if (existingSpan) {
                        let count = parseInt(existingSpan.dataset.count || 1);
                        count++;
                        existingSpan.dataset.count = count;
                        existingSpan.textContent = `${player} x${count}`;
                    } else {
                        const span = document.createElement('span');
                        span.textContent = player;
                        span.dataset.name = player;
                        span.dataset.count = 1;
                        span.style.backgroundColor = "var(--parchment-dark)";
                        span.style.padding = "1px 4px";
                        span.style.borderRadius = "3px";
                        span.style.fontSize = "0.75rem";
                        span.style.border = "1px solid var(--gold-dark)";
                        bucket.appendChild(span);
                    }
                }
                playerInput.value = '';
                rollInput.value = '';
                saveDMData();
            }
        });

        session.querySelector('.clear-log-btn').addEventListener('click', () => {
            if (confirm("Clear battle log?")) {
                session.querySelector('.battle-log-entries').innerHTML = '';
                saveDMData();
            }
        });

        // MVP Tracker Logic
        session.querySelector('.mvp-btn').addEventListener('click', () => {
            const stats = {
                totalPartyDmg: 0,
                highestHit: { player: 'N/A', dmg: 0 },
                playerDmg: {}
            };

            session.querySelectorAll('.log-entry').forEach(entry => {
                const contentSpan = entry.querySelector('.log-content');
                if (!contentSpan) return;
                const html = contentSpan.innerHTML;

                // Filter for outgoing attacks (Player attacked Monster)
                // Must contain " attacked " and NOT " was attacked by " (which is incoming dmg)
                if (html.includes(' attacked ') && !html.includes(' was attacked by ')) {
                    // Check for success and extract damage
                    const dmgMatch = html.match(/class="damage">(\d+)<\/span>/);
                    if (dmgMatch) {
                        const dmg = parseInt(dmgMatch[1]);
                        
                        // Extract Player Name (everything before " attacked ")
                        const parts = html.split(' attacked ');
                        const player = parts[0].trim();

                        // Update Stats
                        stats.totalPartyDmg += dmg;
                        
                        if (!stats.playerDmg[player]) stats.playerDmg[player] = 0;
                        stats.playerDmg[player] += dmg;

                        if (dmg > stats.highestHit.dmg) {
                            stats.highestHit = { player: player, dmg: dmg };
                        }
                    }
                }
            });

            let html = `
                <div style="margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--gold);">
                    <h4 style="color: var(--red-dark); margin-bottom: 10px; text-align: center;">Party Performance</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                        <div style="background: var(--parchment-dark); padding: 10px; border-radius: 4px;">
                            <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">Total Damage</div>
                            <div style="font-size: 1.5rem; color: var(--red); font-weight: bold;">${stats.totalPartyDmg}</div>
                        </div>
                        <div style="background: var(--parchment-dark); padding: 10px; border-radius: 4px;">
                            <div style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">High Score Hit</div>
                            <div style="font-size: 1.1rem; color: var(--ink); font-weight: bold;">${stats.highestHit.dmg}</div>
                            <div style="font-size: 0.8rem; color: var(--ink-light);">${stats.highestHit.player}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 style="color: var(--red-dark); margin-bottom: 10px;">Damage by Character</h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="border-bottom: 1px solid var(--gold);">
                                <th style="text-align: left; padding: 4px;">Name</th>
                                <th style="text-align: right; padding: 4px;">Total Dmg</th>
                                <th style="text-align: right; padding: 4px;">%</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            const sortedPlayers = Object.keys(stats.playerDmg).sort((a, b) => stats.playerDmg[b] - stats.playerDmg[a]);
            if (sortedPlayers.length === 0) {
                html += `<tr><td colspan="3" style="text-align:center; padding:10px; font-style:italic;">No damage recorded yet.</td></tr>`;
            } else {
                sortedPlayers.forEach(p => {
                    const d = stats.playerDmg[p];
                    const pct = stats.totalPartyDmg > 0 ? Math.round((d / stats.totalPartyDmg) * 100) : 0;
                    html += `<tr style="border-bottom: 1px solid #eee;"><td style="padding: 4px; font-weight: bold;">${p}</td><td style="text-align: right; padding: 4px; color: var(--red-dark);">${d}</td><td style="text-align: right; padding: 4px; color: var(--ink-light);">${pct}%</td></tr>`;
                });
            }
            html += `</tbody></table></div>`;

            document.getElementById('mvpContent').innerHTML = html;
            document.getElementById('mvpModal').style.display = 'flex';
        });

        const addLogBtn = session.querySelector('.add-log-btn');
        addLogBtn.addEventListener('click', () => {
            const playerInput = session.querySelector('.log-player');
            const actionTypeInput = session.querySelector('.log-action-type');
            const monsterInput = session.querySelector('.log-monster');
            const outcomeInput = session.querySelector('.log-outcome');
            const damageInput = session.querySelector('.log-damage');
            const logEntries = session.querySelector('.battle-log-entries');

            const player = playerInput.value;
            const actionType = actionTypeInput.value;
            const monster = monsterInput.value;
            const outcome = outcomeInput.value;
            const damage = damageInput.value;

            if (player && monster) {
                const logElement = document.createElement('div');
                logElement.classList.add('log-entry');
                
                const outcomeText = outcome === 'succeed' ? 'succeeded' : 'failed';
                const damageText = (outcome === 'succeed' && damage) ? ` <span class="damage">${damage}</span> dmg` : '';

                logElement.style.display = "flex";
                logElement.style.justifyContent = "space-between";
                logElement.style.alignItems = "center";
                logElement.innerHTML = `<span class="log-content">${player} ${actionType} ${monster} (<span class="${outcome === 'fail' ? 'fail' : ''}">${outcomeText}</span>)${damageText}</span><button class="delete-feature-btn" style="margin-left: 8px;">&times;</button>`;
                
                logElement.querySelector('.delete-feature-btn').addEventListener('click', () => {
                    logElement.remove();
                    saveDMData();
                });
                logEntries.appendChild(logElement);

                playerInput.value = '';
                monsterInput.value = '';
                damageInput.value = '';
                saveDMData();
            }
        });

        sessionsContainer.appendChild(session);
        saveDMData();
    };

    document.getElementById('add-session-btn').addEventListener('click', () => createSession());

    // Load Data
    const loadDMData = () => {
        const saved = localStorage.getItem('dmScreenData');
        if (saved) {
            const data = JSON.parse(saved);
            sessionCounter = data.sessionCounter || 0;
            
            if (data.players) {
                data.players.forEach(p => createPlayerElement(p));
            }
            
            if (data.sessions) {
                data.sessions.forEach(s => createSession(s));
            }
        }
    };

    loadDMData();

    // Export / Import / Reset
    document.getElementById('export-dm-btn').addEventListener('click', () => {
        saveDMData();
        const dataStr = localStorage.getItem('dmScreenData');
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "dm_screen_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.getElementById('import-dm-btn').addEventListener('click', () => {
        document.getElementById('dm-file-input').click();
    });

    document.getElementById('dm-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.setItem('dmScreenData', JSON.stringify(data));
                location.reload();
            } catch (err) { alert("Error loading file: " + err); }
        };
        reader.readAsText(file);
    });

    document.getElementById('reset-dm-btn').addEventListener('click', () => {
        if(confirm("Clear all DM data?")) {
            localStorage.removeItem('dmScreenData');
            location.reload();
        }
    });

    // =========================================
    // SHOP GENERATOR
    // =========================================
    const initShopGenerator = async () => {
        // Check if data exists before showing shop generator
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const hasData = await new Promise((resolve) => {
                const req = store.get('currentData');
                req.onsuccess = () => resolve(!!req.result);
                req.onerror = () => resolve(false);
            });
            if (!hasData) return;
        } catch (e) { return; }

        const container = document.getElementById('sessions-container');
        if (!container) return;

        const shopDiv = document.createElement('div');
        shopDiv.className = 'shop-generator-section';
        shopDiv.style.background = 'var(--parchment)';
        shopDiv.style.border = '2px solid var(--gold)';
        shopDiv.style.borderRadius = '8px';
        shopDiv.style.padding = '20px';
        shopDiv.style.marginBottom = '30px';
        shopDiv.style.boxShadow = '0 4px 12px var(--shadow)';

        shopDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 15px; border-bottom: 2px solid var(--gold); padding-bottom: 6px;">
                <h2 class="section-title-small" style="margin:0; border:none; padding:0;">Random Shop Generator</h2>
                <button id="shop-guide-btn" style="background:var(--parchment-dark); border:1px solid var(--gold); border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold; color:var(--ink-light); display:flex; align-items:center; justify-content:center;" title="Pricing & Weight Guide">?</button>
            </div>

            <div id="shop-guide-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
                <div style="background:var(--parchment); padding:20px; border:2px solid var(--gold); border-radius:8px; width:90%; max-width:400px; max-height:80vh; overflow-y:auto; position:relative; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
                    <button id="close-shop-guide" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:1.5rem; cursor:pointer; color:var(--ink);">&times;</button>
                    <h3 style="color:var(--red-dark); margin-top:0; text-align:center; font-family:'Cinzel',serif; border-bottom:1px solid var(--gold); padding-bottom:8px; margin-bottom:12px;">Shop Guide</h3>
                    
                    <h4 style="margin-bottom:4px; color:var(--ink);">Pricing by Rarity</h4>
                    <table style="width:100%; border-collapse:collapse; font-size:0.9rem; margin-bottom:16px;">
                        <tr style="background:rgba(0,0,0,0.05);"><th style="text-align:left; padding:4px;">Rarity</th><th style="text-align:right; padding:4px;">Price Range</th></tr>
                        <tr><td style="padding:4px;">Common</td><td style="text-align:right; padding:4px;">50 - 100 gp</td></tr>
                        <tr><td style="padding:4px;">Uncommon</td><td style="text-align:right; padding:4px;">101 - 500 gp</td></tr>
                        <tr><td style="padding:4px;">Rare</td><td style="text-align:right; padding:4px;">501 - 5,000 gp</td></tr>
                        <tr><td style="padding:4px;">Very Rare</td><td style="text-align:right; padding:4px;">5,001 - 50,000 gp</td></tr>
                        <tr><td style="padding:4px;">Legendary</td><td style="text-align:right; padding:4px;">50,001+ gp</td></tr>
                    </table>

                    <h4 style="margin-bottom:4px; color:var(--ink);">Common Weights</h4>
                    <ul style="font-size:0.9rem; padding-left:20px; margin:0;">
                        <li><strong>Potion:</strong> 0.5 lb</li>
                        <li><strong>Scroll:</strong> Negligible</li>
                        <li><strong>Wand/Rod:</strong> 1 - 2 lbs</li>
                        <li><strong>Weapon/Armor:</strong> See PHB</li>
                    </ul>
                </div>
            </div>

            <div style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 20px;">
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px; font-family: 'Cinzel', serif;">Rarity</label>
                    <div id="shop-rarity-options" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'].map(r => 
                            `<div class="rarity-tag ${['Common', 'Uncommon'].includes(r) ? 'selected' : ''}" data-value="${r.toLowerCase()}" 
                                  style="padding: 6px 12px; border: 1px solid var(--gold); border-radius: 4px; cursor: pointer; user-select: none; background: ${['Common', 'Uncommon'].includes(r) ? 'var(--red)' : 'white'}; color: ${['Common', 'Uncommon'].includes(r) ? 'white' : 'var(--ink)'}; transition: all 0.2s; font-family: 'Cinzel', serif; font-size: 0.9rem;">
                                ${r}
                             </div>`
                        ).join('')}
                    </div>
                </div>
                <div style="width: 100px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px; font-family: 'Cinzel', serif;">Item Count</label>
                    <input type="number" id="shop-count" value="10" min="1" max="50" style="width: 100%; padding: 8px; border: 1px solid var(--gold); border-radius: 4px;">
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px; justify-content: flex-end;">
                    <label style="display: flex; align-items: center; gap: 5px; font-family: 'Cinzel', serif; font-size: 0.9rem; cursor: pointer; color: var(--ink);">
                        <input type="checkbox" id="shop-magic-enabled" checked style="width: 16px; height: 16px; accent-color: var(--red);"> Include Magic Items
                    </label>
                    <label style="display: flex; align-items: center; gap: 5px; font-family: 'Cinzel', serif; font-size: 0.9rem; cursor: pointer; color: var(--ink);">
                        <input type="checkbox" id="shop-magic-only" style="width: 16px; height: 16px; accent-color: var(--red);"> Magic Items Only
                    </label>
                    <div style="display: flex; gap: 5px;">
                        <button id="generate-shop-btn" class="btn" style="height: 40px;">Generate</button>
                        <button id="clear-shop-btn" class="btn btn-secondary" style="height: 40px;">Clear</button>
                    </div>
                </div>
            </div>
            <div id="shop-results" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;"></div>
        `;

        container.parentNode.insertBefore(shopDiv, container);

        // Add click handlers for rarity tags
        shopDiv.querySelectorAll('.rarity-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('selected');
                if (tag.classList.contains('selected')) {
                    tag.style.background = 'var(--red)';
                    tag.style.color = 'white';
                    tag.style.borderColor = 'var(--red-dark)';
                } else {
                    tag.style.background = 'white';
                    tag.style.color = 'var(--ink)';
                    tag.style.borderColor = 'var(--gold)';
                }
            });
        });

        // Guide Modal Handlers
        document.getElementById('shop-guide-btn').addEventListener('click', () => document.getElementById('shop-guide-modal').style.display = 'flex');
        document.getElementById('close-shop-guide').addEventListener('click', () => document.getElementById('shop-guide-modal').style.display = 'none');

        // Toggle logic
        const magicEnabledCb = document.getElementById('shop-magic-enabled');
        const magicOnlyCb = document.getElementById('shop-magic-only');
        magicEnabledCb.addEventListener('change', () => {
            if (!magicEnabledCb.checked) magicOnlyCb.checked = false;
        });
        magicOnlyCb.addEventListener('change', () => {
            if (magicOnlyCb.checked) magicEnabledCb.checked = true;
        });

        document.getElementById('generate-shop-btn').addEventListener('click', generateShop);
        document.getElementById('clear-shop-btn').addEventListener('click', () => document.getElementById('shop-results').innerHTML = '');
    };

    const DB_NAME = 'DndDataDB';
    const STORE_NAME = 'files';
    const DB_VERSION = 
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            };
        });
    }

    async function generateShop() {
        const resultsDiv = document.getElementById('shop-results');
        resultsDiv.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--ink-light);">Loading items...</div>';

        const selectedRarities = Array.from(document.querySelectorAll('#shop-rarity-options .rarity-tag.selected'))
                                      .map(el => el.dataset.value);
        const count = parseInt(document.getElementById('shop-count').value) || 10;
        const magicEnabled = document.getElementById('shop-magic-enabled').checked;
        const magicOnly = document.getElementById('shop-magic-only').checked;

        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const data = await new Promise((resolve, reject) => {
                const req = store.get('currentData');
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });

            if (!data) {
                resultsDiv.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--red);">No item data found. Please upload data in the Character Sheet.</div>';
                return;
            }

            let allItems = [];
            data.forEach(file => {
                try {
                    const json = JSON.parse(file.content);
                    [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants, json.variant].forEach(arr => {
                        if (Array.isArray(arr)) arr.forEach(i => { if (i.name) allItems.push(i); });
                    });
                } catch (e) {}
            });

            const filtered = allItems.filter(item => {
                const r = (item.rarity || 'None').toLowerCase();
                const isMundane = (r === 'none' || r === 'unknown');
                
                if (!magicEnabled && !isMundane) return false;
                if (magicOnly && isMundane) return false;

                const effectiveRarity = isMundane ? 'common' : r;
                
                if (!selectedRarities.includes(effectiveRarity)) return false;
                
                return true;
            });
            const uniqueItems = Array.from(new Map(filtered.map(i => [i.name, i])).values());
            
            if (uniqueItems.length === 0) {
                resultsDiv.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No items found for selected rarities.</div>';
                return;
            }

            // Helper to clean 5e-tools style tags
            const cleanText = (str) => {
                if (!str) return "";
                return str.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => {
                    if (!content) return "";
                    return content.split('|')[0];
                });
            };

            // Recursively extract text from entries array
            const processEntries = (entries) => {
               if (!entries) return "";
               if (typeof entries === 'string') return entries;
               if (!Array.isArray(entries)) return "";
               
               return entries.map(e => {
                   if (!e) return "";
                   if (typeof e === 'string') return e;
                   
                   let text = "";
                   if (e.name && (e.type === 'section' || e.type === 'entries')) text += `<strong>${e.name}.</strong> `;
                   
                   if (e.entries) text += processEntries(e.entries);
                   else if (e.items) text += processEntries(e.items);
                   else if (e.entry) text += (typeof e.entry === 'string' ? e.entry : processEntries([e.entry]));
                   else if (e.caption) text += e.caption;
                   else if (e.text) text += e.text;
                   
                   return text;
               }).join("<br><br>");
            };

            resultsDiv.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const item = uniqueItems[Math.floor(Math.random() * uniqueItems.length)];
                
                // Capitalize Rarity
                const rarityRaw = item.rarity || 'Common';
                const rarity = rarityRaw.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                
                // Determine Type
                let itemType = "Item";
                if (item.wondrous) itemType = "Wondrous Item";
                else if (item.type) {
                    const t = typeof item.type === 'string' ? item.type : "";
                    const typeMap = {
                        "HA": "Heavy Armor", "MA": "Medium Armor", "LA": "Light Armor", "S": "Shield",
                        "M": "Melee Weapon", "R": "Ranged Weapon", "A": "Ammunition",
                        "RD": "Rod", "ST": "Staff", "WD": "Wand", "RG": "Ring",
                        "P": "Potion", "SC": "Scroll", "W": "Wondrous Item",
                        "G": "Adventuring Gear", "INS": "Instrument", "$": "Treasure"
                    };
                    itemType = typeMap[t] || t || "Item";
                }

                // Price
                const price = item.value ? (typeof item.value === 'string' ? item.value : item.value + " gp") : "";
                
                // Description
                let desc = "";
                if (item.entries) desc = processEntries(item.entries);
                if (!desc && item.inherits && item.inherits.entries) desc = processEntries(item.inherits.entries);
                if (!desc && item.description) desc = item.description;
                if (!desc && item.desc) desc = processEntries(item.desc);
                if (!desc && item.text) desc = item.text;
                desc = cleanText(desc);
                
                const uniqueId = 'shop-item-' + Math.random().toString(36).substr(2, 9);

                const card = document.createElement('div');
                card.style.cssText = "background:white; border:1px solid var(--gold); border-radius:4px; padding:10px; display:flex; flex-direction:column; gap:8px; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition:all 0.2s;";
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                            <div style="font-weight:bold; color:var(--ink);">${item.name}</div>
                            <div style="font-size:0.8rem; color:var(--ink-light); font-style:italic;">${rarity} &bull; ${itemType}</div>
                        </div>
                    </div>
                    
                    <div id="desc-${uniqueId}" style="display:none; font-size:0.85rem; color:var(--ink); border-top:1px dashed var(--gold); padding-top:8px; max-height:200px; overflow-y:auto; line-height:1.4;">
                        ${desc || "No description available."}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:4px;">
                        <div style="font-weight:bold; color:var(--red-dark); font-size:0.9rem;">${price}</div>
                        <button onclick="const d = document.getElementById('desc-${uniqueId}'); d.style.display = d.style.display === 'none' ? 'block' : 'none'; this.textContent = d.style.display === 'none' ? 'Details' : 'Close';" 
                                style="background:var(--parchment-dark); border:1px solid var(--gold); border-radius:4px; padding:2px 8px; font-size:0.8rem; cursor:pointer; color:var(--ink);">
                            Details
                        </button>
                    </div>
                `;
                resultsDiv.appendChild(card);
            }
        } catch (e) { console.error(e); resultsDiv.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--red);">Error generating shop.</div>'; }
    }
    initShopGenerator();
});
