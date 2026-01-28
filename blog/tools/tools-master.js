// === MASTER TOOL DATABASE (Corrected 2026 Data) ===
const brandData = {
    'cse-chocolate': { name: 'Clean Simple Eats (Chocolate)', safety: 'safe', leadValue: 0.21, rank: '1 (2026)', article: '/blog/consumer-reports-new-protein-powder-tests-january-2026.html', type: 'Whey', price: 1.33 },
    'equate-whey': { name: 'Equate Rich Chocolate', safety: 'safe', leadValue: 0.27, rank: '2 (2026)', article: '/blog/consumer-reports-new-protein-powder-tests-january-2026.html', type: 'Whey', price: 0.60 },
    'premier-powder': { name: 'Premier Protein Powder', safety: 'safe', leadValue: 0.38, rank: '3 (2026)', article: '/blog/premier-protein-lead-testing.html', type: 'Whey Isolate', price: 0.94 },
    'muscletech-mass': { name: 'MuscleTech 100% Mass Gainer', safety: 'safe', leadValue: 0, rank: '1 (2025)', article: '/blog/muscletech-mass-gainer-safety.html', type: 'Mass Gainer', price: 1.20 },
    'dymatize-iso': { name: 'Dymatize ISO-100', safety: 'safe', leadValue: 0.1, rank: '2 (2025)', article: '/blog/dymatize-iso-100-safety-analysis.html', type: 'Whey Isolate', price: 1.33 },
    'optimum-gold': { name: 'Optimum Nutrition Gold Standard', safety: 'safe', leadValue: 0.15, rank: '5 (2025)', article: '/blog/optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html', type: 'Whey Concentrate', price: 0.75 },
    'naked-vegan': { name: 'Naked Vegan Mass Gainer', safety: 'danger', leadValue: 7.86, rank: '23', article: '/blog/naked-nutrition-vegan-mass-gainer-lead.html', type: 'Plant Mass Gainer', price: 1.67 },
    'huel-black': { name: 'Huel Black Edition', safety: 'danger', leadValue: 6.44, rank: '22', article: '/blog/huel-black-edition-lead-content.html', type: 'Meal Replacement', price: 2.14 }
};

// === TOOL ENGINE: RUNS ON PAGE LOAD ===
document.addEventListener('DOMContentLoaded', function() {
    // 1. Protein Needs Calculator Listener
    const proteinForm = document.getElementById('protein-form');
    if (proteinForm) {
        proteinForm.addEventListener('submit', (e) => { e.preventDefault(); calculateProtein(); });
    }

    // 2. Lead Exposure Tool Listener
    const exposureForm = document.getElementById('exposure-form');
    if (exposureForm) {
        exposureForm.addEventListener('submit', (e) => { e.preventDefault(); calculateExposure(); });
    }

    // 3. Cost Comparison Tool Listener
    const costBtn = document.getElementById('run-cost-calc');
    if (costBtn) {
        costBtn.addEventListener('click', runCostComparison);
    }
});

// === LOGIC: PROTEIN CALCULATOR ===
function calculateProtein() {
    const weight = parseFloat(document.getElementById('weight').value);
    const unit = document.getElementById('weight-unit').value;
    const goal = document.getElementById('goal').value;
    const resultsDiv = document.getElementById('protein-results');

    const weightKg = (unit === 'lbs') ? weight / 2.205 : weight;
    let multiplier = (goal === 'lose') ? 2.0 : (goal === 'maintain') ? 1.6 : 2.2;
    
    const target = Math.round(weightKg * multiplier);
    
    resultsDiv.innerHTML = `
        <div style="background: #f0fdf4; border: 2px solid #2ecc71; padding: 25px; border-radius: 12px; text-align: center;">
            <h3 style="margin: 0; color: #1b5e20;">Your Daily Target: ${target}g Protein</h3>
            <p style="margin: 10px 0 0; color: #444;">To hit this goal safely, we recommend <strong>Equate ($0.60)</strong> or <strong>ON Gold Standard ($0.75)</strong>.</p>
        </div>
    `;
    resultsDiv.style.display = 'block';
}

// === LOGIC: LEAD EXPOSURE CALCULATOR ===
function calculateExposure() {
    const brandKey = document.getElementById('exposure-brand').value;
    const servings = parseFloat(document.getElementById('servings-day').value);
    const months = parseInt(document.getElementById('duration-value').value);
    const resultsDiv = document.getElementById('exposure-results');

    const brand = brandData[brandKey];
    const totalLead = (brand.leadValue * servings * (months * 30)).toFixed(1);
    const safeLimit = (0.5 * (months * 30));
    const percent = ((totalLead / safeLimit) * 100).toFixed(0);

    let color = (brand.safety === 'safe') ? '#2ecc71' : '#e74c3c';
    
    resultsDiv.innerHTML = `
        <div style="border: 3px solid ${color}; padding: 25px; border-radius: 12px; background: #fff;">
            <h3 style="text-align: center;">Total Lead: <span style="color:${color}">${totalLead} µg</span></h3>
            <p style="text-align: center;">This is <strong>${percent}%</strong> of your safe limit over ${months} months.</p>
            <a href="${brand.article}" style="display: block; text-align: center; margin-top: 15px; font-weight: 700;">Read Full Brand Analysis →</a>
        </div>
    `;
    resultsDiv.style.display = 'block';
}

// === LOGIC: RTD COST COMPARISON ===
function runCostComparison() {
    const rtdPrice = parseFloat(document.getElementById('current-rtd-price').value);
    const count = parseInt(document.getElementById('shakes-count').value);
    const annualSavings = Math.floor((rtdPrice - 0.60) * count * 365);
    
    document.getElementById('annual-savings-display').innerText = '$' + annualSavings.toLocaleString();
    document.getElementById('cost-results').style.display = 'block';
}