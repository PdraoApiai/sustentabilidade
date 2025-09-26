const GAME_CONFIG = {
    costs: {
        upgradeBuilding: 2000,
        upgradeAll: 5000,
        launchCampaign: 2000,
        buildPark: 8000,
    },
    rewards: {
        taxPerPopulation: 10,
    },
    gameLoopInterval: 5000, // 5 segundos = 1 dia
    randomEventChance: 0.25, // 25% de chance por dia
};

class EcoCityGame {
    constructor() {
        this.state = {};
        this.dom = {};
        this.gameInterval = null;
        this.cacheDomElements();
        this.bindEventListeners();
        this.resetState();
    }

    cacheDomElements() {
        this.dom.score = document.getElementById('score');
        this.dom.level = document.getElementById('level');
        this.dom.day = document.getElementById('day');
        this.dom.money = document.getElementById('money');
        this.dom.energy = document.getElementById('energy');
        this.dom.recycling = document.getElementById('recycling');
        this.dom.happiness = document.getElementById('happiness');
        this.dom.pollution = document.getElementById('pollution');
        this.dom.moneyBar = document.getElementById('money-bar');
        this.dom.energyBar = document.getElementById('energy-bar');
        this.dom.recyclingBar = document.getElementById('recycling-bar');
        this.dom.happinessBar = document.getElementById('happiness-bar');
        this.dom.pollutionBar = document.getElementById('pollution-bar');
        this.dom.missionsList = document.getElementById('missions-list');
        this.dom.gameArea = document.getElementById('game-area');
        this.dom.startScreen = document.getElementById('start-screen');
        this.dom.endScreen = document.getElementById('end-screen');
        this.dom.finalStats = document.getElementById('final-stats');
        // Botões
        this.dom.upgradeAllBtn = document.getElementById('upgrade-all');
        this.dom.collectTaxesBtn = document.getElementById('collect-taxes');
        this.dom.launchCampaignBtn = document.getElementById('launch-campaign');
        this.dom.buildParkBtn = document.getElementById('build-park');
    }

    bindEventListeners() {
        this.dom.upgradeAllBtn.addEventListener('click', () => this.upgradeAll());
        this.dom.collectTaxesBtn.addEventListener('click', () => this.collectTaxes());
        this.dom.launchCampaignBtn.addEventListener('click', () => this.launchCampaign());
        this.dom.buildParkBtn.addEventListener('click', () => this.buildPark());
    }

    resetState() {
        this.state = {
            score: 0, level: 1, day: 1, money: 10000,
            energy: 100, recycling: 0, population: 1000,
            happiness: 70, pollution: 20,
            buildings: [], missions: [],
        };
        this.setupMissions();
        this.setupBuildings();
    }
    
    setupMissions() { /* ... (código original sem mudanças) ... */ }
    setupBuildings() {
        this.state.buildings = [
            { id: 1, type: 'house', name: 'Residencial', x: 200, y: 400, level: 1, efficiency: 60, pollution: 1, happiness: 1 },
            { id: 2, type: 'factory', name: 'Fábrica', x: 400, y: 300, level: 1, efficiency: 40, pollution: 10, happiness: -5 },
            { id: 3, type: 'school', name: 'Escola', x: 600, y: 400, level: 1, efficiency: 70, pollution: 2, happiness: 3 },
            { id: 4, type: 'mall', name: 'Shopping', x: 800, y: 300, level: 1, efficiency: 30, pollution: 5, happiness: 2 },
            { id: 5, type: 'park', name: 'Parque', x: 500, y: 200, level: 1, efficiency: 90, pollution: -10, happiness: 10 }
        ];
    }
    
    start() {
        this.dom.startScreen.classList.add('hidden');
        this.renderBuildings();
        this.updateUI();
        this.startGameLoop();
    }

