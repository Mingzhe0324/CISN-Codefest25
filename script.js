/**
 * XENBER SIMPLIFIED ENGINE
 * ------------------------
 * This script handles the Data, the AI Logic, and the Screen Updates.
 */

// --- PART 1: THE "STATE" (Our Database) ---
// We keep all data here so it's easy to manage.
const appState = {
    currentView: 'dashboard', // Which screen is showing?
    cloudProvider: 'Google BigQuery', // Or 'Azure Synapse'
    savings: 450000,
    alerts: [],
    
    // Chart Data
    history: [45, 50, 48, 55, 60],
    prediction: [60, 62, 65, 70, 68],
    
    // Employees (Workforce Intelligence)
    employees: [
        { name: "Sarah J.", role: "Engineer", fatigue: 20, score: 95 },
        { name: "Mike R.", role: "Logistics", fatigue: 85, score: 60 }, // Needs Rest
        { name: "Jessica T.", role: "Sales", fatigue: 40, score: 88 },
        { name: "David B.", role: "Manager", fatigue: 55, score: 75 }
    ],

    // Machines (Resource Scheduler)
    machines: [
        { name: "Server Cluster A", type: "IT", health: 98 },
        { name: "Assembly Line 1", type: "Factory", health: 45 }, // Needs Fix
        { name: "Delivery Truck 4", type: "Fleet", health: 80 }
    ]
};

// --- PART 2: CHART SETUP (Chart.js) ---
const ctx = document.getElementById('mainChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['10:00', '11:00', '12:00', '13:00', '14:00'],
        datasets: [
            { label: 'Actual Load', data: appState.history, borderColor: '#3b82f6', fill: true },
            { label: 'AI Prediction', data: appState.prediction, borderColor: '#8b5cf6', borderDash: [5, 5] }
        ]
    },
    options: { responsive: true, maintainAspectRatio: false }
});


// --- PART 3: THE FUNCTIONS (Actions) ---

// 1. NAVIGATION: Switching Screens
function switchView(viewName) {
    // Update state
    appState.currentView = viewName;
    
    // Hide all views
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-workforce').classList.add('hidden');
    document.getElementById('view-maintenance').classList.add('hidden');
    
    // Show selected view
    document.getElementById('view-' + viewName).classList.remove('hidden');
    
    // Update sidebar button colors
    ['dashboard', 'workforce', 'maintenance'].forEach(v => {
        document.getElementById('btn-' + v).classList.remove('nav-active');
    });
    document.getElementById('btn-' + viewName).classList.add('nav-active');
    
    // Update Header Title
    const titles = { 'dashboard': 'Dashboard', 'workforce': 'Workforce Hub', 'maintenance': 'Maintenance Scheduler' };
    document.getElementById('header-title').innerText = titles[viewName];
}

// 2. CLOUD: Switching between BigQuery and Azure
function toggleCloud() {
    if (appState.cloudProvider === 'Google BigQuery') {
        appState.cloudProvider = 'Azure Synapse';
        alert("Switched to Azure Synapse Analytics.");
    } else {
        appState.cloudProvider = 'Google BigQuery';
        alert("Switched to Google BigQuery.");
    }
    document.getElementById('cloud-name').innerText = appState.cloudProvider;
}

// 3. HR ACTION: Give an employee a break or training
function manageEmployee(index, action) {
    const emp = appState.employees[index];
    if (action === 'rest') {
        emp.fatigue = 0;
        emp.score += 10;
        alert(`Approved Rest for ${emp.name}. Fatigue is now 0%.`);
    } else if (action === 'train') {
        emp.score += 15;
        alert(`Sent ${emp.name} to training. Score improved!`);
    }
    updateScreen(); // Redraw screen to show changes
}

// 4. ASSET ACTION: Fix a broken machine
function fixMachine(index) {
    const machine = appState.machines[index];
    machine.health = 100;
    appState.savings += 5000; // Simulate money saved
    alert(`Maintenance Crew dispatched to ${machine.name}.`);
    updateScreen(); // Redraw screen
}

// 5. RESET: Restart the demo
function resetSimulation() {
    location.reload(); // Simple page reload
}


// --- PART 4: THE "BRAIN" (Simulation Loop) ---
// This runs every 2 seconds to make the dashboard look alive.

