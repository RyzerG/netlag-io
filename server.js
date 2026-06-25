const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to generate initial flatline telemetry for the graphs (15 data points)
const generateBaselineHistory = (baseVal) => Array(15).fill(baseVal);

// --- MASTER DATA STORE ---
const systemState = {
    networks: {
        "discord": { name: "Discord", icon: "fa-discord", history: generateBaselineHistory(5), status: "Operational", url: "https://discordstatus.com" },
        "psn": { name: "PlayStation Network", icon: "fa-playstation", history: generateBaselineHistory(10), status: "Operational", url: "https://status.playstation.com" },
        "xbox": { name: "Xbox Live", icon: "fa-xbox", history: generateBaselineHistory(8), status: "Operational", url: "https://support.xbox.com/en-US/xbox-live-status" },
        "steam": { name: "Steam", icon: "fa-steam", history: generateBaselineHistory(15), status: "Operational", url: "https://steamstat.us" },
        "nintendo": { name: "Switch Online", icon: "fa-gamepad", history: generateBaselineHistory(2), status: "Operational", url: "https://www.nintendo.co.jp/netinfo/en_US/index.html" }
    },
    games: {
        "fortnite": { name: "Fortnite", trending: true, history: generateBaselineHistory(12), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://status.epicgames.com" },
        "valorant": { name: "Valorant", trending: true, history: generateBaselineHistory(20), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://status.riotgames.com/valorant" },
        "roblox": { name: "Roblox", trending: true, history: generateBaselineHistory(45), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://status.roblox.com/" },
        "apex": { name: "Apex Legends", trending: false, history: generateBaselineHistory(30), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://apexlegendsstatus.com/" },
        "call-of-duty": { name: "Call of Duty", trending: true, history: generateBaselineHistory(55), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://support.activision.com/onlineservices" },
        "rocket-league": { name: "Rocket League", trending: false, history: generateBaselineHistory(8), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://status.epicgames.com" },
        "minecraft": { name: "Minecraft", trending: false, history: generateBaselineHistory(10), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://help.minecraft.net/hc/en-us" },
        "overwatch": { name: "Overwatch 2", trending: false, history: generateBaselineHistory(22), status: "Operational", userReports: 0, maintenance: "Awaiting live data...", url: "https://us.battle.net/support/en/" }
    }
};

// --- LIVE POLLING ENGINE ---
// Native HTTP GET wrapper for standard JSON APIs
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } 
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// Map Atlassian Statuspage indicators to our system
const mapStatus = (indicator) => {
    if (indicator === 'none') return "Operational";
    if (indicator === 'minor') return "Degraded Performance";
    return "Major Outage";
};

// Push new metric to array, drop oldest
function updateHistory(obj, newValue) {
    obj.history.push(newValue);
    if (obj.history.length > 15) obj.history.shift();
}

async function pollLiveData() {
    console.log(`[${new Date().toLocaleTimeString()}] Fetching live telemetry...`);
    
    try {
        // 1. Pull Discord (Official API)
        const discordData = await fetchJSON('https://discordstatus.com/api/v2/summary.json');
        systemState.networks.discord.status = mapStatus(discordData.status.indicator);
        updateHistory(systemState.networks.discord, systemState.networks.discord.status === "Operational" ? 5 : 80);

        // 2. Pull Epic Games (Fortnite & Rocket League)
        const epicData = await fetchJSON('https://status.epicgames.com/api/v2/summary.json');
        
        // Find specific game components
        const fnComponent = epicData.components.find(c => c.name === "Fortnite");
        if (fnComponent) {
            systemState.games.fortnite.status = fnComponent.status === 'operational' ? "Operational" : "Degraded Performance";
            systemState.games.fortnite.maintenance = epicData.incidents.length > 0 ? epicData.incidents[0].name : "No official server issues reported.";
        }
        
        const rlComponent = epicData.components.find(c => c.name === "Rocket League");
        if (rlComponent) {
            systemState.games["rocket-league"].status = rlComponent.status === 'operational' ? "Operational" : "Degraded Performance";
            systemState.games["rocket-league"].maintenance = "Live API sync complete.";
        }

        // 3. Fallback Scrape Simulation for Closed APIs (PSN, Xbox, Riot, etc)
        // In a true production app, you would use Puppeteer to scrape these pages. Here we simulate natural server fluctuation.
        Object.keys(systemState.games).forEach(key => {
            if (key !== 'fortnite' && key !== 'rocket-league') {
                let basePing = Math.floor(Math.random() * 20) + 10;
                let finalPing = basePing + systemState.games[key].userReports;
                
                // Determine simulated status
                if (finalPing > 150) systemState.games[key].status = "Major Outage";
                else if (finalPing > 80) systemState.games[key].status = "Degraded Performance";
                else systemState.games[key].status = "Operational";
                
                systemState.games[key].maintenance = "Live telemetry stable. Tracking user reports.";
                updateHistory(systemState.games[key], finalPing);
                
                // Slowly decay crowdsourced user reports over time so outages resolve themselves
                if (systemState.games[key].userReports > 0) systemState.games[key].userReports = Math.floor(systemState.games[key].userReports * 0.8);
            } else {
                // Just update history for the live ones based on their real status + crowdsource
                let val = systemState.games[key].status === "Operational" ? 10 : 90;
                updateHistory(systemState.games[key], val + systemState.games[key].userReports);
                if (systemState.games[key].userReports > 0) systemState.games[key].userReports = Math.floor(systemState.games[key].userReports * 0.8);
            }
        });

        // Update other networks history
        Object.keys(systemState.networks).forEach(key => {
            if (key !== 'discord') {
                updateHistory(systemState.networks[key], Math.floor(Math.random() * 15) + 5); // Normal fluctuations
            }
        });

        console.log("Telemetry updated successfully.");
    } catch (error) {
        console.error("Failed to pull live APIs:", error.message);
    }
}

// Run polling every 5 minutes (300,000 ms)
setInterval(pollLiveData, 300000);
// Run once immediately on startup
pollLiveData();


// --- API ENDPOINTS ---
app.get('/api/status', (req, res) => {
    // Transform object into arrays for the frontend
    const responseData = {
        networks: Object.keys(systemState.networks).map(id => ({ id, ...systemState.networks[id] })),
        games: Object.keys(systemState.games).map(id => ({ id, ...systemState.games[id] }))
    };
    res.json(responseData);
});

app.post('/api/report', (req, res) => {
    const { gameId } = req.body;
    if (systemState.games[gameId]) {
        systemState.games[gameId].userReports += 40; // High spike for immediate feedback
        
        // Instantly force an update to the history array for instant UI feedback
        const currentLast = systemState.games[gameId].history.pop();
        systemState.games[gameId].history.push(currentLast + 40);

        return res.json({ success: true, message: "Report logged!" });
    }
    res.status(400).json({ success: false, message: "Game not found" });
});

app.listen(PORT, () => {
    console.log(`NETLAG.IO LIVE SERVER running on port ${PORT}`);
});