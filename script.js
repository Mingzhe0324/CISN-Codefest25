// --- PART 1: THE DATASET (Kaggle Style) ---
// We call this 'employees' now so the rest of the code is happy.
const employees = [
    { name: "Alice Chen", role: "Dev", completionRate: 92, onTimeRate: 88, budgetRate: 95 },
    { name: "Bob Smith", role: "Mgr", completionRate: 75, onTimeRate: 60, budgetRate: 70 },
    { name: "Charlie Kim", role: "Analyst", completionRate: 98, onTimeRate: 95, budgetRate: 99 },
    { name: "Diana Prince", role: "Dev", completionRate: 85, onTimeRate: 80, budgetRate: 82 },
    { name: "Ethan Hunt", role: "Designer", completionRate: 60, onTimeRate: 50, budgetRate: 85 },
    { name: "Fiona Gallagher", role: "Dev", completionRate: 89, onTimeRate: 92, budgetRate: 88 }
];

// Graph Data (Sales)
const salesData = [12000, 15000, 11000, 20000, 23000, 25000]; 
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul (Forecast)'];

// --- PART 2: THE AI LOGIC ---

// HELPER: Calculate Average Score for a worker
function getScore(worker) {
    return Math.round((worker.completionRate + worker.onTimeRate + worker.budgetRate) / 3);
}

// A. Forecast Logic (Graph)
function calculateForecast(data) {
    let lastValue = data[data.length - 1]; 
    return Math.round(lastValue * 1.10); // 10% Growth
}

// B. Work Allocation Logic 
// NEW LOGIC: Sort and Rank
function getTopEmployees() {
    // 1. Create a clean copy of the array so we don't mess up the original order
    // [...employees] is the "Spread Operator" - it clones the array.
    let sortedList = [...employees];

    // 2. The Sort Function (The Magic)
    // We sort by 'onTimeRate' from Highest (b) to Lowest (a)
    sortedList.sort((a, b) => b.onTimeRate - a.onTimeRate);

    // 3. Return only the Top 3 (Index 0, 1, and 2)
    return sortedList.slice(0, 3);
}

// C. Risk Logic 
// (Find anyone with an Average Score below 70)
function findRisks() {
    let riskHTML = "";
    for(let i = 0; i < employees.length; i++) {
        let avgScore = getScore(employees[i]);
        
        if (avgScore < 70) {
            riskHTML += `<div class="alert">⚠️ RISK ALERT: ${employees[i].name} is underperforming (Avg: ${avgScore}%)</div>`;
        }
    }
    return riskHTML;
}

// D. KPI Forecast (The Table Logic)
function calculateKPIForecast(worker) {
    let current = getScore(worker);
    // AI Prediction: If they are good (>80), they get better. If bad, they get worse.
    let prediction = current > 80 ? current * 1.05 : current * 0.98;
    return Math.round(Math.min(prediction, 100)); // Cap at 100%
}

// --- PART 3: UPDATE THE SCREEN ---

// 1. Draw the Chart
const ctx = document.getElementById('revenueChart');
if (ctx) {
    let predictedValue = calculateForecast(salesData);
    new Chart(ctx, {
        type: 'line', 
        data: {
            labels: months,
            datasets: [{
                label: 'Enterprise Revenue ($)',
                data: [...salesData, predictedValue],
                borderWidth: 3,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4, 
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 2. Update Allocation Text
// We check if the element exists first to avoid errors
// --- UPDATED DISPLAY LOGIC ---

const allocBox = document.getElementById('recommendation-box');
if (allocBox) {
    // 1. Get the Top 3 List
    let top3 = getTopEmployees();

    // 2. Create the HTML for a rank list
    // We use a simple loop to build a string
    let rankHTML = `<div style="font-size: 0.9em; text-align: left;">`;
    
    rankHTML += `<p>🥇 <b>#1 ${top3[0].name}</b> (${top3[0].onTimeRate}%) - Recommended</p>`;
    rankHTML += `<p>🥈 #2 ${top3[1].name} (${top3[1].onTimeRate}%)</p>`;
    rankHTML += `<p>🥉 #3 ${top3[2].name} (${top3[2].onTimeRate}%)</p>`;
    
    rankHTML += `</div>`;

    // 3. Put it on the screen
    allocBox.innerHTML = rankHTML;
}

// 3. Update Risk List
const riskList = document.getElementById('risk-list');
if (riskList) {
    riskList.innerHTML = findRisks();
}

// 4. Update the Table (The new Kaggle Feature)
const tableBody = document.getElementById('employee-table-body');
if (tableBody) {
    employees.forEach(worker => {
        let currentAvg = getScore(worker);
        let forecast = calculateKPIForecast(worker);
        let statusColor = forecast >= 90 ? "green" : (forecast < 70 ? "red" : "orange");
        let statusText = forecast >= 90 ? "🔥 High Perf" : (forecast < 70 ? "⚠️ At Risk" : "⚖️ Stable");

        let rowHTML = `
            <tr style="border-bottom: 1px solid #eee; height: 40px;">
                <td>${worker.name}</td>
                <td>${worker.role}</td>
                <td>${currentAvg}%</td>
                <td style="font-weight:bold; color:${statusColor}">${forecast}%</td>
                <td>${statusText}</td>
            </tr>
        `;
        tableBody.innerHTML += rowHTML;
    });
}