/**
 * XENBER DASHBOARD LOGIC (Time-Aware Version)
 * ===========================================
 * Chapter 1: The Database (State & Time)
 * Chapter 2: The Setup (Charts & Display)
 * Chapter 3: User Actions
 * Chapter 4: The AI Logic (Simulation & Chatbot)
 */

// ==========================================
// CHAPTER 1: THE DATABASE (STATE)
// ==========================================
const database = {
    currentCloud: 'Google BigQuery',
    companySavings: 450000,
    
    // Graph Data
    // We maintain a "window" of 5 hours/minutes
    timeLabels: ['09:00', '10:00', '11:00', '12:00', '13:00'], 
    loadHistory: [45, 50, 48, 55, 60],
    
    // Internal tracker for the next simulated hour
    nextSimulatedHour: 14, 
    
    // Our Staff List
    employees: [
        { name: "Sarah J.", role: "Engineer", fatigue: 20, score: 95 },
        { name: "Mike R.", role: "Logistics", fatigue: 85, score: 60 },
        { name: "Jessica T.", role: "Sales", fatigue: 40, score: 88 },
        { name: "David B.", role: "Manager", fatigue: 55, score: 75 }
    ],

    // Our Machines List
    machines: [
        { name: "Server Cluster A", type: "IT", health: 98 },
        { name: "Assembly Line 1", type: "Factory", health: 45 },
        { name: "Delivery Truck 4", type: "Fleet", health: 80 }
    ]
};

// ==========================================
// CHAPTER 2: THE SETUP (CHARTS & DISPLAY)
// ==========================================

// A. Setup the Chart
const chartContext = document.getElementById('mainChart').getContext('2d');
const dashboardChart = new Chart(chartContext, {
    type: 'line',
    data: {
        labels: database.timeLabels, // Using our variable labels
        datasets: [
            { 
                label: 'Actual Load', 
                data: database.loadHistory, 
                borderColor: '#3b82f6', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                fill: true,
                tension: 0.4 // Makes line slightly curvy
            }
        ]
    },
    options: { 
        responsive: true, 
        maintainAspectRatio: false,
        animation: { duration: 500 } // Smooth sliding animation
    }
});

// B. The Main Function to Draw the Screen
function updateScreen() {
    // 1. Update the Big Numbers (KPIs)
    const currentLoad = database.loadHistory[database.loadHistory.length - 1];
    document.getElementById('display-load').innerText = currentLoad + "%";
    document.getElementById('display-savings').innerText = "$" + database.companySavings.toLocaleString();
    
    // 2. Count Risks
    let riskCount = 0;
    database.employees.forEach(employee => { if(employee.fatigue > 80) riskCount++; });
    database.machines.forEach(machine => { if(machine.health < 50) riskCount++; });
    document.getElementById('display-alerts').innerText = riskCount;

    // 3. Update the Chart (Push new data and labels)
    dashboardChart.data.labels = database.timeLabels; 
    dashboardChart.data.datasets[0].data = database.loadHistory;
    dashboardChart.update();

    // 4. Update Tables & Insights
    drawEmployeeTable();
    drawMachineTable();
    
    const advisorBox = document.getElementById('advisor-feed');
    if (riskCount > 0) {
        advisorBox.innerHTML = `
            <div class="bg-slate-800 p-2 rounded border border-red-500 text-xs">
                <b class="text-red-400">Warning:</b> You have ${riskCount} active risks (Staff Fatigue or Broken Machines).
            </div>`;
    } else {
        advisorBox.innerHTML = `
            <div class="bg-slate-800 p-2 rounded border border-green-500 text-xs">
                <b class="text-green-400">All Good:</b> Systems are running smoothly. Efficiency is high.
            </div>`;
    }
}

// Helper: Draw Employee HTML
function drawEmployeeTable() {
    let fullHTML = "";
    let miniHTML = "";
    database.employees.forEach((employee, index) => {
        let actionBtn = `<span class="text-slate-400 text-xs">Good</span>`;
        let rowClass = "";
        if (employee.fatigue > 80) {
            actionBtn = `<button onclick="actionRest(${index})" class="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Give Rest</button>`;
            rowClass = "bg-red-50";
        } else if (employee.score < 70) {
            actionBtn = `<button onclick="actionTrain(${index})" class="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold">Train</button>`;
        }
        fullHTML += `<tr class="border-b ${rowClass}"><td class="p-4 font-bold">${employee.name}</td><td class="p-4 text-sm">${employee.role}</td><td class="p-4">${employee.fatigue}%</td><td class="p-4">${employee.score}/100</td><td class="p-4 text-right">${actionBtn}</td></tr>`;
        miniHTML += `<tr class="border-b"><td class="p-2 font-bold text-xs">${employee.name}</td><td class="p-2 text-right">${actionBtn}</td></tr>`;
    });
    document.getElementById('full-table-workforce').innerHTML = fullHTML;
    document.getElementById('mini-table-workforce').innerHTML = miniHTML;
}

// Helper: Draw Machine HTML
function drawMachineTable() {
    let fullHTML = "";
    let miniHTML = "";
    database.machines.forEach((machine, index) => {
        let actionBtn = `<span class="text-slate-400 text-xs">Running</span>`;
        let rowClass = "";
        if (machine.health < 50) {
            actionBtn = `<button onclick="actionFix(${index})" class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Fix Now</button>`;
            rowClass = "bg-red-50";
        }
        fullHTML += `<tr class="border-b ${rowClass}"><td class="p-4 font-bold">${machine.name}</td><td class="p-4 text-sm">${machine.type}</td><td class="p-4">${machine.health}%</td><td class="p-4 text-right">${actionBtn}</td></tr>`;
        miniHTML += `<tr class="border-b"><td class="p-2 font-bold text-xs">${machine.name}</td><td class="p-2 text-right">${actionBtn}</td></tr>`;
    });
    document.getElementById('full-table-machines').innerHTML = fullHTML;
    document.getElementById('mini-table-machines').innerHTML = miniHTML;
}