    renderBuildings() {
        this.dom.gameArea.innerHTML = '';
        this.state.buildings.forEach(building => {
            const buildingEl = document.createElement('div');
            buildingEl.className = 'building';
            buildingEl.style.left = building.x + 'px';
            buildingEl.style.top = building.y + 'px';
            buildingEl.dataset.id = building.id; // Para encontrar o elemento depois
            
            const icon = {'house':'🏠','factory':'🏭','school':'🏫','mall':'🏪','park':'🌳'}[building.type] || '🏢';
            buildingEl.innerHTML = `
                <div class="building-icon">${icon}</div>
                <div class="building-info">
                    ${building.name}<br>
                    Nv. ${building.level} | Efic. ${building.efficiency}%
                </div>`;
            
            buildingEl.title = `${building.name} (Nv. ${building.level})\nPoluição: ${building.pollution}/dia\nFelicidade: ${building.happiness}/dia`;

            buildingEl.addEventListener('click', () => this.upgradeBuilding(building, buildingEl));
            this.dom.gameArea.appendChild(buildingEl);
        });
    }

    upgradeBuilding(building, element) {
        if (this.state.money >= GAME_CONFIG.costs.upgradeBuilding) {
            this.state.money -= GAME_CONFIG.costs.upgradeBuilding;
            building.level++;
            building.efficiency = Math.min(100, building.efficiency + 10);
            building.pollution = Math.max(0, building.pollution - 1); // Melhorias reduzem poluição
            building.happiness += 1; // E aumentam felicidade

            this.state.score += 50;
            this.showNotification(`⚡ ${building.name} melhorado!`);
            
            element.classList.add('building-upgraded');
            setTimeout(() => element.classList.remove('building-upgraded'), 800);

            this.renderBuildings();
            this.updateUI();
            this.checkMissions();
        } else {
            this.showNotification('❌ Orçamento insuficiente!');
        }
    }

    // --- Ações do Jogador ---
    upgradeAll() { /* ... (usar GAME_CONFIG.costs.upgradeAll) ... */ }
    collectTaxes() { /* ... (usar GAME_CONFIG.rewards.taxPerPopulation) ... */ }
    launchCampaign() { /* ... (usar GAME_CONFIG.costs.launchCampaign) ... */ }
    buildPark() { /* ... (usar GAME_CONFIG.costs.buildPark) ... */ }

    // --- Lógica do Jogo ---
    dailyUpdate() {
        this.state.day++;
        
        // Cálculos diários de poluição e felicidade
        let dailyPollution = 0;
        let dailyHappiness = 0;
        this.state.buildings.forEach(b => {
            dailyPollution += b.pollution;
            dailyHappiness += b.happiness;
        });

        this.state.pollution = Math.min(100, Math.max(0, this.state.pollution + dailyPollution / 5));
        this.state.happiness = Math.min(100, Math.max(0, this.state.happiness + dailyHappiness / 10));

        // Consumo e ganhos diários
        this.state.energy = Math.max(0, this.state.energy - 2);
        this.state.recycling = Math.max(0, this.state.recycling - 1);
        if(this.state.happiness < 30) this.state.population -= 10;
        else if (this.state.happiness > 70) this.state.population += 20;

        // Evento aleatório
        if (Math.random() < GAME_CONFIG.randomEventChance) {
            this.handleRandomEvent();
        }

        // Checar fim de jogo
        if (this.state.day >= 100 || this.state.score >= 5000 || this.state.energy <= 0) {
            this.endGame();
        }
        
        this.updateUI();
        this.checkMissions();
    }
    
