document.addEventListener('DOMContentLoaded', () => {
    fetchLiveTelemetry();
    // Re-poll the server every 60 seconds from the frontend just to refresh UI
    setInterval(fetchLiveTelemetry, 60000);
});

async function fetchLiveTelemetry() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        renderNetworks(data.networks);
        renderGames(data.games);
    } catch (error) {
        console.error("Critical Error retrieving telemetry:", error);
    }
}

function renderNetworks(networks) {
    const grid = document.getElementById('networks-grid');
    grid.innerHTML = '';

    networks.forEach(net => {
        let statusText = net.status === "Operational" ? "ONLINE" : "ISSUES DETECTED";
        let statusClass = net.status === "Operational" ? "" : "down";
        let color = net.status === "Operational" ? "#00ff87" : "#ff0055";

        grid.innerHTML += `
            <a href="${net.url}" target="_blank" style="text-decoration: none;">
                <div class="network-card">
                    <i class="fa-brands ${net.icon} network-icon"></i>
                    <div class="network-info">
                        <div class="network-name">${net.name}</div>
                        <div class="network-status ${statusClass}">${statusText}</div>
                    </div>
                    ${generateMiniGraph(net.history, color)}
                </div>
            </a>
        `;
    });
}

function generateMiniGraph(historyArray, strokeColor) {
    const width = 60;
    const height = 25;
    const maxVal = Math.max(...historyArray, 100);
    
    let points = historyArray.map((val, i) => {
        const x = (i / (historyArray.length - 1)) * width;
        const y = height - (val / maxVal) * height;
        return {x, y};
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return `
        <svg width="60" height="25" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
            <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        </svg>
    `;
}

function renderGames(games) {
    const trendingGrid = document.getElementById('trending-grid');
    const allGamesGrid = document.getElementById('all-games-grid');

    trendingGrid.innerHTML = '';
    allGamesGrid.innerHTML = '';

    games.forEach(game => {
        const cardHTML = createGameCard(game);
        
        if (game.trending) {
            trendingGrid.innerHTML += cardHTML;
        }
        allGamesGrid.innerHTML += cardHTML;
    });
}

function createGameCard(game) {
    let statusClass = 'status-operational';
    let dotClass = 'dot-operational';
    let iconHTML = '<i class="fa-solid fa-circle-check"></i>';
    let displayStatus = 'OPERATIONAL';
    let strokeColor = '#00ff87'; 
    let fillGradientId = `grad-${game.id}`;

    if (game.status === 'Degraded Performance') {
        statusClass = 'status-degraded';
        dotClass = 'dot-degraded';
        iconHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        displayStatus = 'DEGRADED';
        strokeColor = '#ffcc00'; 
    } else if (game.status === 'Major Outage') {
        statusClass = 'status-outage';
        dotClass = 'dot-outage';
        iconHTML = '<i class="fa-solid fa-circle-xmark"></i>';
        displayStatus = 'OUTAGE';
        strokeColor = '#ff0055'; 
    }

    const width = 300;
    const height = 80;
    const maxSpike = Math.max(...game.history, 100); 
    
    let points = game.history.map((val, i) => {
        const x = (i / (game.history.length - 1)) * width;
        const y = (height - 5) - (val / maxSpike) * (height - 10);
        return {x, y};
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    let regionPillsHTML = `<div class="region-pills">`;
    ['US', 'EU', 'ASIA'].forEach(region => {
        let regionStatus = game.regions[region];
        let regionDot = 'dot-operational';
        
        if (regionStatus === 'Degraded Performance') regionDot = 'dot-degraded';
        if (regionStatus === 'Major Outage') regionDot = 'dot-outage';
        
        regionPillsHTML += `
            <div class="region-pill">
                <span class="pill-dot ${regionDot}"></span> ${region}
            </div>
        `;
    });
    regionPillsHTML += `</div>`;

    return `
        <div class="game-card" id="card-${game.id}">
            <div>
                <div class="card-header">
                    <div class="title-container">
                        <span class="status-dot ${dotClass}"></span>
                        <div class="game-name">
                            <a href="${game.url}" target="_blank" title="View Official Status Page">
                                ${game.name} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.6em; opacity: 0.7; margin-left: 3px;"></i>
                            </a>
                        </div>
                    </div>
                    <span class="status-badge ${statusClass}">${iconHTML} ${displayStatus}</span>
                </div>
                <div class="card-body">
                    <div class="graph-container">
                        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="${fillGradientId}" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.25"/>
                                    <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
                                </linearGradient>
                            </defs>
                            <path d="${areaPath}" fill="url(#${fillGradientId})" />
                            <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </div>
                    
                    ${regionPillsHTML}
                    
                    <div class="maintenance-text">  ${game.maintenance}</div>
                </div>
            </div>
            <button class="report-btn" onclick="submitReport('${game.id}')">REPORT ISSUES</button>
        </div>
    `;
}

async function submitReport(gameId) {
    try {
        const response = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameId })
        });
        const result = await response.json();
        
        if (result.success) {
            fetchLiveTelemetry();
        } else {
            // Catches rate limits and invalid requests and alerts the user
            alert(result.message);
        }
    } catch (error) {
        console.error("Failed to post system anomaly report:", error);
    }
}