// ==========================================
// CHAPTER 3: USER ACTIONS
// ==========================================
function showPage(pageName) {
    document.getElementById('page-dashboard').classList.add('hidden');
    document.getElementById('page-workforce').classList.add('hidden');
    document.getElementById('page-maintenance').classList.add('hidden');
    document.getElementById('page-' + pageName).classList.remove('hidden');

    const titles = { 'dashboard': 'Dashboard', 'workforce': 'Workforce Hub', 'maintenance': 'Maintenance Scheduler' };
    document.getElementById('page-title').innerText = titles[pageName];
}

function toggleCloudSource() {
    database.currentCloud = (database.currentCloud === 'Google BigQuery') ? 'Azure Synapse' : 'Google BigQuery';
    alert("Switched to " + database.currentCloud);
    document.getElementById('cloud-name').innerText = database.currentCloud;
}

function actionRest(index) {
    database.employees[index].fatigue = 0;
    database.employees[index].score += 5;
    alert(`Approved Rest for ${database.employees[index].name}.`);
    updateScreen();
}

function actionTrain(index) {
    database.employees[index].score += 10;
    alert(`Sent ${database.employees[index].name} to training.`);
    updateScreen();
}

function actionFix(index) {
    database.machines[index].health = 100;
    database.companySavings += 5000;
    alert(`Fixed ${database.machines[index].name}.`);
    updateScreen();
}

function resetSystem() { location.reload(); }


// ==========================================
// CHAPTER 4: AI LOGIC (SIMULATION & CHAT)
// ==========================================

// A. Real-Time Clock Function (Runs every 1 second)
setInterval(() => {
    const now = new Date();
    // Format time as HH:MM:SS
    const timeString = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('live-clock').innerText = timeString;
}, 1000);


// B. Simulation Heartbeat (Runs every 2 seconds)
// This simulates "hours passing" on the chart
setInterval(() => {
    
    // 1. Generate new Data
    let newLoad = Math.floor(Math.random() * 30) + 50; 
    
    // 2. Generate new Time Label (Next Hour)
    let nextTime = database.nextSimulatedHour + ":00";
    database.nextSimulatedHour++;
    if (database.nextSimulatedHour > 23) database.nextSimulatedHour = 0; // Reset to 00:00 after 23:00

    // 3. Shift Arrays (Remove first item, Add new item to end)
    database.loadHistory.push(newLoad);
    database.loadHistory.shift(); 
    
    database.timeLabels.push(nextTime);
    database.timeLabels.shift();

    // 4. Degrade machines
    database.machines.forEach(machine => machine.health -= 1);

    // 5. Refresh Screen
    updateScreen();
}, 2000);


// C. The Chatbot Logic
let isChatVisible = false;

function toggleChatVisibility() {
    isChatVisible = !isChatVisible;
    const windowEl = document.getElementById('chat-window');
    if (isChatVisible) {
        windowEl.classList.remove('chat-hidden');
        windowEl.classList.add('chat-visible');
    } else {
        windowEl.classList.remove('chat-visible');
        windowEl.classList.add('chat-hidden');
    }
}

function checkEnterKey(event) { if (event.key === 'Enter') handleUserMessage(); }

function handleUserMessage() {
    const inputField = document.getElementById('chat-input');
    const userText = inputField.value.trim();
    if (!userText) return;

    displayMessage(userText, 'user');
    inputField.value = '';

    setTimeout(() => {
        const aiReply = generateAnswer(userText.toLowerCase());
        displayMessage(aiReply, 'ai');
    }, 600);
}

function displayMessage(text, sender) {
    const chatContainer = document.getElementById('chat-messages');
    const messageWrapper = document.createElement('div');
    if (sender === 'user') {
        messageWrapper.className = "flex justify-end";
        messageWrapper.innerHTML = `<div class="bg-blue-600 text-white p-2 rounded-lg rounded-tr-none max-w-[85%]">${text}</div>`;
    } else {
        messageWrapper.className = "flex justify-start";
        messageWrapper.innerHTML = `<div class="bg-slate-200 text-slate-800 p-2 rounded-lg rounded-tl-none max-w-[85%]">${text}</div>`;
    }
    chatContainer.appendChild(messageWrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateAnswer(question) {
    if (question.includes('staff') || question.includes('employee') || question.includes('team')) {
        const tiredPerson = database.employees.find(e => e.fatigue > 80);
        if (tiredPerson) return `Warning: ${tiredPerson.name} is very tired (${tiredPerson.fatigue}% fatigue). Please give them a break.`;
        return "Your team is doing great. No high fatigue detected.";
    }
    if (question.includes('money') || question.includes('savings') || question.includes('profit')) {
        return `We have saved $${database.companySavings.toLocaleString()} so far.`;
    }
    if (question.includes('machine') || question.includes('broken') || question.includes('status')) {
        const brokenMachine = database.machines.find(m => m.health < 50);
        if (brokenMachine) return `Alert: ${brokenMachine.name} is in bad health (${brokenMachine.health}%). Fix it in Maintenance.`;
        return "All machines are running normally.";
    }
    return "I can answer questions about: Staff Fatigue, Machine Status, or Savings.";
}

// Start
updateScreen();