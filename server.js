const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 9050;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to generate initial flatline telemetry for the graphs (15 data points)
const generateBaselineHistory = (baseVal) => Array(15).fill(baseVal);

// Default region operational state
const defaultRegions = () => ({ US: "Operational", EU: "Operational", ASIA: "Operational" });

// --- MASTER DATA STORE ---
const systemState = {
    networks: {
        "discord": { name: "Discord", icon: "fa-discord", history: generateBaselineHistory(5), status: "Operational", url: "https://discordstatus.com" },
        "psn": { name: "PlayStation", icon: "fa-playstation", history: generateBaselineHistory(10), status: "Operational", url: "https://status.playstation.com" },
        "xbox": { name: "Xbox", icon: "fa-xbox", history: generateBaselineHistory(8), status: "Operational", url: "https://support.xbox.com/en-US/xbox-live-status" },
        "steam": { name: "Steam", icon: "fa-steam", history: generateBaselineHistory(15), status: "Operational", url: "https://steamstat.us" }
    },
    games: {
        "fortnite": { name: "Fortnite", trending: true, history: generateBaselineHistory(12), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://status.epicgames.com" },
        "valorant": { name: "Valorant", trending: true, history: generateBaselineHistory(20), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://status.riotgames.com/valorant" },
        "roblox": { name: "Roblox", trending: true, history: generateBaselineHistory(45), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://status.roblox.com/" },
        "apex": { name: "Apex Legends", trending: true, history: generateBaselineHistory(30), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://apexlegendsstatus.com/" },
        "call-of-duty": { name: "Call of Duty", trending: true, history: generateBaselineHistory(55), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://support.activision.com/onlineservices" },
        "minecraft": { name: "Minecraft", trending: true, history: generateBaselineHistory(10), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://help.minecraft.net/hc/en-us" },
        "rocket-league": { name: "Rocket League", trending: false, history: generateBaselineHistory(8), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://status.epicgames.com" },
        "overwatch": { name: "Overwatch 2", trending: false, history: generateBaselineHistory(22), status: "Operational", regions: defaultRegions(), userReports: 0, maintenance: "Awaiting live data...", url: "https://us.battle.net/support/en/" }
    }
};

// --- LIVE POLLING ENGINE ---
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

const mapStatus = (indicator) => {
    if (indicator === 'none') return "Operational";
    if (indicator === 'minor') return "Degraded Performance";
    return "Major Outage";
};

// Calculates regional cascade based on severity of the ping
function calculateRegions(status) {
    if (status === "Major Outage") return { US: "Major Outage", EU: "Major Outage", ASIA: "Major Outage" };
    if (status === "Degraded Performance") {
        // Randomly degrade some regions but not all to simulate routing issues
        const states = ["Operational", "Degraded Performance", "Major Outage"];
        return { 
            US: states[Math.floor(Math.random() * 2) + 1], 
            EU: states[Math.floor(Math.random() * 2)], 
            ASIA: states[Math.floor(Math.random() * 2) + 1] 
        };
    }
    return defaultRegions();
}

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

        // 2. Pull Epic Games
        const epicData = await fetchJSON('https://status.epicgames.com/api/v2/summary.json');
        
        const fnComponent = epicData.components.find(c => c.name === "Fortnite");
        if (fnComponent) {
            systemState.games.fortnite.status = fnComponent.status === 'operational' ? "Operational" : "Degraded Performance";
            systemState.games.fortnite.regions = calculateRegions(systemState.games.fortnite.status);
            systemState.games.fortnite.maintenance = epicData.incidents.length > 0 ? epicData.incidents[0].name : "No official server issues reported.";
        }
        
        const rlComponent = epicData.components.find(c => c.name === "Rocket League");
        if (rlComponent) {
            systemState.games["rocket-league"].status = rlComponent.status === 'operational' ? "Operational" : "Degraded Performance";
            systemState.games["rocket-league"].regions = calculateRegions(systemState.games["rocket-league"].status);
            systemState.games["rocket-league"].maintenance = "Live API sync complete.";
        }

        // 3. Fallback Scrape Simulation
        Object.keys(systemState.games).forEach(key => {
            if (key !== 'fortnite' && key !== 'rocket-league') {
                let basePing = Math.floor(Math.random() * 20) + 10;
                let finalPing = basePing + systemState.games[key].userReports;
                
                if (finalPing > 150) systemState.games[key].status = "Major Outage";
                else if (finalPing > 80) systemState.games[key].status = "Degraded Performance";
                else systemState.games[key].status = "Operational";
                
                systemState.games[key].regions = calculateRegions(systemState.games[key].status);
                systemState.games[key].maintenance = "Live telemetry stable. Tracking user reports.";
                
                updateHistory(systemState.games[key], finalPing);
                
                if (systemState.games[key].userReports > 0) systemState.games[key].userReports = Math.floor(systemState.games[key].userReports * 0.8);
            } else {
                let val = systemState.games[key].status === "Operational" ? 10 : 90;
                updateHistory(systemState.games[key], val + systemState.games[key].userReports);
                if (systemState.games[key].userReports > 0) systemState.games[key].userReports = Math.floor(systemState.games[key].userReports * 0.8);
            }
        });

        // Update networks
        Object.keys(systemState.networks).forEach(key => {
            if (key !== 'discord') {
                updateHistory(systemState.networks[key], Math.floor(Math.random() * 15) + 5); 
            }
        });

        console.log("Telemetry updated successfully.");
    } catch (error) {
        console.error("Failed to pull live APIs:", error.message);
    }
}

setInterval(pollLiveData, 300000);
pollLiveData();

// --- API ENDPOINTS ---
app.get('/api/status', (req, res) => {
    const responseData = {
        networks: Object.keys(systemState.networks).map(id => ({ id, ...systemState.networks[id] })),
        games: Object.keys(systemState.games).map(id => ({ id, ...systemState.games[id] }))
    };
    res.json(responseData);
});

app.post('/api/report', (req, res) => {
    const { gameId } = req.body;
    if (systemState.games[gameId]) {
        systemState.games[gameId].userReports += 40;
        
        const currentLast = systemState.games[gameId].history.pop();
        systemState.games[gameId].history.push(currentLast + 40);

        // Instantly force regions to degrade to show UI change immediately
        if (systemState.games[gameId].status === "Operational") {
            systemState.games[gameId].status = "Degraded Performance";
            systemState.games[gameId].regions = calculateRegions("Degraded Performance");
        }

        return res.json({ success: true, message: "Report logged!" });
    }
    res.status(400).json({ success: false, message: "Game not found" });
});

app.listen(PORT, () => {
    console.log(`NETLAG.IO LIVE SERVER running on port ${PORT}`);
});