setInterval(() => {
    // 1. Generate random data for the chart
    let newLoad = Math.floor(Math.random() * 30) + 50; // Random number 50-80
    appState.history.push(newLoad);
    appState.history.shift(); // Keep array size same
    
    // 2. Degrade machine health slowly (Simulation)
    appState.machines.forEach(m => m.health -= 1);

    // 3. Redraw everything
    updateScreen();
    
}, 2000);


// --- PART 5: UPDATE SCREEN (Rendering) ---
function updateScreen() {
    
    // A. Update KPI Cards
    const currentLoad = appState.history[appState.history.length - 1];
    document.getElementById('kpi-load').innerText = currentLoad + "%";
    document.getElementById('kpi-savings').innerText = "$" + appState.savings.toLocaleString();
    
    // Count risks (Fatigue > 80 OR Health < 50)
    let risks = 0;
    appState.employees.forEach(e => { if(e.fatigue > 80) risks++; });
    appState.machines.forEach(m => { if(m.health < 50) risks++; });
    document.getElementById('kpi-alerts').innerText = risks;

    // B. Update Chart
    myChart.data.datasets[0].data = appState.history;
    myChart.update();

    // C. Update Tables (Workforce & Maintenance)
    renderWorkforceTables();
    renderMachineTables();
    
    // D. Strategic Advisor Logic
    if (risks > 0) {
        document.getElementById('advisor-feed').innerHTML = `
            <div class="bg-slate-800 p-2 rounded border border-red-500 text-xs">
                <b class="text-red-400">Risk Alert:</b> High fatigue or broken machines detected. Action required.
            </div>`;
    } else {
        document.getElementById('advisor-feed').innerHTML = `
            <div class="bg-slate-800 p-2 rounded border border-green-500 text-xs">
                <b class="text-green-400">Optimization:</b> Operations stable. Suggest increasing load by 10%.
            </div>`;
    }
}

// Helper: Draw Employee Tables
function renderWorkforceTables() {
    let fullHTML = "";
    let widgetHTML = "";

    appState.employees.forEach((emp, index) => {
        let actionBtn = `<span class="text-slate-400 text-xs">Optimal</span>`;
        let rowColor = "";

        // If tired, show "Rest" button
        if (emp.fatigue > 80) {
            actionBtn = `<button onclick="manageEmployee(${index}, 'rest')" class="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Give Rest</button>`;
            rowColor = "bg-red-50";
        }
        // If low score, show "Train" button
        else if (emp.score < 70) {
            actionBtn = `<button onclick="manageEmployee(${index}, 'train')" class="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold">Train</button>`;
        }

        // Full Table Row
        fullHTML += `
        <tr class="border-b ${rowColor}">
            <td class="p-4 font-bold">${emp.name}</td>
            <td class="p-4 text-sm">${emp.role}</td>
            <td class="p-4">${emp.fatigue}%</td>
            <td class="p-4">${emp.score}/100</td>
            <td class="p-4 text-right">${actionBtn}</td>
        </tr>`;

        // Widget Row (Smaller)
        widgetHTML += `
        <tr class="border-b">
            <td class="p-2 font-bold text-xs">${emp.name}</td>
            <td class="p-2 text-right">${actionBtn}</td>
        </tr>`;
    });

    document.getElementById('full-workforce-table').innerHTML = fullHTML;
    document.getElementById('dash-workforce-table').innerHTML = widgetHTML;
}

// Helper: Draw Machine Tables
function renderMachineTables() {
    let fullHTML = "";
    let widgetHTML = "";

    appState.machines.forEach((mach, index) => {
        let actionBtn = `<span class="text-slate-400 text-xs">OK</span>`;
        let rowColor = "";

        if (mach.health < 50) {
            actionBtn = `<button onclick="fixMachine(${index})" class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Fix Now</button>`;
            rowColor = "bg-red-50";
        }

        fullHTML += `
        <tr class="border-b ${rowColor}">
            <td class="p-4 font-bold">${mach.name}</td>
            <td class="p-4 text-sm">${mach.type}</td>
            <td class="p-4">${mach.health}%</td>
            <td class="p-4 text-right">${actionBtn}</td>
        </tr>`;

        widgetHTML += `
        <tr class="border-b">
            <td class="p-2 font-bold text-xs">${mach.name}</td>
            <td class="p-2 text-right">${actionBtn}</td>
        </tr>`;
    });

    document.getElementById('full-resource-table').innerHTML = fullHTML;
    document.getElementById('dash-resource-table').innerHTML = widgetHTML;
}

// Run once on load
updateScreen();