    handleRandomEvent() {
        const events = [
            { text: '☀️ Onda de calor! Consumo de energia dobrou por um dia.', effect: () => this.state.energy -= 10 },
            { text: '💡 Inovação tecnológica! Custos de upgrade reduzidos.', effect: () => GAME_CONFIG.costs.upgradeBuilding /= 2 },
            { text: '🎉 Festival cultural aumentou a felicidade da cidade!', effect: () => this.state.happiness += 20 },
            { text: '🏭 Vazamento químico aumentou a poluição!', effect: () => this.state.pollution += 15 },
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        this.showNotification(`📢 Evento: ${randomEvent.text}`);
        randomEvent.effect();
        // Resetar evento de custo após um dia
        if (randomEvent.text.includes('Custos de upgrade')) {
            setTimeout(() => {
                GAME_CONFIG.costs.upgradeBuilding *= 2;
                this.showNotification('Custos de upgrade voltaram ao normal.');
            }, GAME_CONFIG.gameLoopInterval);
        }
    }

    // --- Funções de UI e Loop ---
    updateUI() {
        this.dom.score.textContent = this.state.score;
        this.dom.level.textContent = this.state.level;
        this.dom.day.textContent = this.state.day;
        this.dom.money.textContent = '$' + this.state.money.toLocaleString();
        this.dom.energy.textContent = Math.round(this.state.energy) + '%';
        this.dom.recycling.textContent = Math.round(this.state.recycling) + '%';
        this.dom.happiness.textContent = Math.round(this.state.happiness) + '%';
        this.dom.pollution.textContent = Math.round(this.state.pollution) + '%';
        
        this.dom.moneyBar.style.width = Math.min(100, (this.state.money / 50000) * 100) + '%';
        this.dom.energyBar.style.width = this.state.energy + '%';
        this.dom.recyclingBar.style.width = this.state.recycling + '%';
        this.dom.happinessBar.style.width = this.state.happiness + '%';
        this.dom.pollutionBar.style.width = this.state.pollution + '%';
        this.dom.happinessBar.style.background = this.state.happiness < 50 ? 'linear-gradient(90deg, #e74c3c, #c0392b)' : 'linear-gradient(90deg, #2ecc71, #27ae60)';

        // Atualizar botões
        this.dom.upgradeAllBtn.disabled = this.state.money < GAME_CONFIG.costs.upgradeAll;
        this.dom.upgradeAllBtn.textContent = `⚡ Melhorar Tudo ($${GAME_CONFIG.costs.upgradeAll.toLocaleString()})`
        // (fazer o mesmo para os outros botões)
    }

    showNotification(message) { /* ... (código original sem mudanças) ... */ }

    startGameLoop() {
        clearInterval(this.gameInterval);
        this.gameInterval = setInterval(() => this.dailyUpdate(), GAME_CONFIG.gameLoopInterval);
    }

    endGame() {
        clearInterval(this.gameInterval);
        this.dom.endScreen.classList.remove('hidden');
        // ... Lógica de fim de jogo
    }

    restart() {
        location.reload();
    }
}

// Inicializar o jogo
const game = new EcoCityGame();

// Adicionei aqui o código que faltava de alguns métodos para que fiquem completos e usem o GAME_CONFIG
EcoCityGame.prototype.setupMissions = function() { /* código original aqui */ };
EcoCityGame.prototype.upgradeAll = function() {
    if (this.state.money >= GAME_CONFIG.costs.upgradeAll) {
        this.state.buildings.forEach(b => {
            b.level++;
            b.efficiency = Math.min(100, b.efficiency + 5);
        });
        this.state.money -= GAME_CONFIG.costs.upgradeAll;
        this.state.score += 200;
        this.showNotification('🎉 Todas as construções melhoradas!');
        this.renderBuildings();
        this.updateUI();
    } else { this.showNotification('❌ Orçamento insuficiente!'); }
};
EcoCityGame.prototype.collectTaxes = function() {
    const taxes = this.state.population * GAME_CONFIG.rewards.taxPerPopulation;
    this.state.money += taxes;
    this.state.score += 20;
    this.showNotification(`💵 Impostos coletados: +$${taxes.toLocaleString()}`);
    this.updateUI();
};
EcoCityGame.prototype.launchCampaign = function() {
    if (this.state.money >= GAME_CONFIG.costs.launchCampaign) {
        this.state.money -= GAME_CONFIG.costs.launchCampaign;
        this.state.recycling = Math.min(100, this.state.recycling + 10);
        this.state.happiness = Math.min(100, this.state.happiness + 5);
        this.state.score += 80;
        this.showNotification('📢 Campanha de conscientização lançada!');
        this.updateUI();
    } else { this.showNotification('❌ Orçamento insuficiente!'); }
};
EcoCityGame.prototype.buildPark = function() {
    if (this.state.money >= GAME_CONFIG.costs.buildPark) {
        this.state.money -= GAME_CONFIG.costs.buildPark;
        this.state.buildings.push({
            id: this.state.buildings.length + 1, type: 'park', name: 'Novo Parque',
            x: Math.random() * 700 + 100, y: Math.random() * 300 + 100,
            level: 1, efficiency: 95, pollution: -15, happiness: 15
        });
        this.state.score += 150;
        this.showNotification('🌳 Novo parque construído!');
        this.renderBuildings();
        this.updateUI();
    } else { this.showNotification('❌ Orçamento insuficiente!'); }
};
EcoCityGame.prototype.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    this.dom.gameArea.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
};