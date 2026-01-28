// === MASTER TOOL DATABASE ===
const brandData = {
    // 🏆 2026 NEWEST WINNERS
    'cse-chocolate': { name: 'Clean Simple Eats (Chocolate)', rank: '1 (2026)', safety: 'safe', lead: '0.21 µg', leadValue: 0.21, safeLimit: '✅ 2.3 servings daily', type: 'Whey', price: '$1.33/serving', article: '/blog/consumer-reports-new-protein-powder-tests-january-2026.html', description: 'New 2026 Safest Chocolate Winner.' },
    'equate-whey': { name: 'Equate Rich Chocolate', rank: '2 (2026)', safety: 'safe', lead: '0.27 µg', leadValue: 0.27, safeLimit: '✅ 1.8 servings daily', type: 'Whey', price: '$0.60/serving', article: '/blog/consumer-reports-new-protein-powder-tests-january-2026.html', description: 'New 2026 Budget Champion.' },
    'premier-powder': { name: 'Premier Protein Powder', rank: '3 (2026)', safety: 'safe', lead: '0.38 µg', leadValue: 0.38, safeLimit: '✅ 1.3 servings daily', type: 'Whey Isolate', price: '$0.94/serving', article: '/blog/premier-protein-lead-testing.html', description: 'Verified safe chocolate powder.' },
    // 🏅 2025 LEGACY WINNERS
    'muscletech-mass': { name: 'MuscleTech 100% Mass Gainer', rank: '1 (2025)', safety: 'safe', lead: 'Not Detected', leadValue: 0, safeLimit: '✅ No limit', type: 'Mass Gainer', price: '$1.20/serving', article: '/blog/muscletech-mass-gainer-safety.html', description: 'Safest possible gainer.' },
    'dymatize-iso': { name: 'Dymatize ISO-100', rank: '2 (2025)', safety: 'safe', lead: 'Below Detection', leadValue: 0.1, safeLimit: '✅ 4-5 servings daily', type: 'Whey Isolate', price: '$1.33/serving', article: '/blog/dymatize-iso-100-safety-analysis.html', description: 'Dual-verified isolate.' },
    'optimum-gold': { name: 'Optimum Nutrition Gold Standard', rank: '5 (2025)', safety: 'safe', lead: 'Below Detection', leadValue: 0.15, safeLimit: '✅ 3-4 servings daily', type: 'Whey Concentrate', price: '$0.75/serving', article: '/blog/optimum-nutrition-gold-standard-whey-lead-testing-results-2025.html', description: 'Best performance-to-value.' },
    // 🏅 CLEAN LABEL PROJECT ONLY
    'body-fortress': { name: 'Body Fortress Whey', rank: 'CLP Certified', safety: 'safe', lead: 'Non-Detect', leadValue: 0, safeLimit: '✅ No limit', type: 'Whey Concentrate', price: '$0.67/serving', article: '/blog/body-fortress-protein-powder-lead-testing-budget-clean-2025.html', description: 'Budget CLP champion.' },
    // 🚫 THE FAILURES
    'naked-vegan': { name: 'Naked Vegan Mass Gainer', rank: '23 (Worst)', safety: 'danger', lead: '7.86 µg', leadValue: 7.86, safeLimit: '🚫 DO NOT USE', type: 'Plant Mass Gainer', price: '$1.67/serving', article: '/blog/naked-nutrition-vegan-mass-gainer-lead.html', description: 'Highest lead recorded.' },
    'huel-black': { name: 'Huel Black Edition', rank: '22', safety: 'danger', lead: '6.44 µg', leadValue: 6.44, safeLimit: '🚫 DO NOT USE', type: 'Meal Replacement', price: '$2.14/serving', article: '/blog/huel-black-edition-lead-content.html', description: 'Extreme lead warning.' }
};

const safeAlternatives = {
    'Whey': [{ name: 'Equate', price: '$0.60', rank: '2 (2026)', link: 'https://amzn.to/4pt4q13' }],
    'Whey Isolate': [{ name: 'Dymatize ISO-100', price: '$1.33', rank: 2, link: 'https://amzn.to/4hCiR0q' }],
    'Mass Gainer': [{ name: 'MuscleTech 100% Mass Gainer', price: '$1.20', rank: 1, link: 'https://amzn.to/3IZsKsr' }],
    'Plant Mass Gainer': [{ name: 'MuscleTech 100% Mass Gainer', price: '$1.20', rank: 1, link: 'https://amzn.to/3IZsKsr' }],
    'Meal Replacement': [{ name: 'MuscleTech 100% Mass Gainer', price: '$1.20', rank: 1, link: 'https://amzn.to/3IZsKsr' }]
};

// === TOOL ENGINE: RUNS ON PAGE LOAD ===
document.addEventListener('DOMContentLoaded', function() {
    // Lead Exposure Tool Listener
    const exposureForm = document.getElementById('exposure-form');
    if (exposureForm) {
        exposureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateExposure();
        });
    }

    // Cost Comparison Tool Listener
    const costBtn = document.getElementById('run-cost-calc');
    if (costBtn) {
        costBtn.addEventListener('click', runCostComparison);
    }
});

// === LOGIC: LEAD EXPOSURE CALCULATOR ===
function calculateExposure() {
    const brandKey = document.getElementById('exposure-brand').value;
    const servingsPerDay = parseFloat(document.getElementById('servings-day').value);
    const durationValue = parseInt(document.getElementById('duration-value').value);
    const durationUnit = document.getElementById('duration-unit').value;
    const resultsDiv = document.getElementById('exposure-results');

    const brand = brandData[brandKey];
    let totalDays = (durationUnit === 'days') ? durationValue : (durationUnit === 'weeks') ? durationValue * 7 : (durationUnit === 'months') ? durationValue * 30 : durationValue * 365;

    const totalServings = servingsPerDay * totalDays;
    const totalLeadUg = brand.leadValue * totalServings;
    const safeDailyLimit = 0.5;
    const totalSafeLimit = safeDailyLimit * totalDays;
    const percentOverLimit = ((totalLeadUg / totalSafeLimit) * 100).toFixed(0);

    let riskColor = (brand.safety === 'safe') ? '#4caf50' : (brand.safety === 'caution') ? '#ff9800' : '#f44336';
    
    resultsDiv.innerHTML = `
        <div style="border: 3px solid ${riskColor}; padding: 25px; border-radius: 12px; background: #fff;">
            <h3 style="text-align: center;">Total Lead Consumed: <span style="color:${riskColor}">${totalLeadUg.toFixed(1)} µg</span></h3>
            <p style="text-align: center;">You have consumed <strong>${percentOverLimit}%</strong> of your safe cumulative lead limit.</p>
            <div style="background: #f8f9fa; padding: 15px; margin-top: 15px; border-radius: 8px;">
                <p><strong>Recommendation:</strong> ${brand.safety === 'danger' ? 'Stop using immediately. Lead accumulates in bone and organ tissue.' : 'Consider switching to a 2026 verified safe brand.'}</p>
                <a href="${brand.article}" style="color: #667eea; font-weight: 700;">Read Full Analysis →</a>
            </div>
        </div>
    `;
    resultsDiv.style.display = 'block';
}

// === LOGIC: COST COMPARISON ===
function runCostComparison() {
    const rtdPrice = parseFloat(document.getElementById('current-rtd-price').value);
    const count = parseInt(document.getElementById('shakes-count').value);
    const annualSavings = (rtdPrice - 0.60) * count * 365;
    
    document.getElementById('annual-savings-display').innerText = '$' + Math.floor(annualSavings).toLocaleString();
    document.getElementById('cost-results').style.display = 'block';
}