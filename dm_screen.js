document.addEventListener('DOMContentLoaded', () => {
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
});
