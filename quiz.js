// Store user answers
const quizData = {
    frequency: '',
    currentBrand: '',
    currentBrandName: '',
    otherBrand: '',
    concern: '',
    proteinSource: '',
    primaryUse: '',
    concernLevel: '',
    budget: 'mid-range'
};

// Complete Product Database (from Consumer Reports testing)
const proteinProducts = [
    // SAFE - Rank 1-7
    {
        rank: 1,
        brand: "MuscleTech",
        fullName: "MuscleTech 100% Mass Gainer",
        leadLevel: "Not detected",
        maxServings: "No limit",
        guidance: "Better for daily consumption",
        type: "Whey-based mass gainer",
        bestFor: "Bulking, mass gaining, hardgainers",
        amazonLink: "https://amzn.to/4qofhen",
        articleLink: "blog/muscletech-mass-gainer-safety.html"
    },
    {
        rank: 2,
        brand: "Dymatize",
        fullName: "Dymatize Super Mass Gainer",
        leadLevel: "Below detection limits",
        maxServings: "4 per day",
        guidance: "Better for daily consumption",
        type: "Whey-based mass gainer",
        bestFor: "Mass gaining, bulking",
        amazonLink: "https://amzn.to/42Rl6XJ",
        articleLink: null
    },
    {
        rank: 3,
        brand: "Momentous",
        fullName: "Momentous Whey Protein Isolate",
        leadLevel: "Below detection limits",
        maxServings: "3⅓ per day",
        guidance: "Better for daily consumption",
        type: "Whey isolate",
        bestFor: "Athletes, NSF certified",
        amazonLink: "https://amzn.to/42TEu6v",
        articleLink: "blog/momentous-protein-safety-analysis.html"
    },
    {
        rank: 4,
        brand: "BSN",
        fullName: "BSN Syntha-6 Protein Powder",
        leadLevel: "Below detection limits",
        maxServings: "2 per day",
        guidance: "Better for daily consumption",
        type: "Multi-source whey blend",
        bestFor: "Taste, post-workout recovery",
        amazonLink: "https://amzn.to/47mhUou",
        articleLink: "blog/bsn-syntha-6-safety-analysis.html"
    },
    {
        rank: 5,
        brand: "Optimum Nutrition",
        fullName: "Optimum Nutrition Gold Standard 100% Whey",
        leadLevel: "Below detection limits",
        maxServings: "1¾ per day",
        guidance: "Better for daily consumption",
        type: "Whey blend",
        bestFor: "Best value, most popular",
        amazonLink: "https://amzn.to/3Wl9Dfj",
        articleLink: null
    },
    {
        rank: 6,
        brand: "Transparent Labs",
        fullName: "Transparent Labs Mass Gainer",
        leadLevel: "Below detection limits",
        maxServings: "1 per day",
        guidance: "Better for daily consumption",
        type: "Whey-based mass gainer",
        bestFor: "Clean bulking, transparency",
        amazonLink: "https://amzn.to/3Jr7rzZ",
        articleLink: null
    },
    {
        rank: 7,
        brand: "OWYN",
        fullName: "OWYN Pro Elite High Protein Shake",
        leadLevel: "Below detection limits",
        maxServings: "1 per day",
        guidance: "Better for daily consumption",
        type: "Plant-based (pea protein)",
        bestFor: "Vegans, only safe plant option",
        amazonLink: "https://amzn.to/42Wp9SC",
        articleLink: null
    },
    // MODERATE - Rank 8-19
    {
        rank: 12,
        brand: "Orgain",
        fullName: "Orgain Organic Plant-Based Protein",
        leadLevel: "143% over limit",
        maxServings: "4¾ per week",
        guidance: "Okay occasionally",
        type: "Plant-based",
        bestFor: "Occasional use only",
        amazonLink: null,
        articleLink: null
    },
    {
        rank: 16,
        brand: "Vega",
        fullName: "Vega Premium Sport Plant-Based Protein",
        leadLevel: "185% over limit",
        maxServings: "3¾ per week",
        guidance: "Okay occasionally",
        type: "Plant-based",
        bestFor: "Occasional use only",
        amazonLink: null,
        articleLink: null
    },
    {
        rank: 9,
        brand: "Muscle Milk",
        fullName: "Muscle Milk Pro Advanced Nutrition",
        leadLevel: "128% over limit",
        maxServings: "5½ per week",
        guidance: "Okay occasionally",
        type: "RTD shake",
        bestFor: "Occasional use only",
        amazonLink: null,
        articleLink: null
    },
    {
        rank: 10,
        brand: "Ensure",
        fullName: "Ensure Plant-Based Protein Shake",
        leadLevel: "132% over limit",
        maxServings: "5⅓ per week",
        guidance: "Okay occasionally",
        type: "Plant-based RTD",
        bestFor: "Occasional use only",
        amazonLink: null,
        articleLink: null
    },
    // HIGH RISK - Rank 20-21
    {
        rank: 20,
        brand: "Momentous Plant",
        fullName: "Momentous 100% Plant Protein",
        leadLevel: "476% over limit",
        maxServings: "1½ per week",
        guidance: "Limit to once per week",
        type: "Plant-based",
        bestFor: "Not recommended",
        amazonLink: null,
        articleLink: null
    },
    {
        rank: 21,
        brand: "Garden of Life",
        fullName: "Garden of Life Sport Organic Plant-Based",
        leadLevel: "564% over limit",
        maxServings: "1¼ per week",
        guidance: "Limit to once per week",
        type: "Plant-based",
        bestFor: "Not recommended",
        amazonLink: null,
        articleLink: null
    },
    // WORST - Rank 22-23
    {
        rank: 22,
        brand: "Huel",
        fullName: "Huel Black Edition",
        leadLevel: "1,288% over limit (6.44 µg)",
        maxServings: "0 per week",
        guidance: "AVOID",
        type: "Plant-based meal replacement",
        bestFor: "Do not use",
        amazonLink: null,
        articleLink: "blog/huel-black-edition-lead-content.html"
    },
    {
        rank: 23,
        brand: "Naked Nutrition",
        fullName: "Naked Nutrition Vegan Mass Gainer",
        leadLevel: "1,572% over limit (7.86 µg)",
        maxServings: "0 per week",
        guidance: "AVOID",
        type: "Plant-based mass gainer",
        bestFor: "Do not use",
        amazonLink: null,
        articleLink: "blog/naked-nutrition-vegan-mass-gainer-lead.html"
    }
];

let currentQuestion = 1;
const totalQuestions = 5;

// Progress bar update
function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion;
}

// Show question
function showQuestion(questionNum) {
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('active');
    });
    document.getElementById('q' + questionNum).classList.add('active');
    currentQuestion = questionNum;
    updateProgress();
    window.scrollTo(0, 0);
}

// Question 1 handlers
document.querySelectorAll('#q1 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        quizData.frequency = this.getAttribute('data-value');
        
        // If they're researching, skip Q2
        if (quizData.frequency === 'researching') {
            quizData.currentBrand = 'none';
            quizData.currentBrandName = 'No current brand';
            quizData.concernLevel = 'unknown';
            showQuestion(3);
        } else {
            showQuestion(2);
        }
    });
});

// Question 2 handlers
const brandSelect = document.getElementById('current-brand');
const otherBrandContainer = document.getElementById('other-brand-container');
const otherBrandInput = document.getElementById('other-brand-name');
const q2NextBtn = document.getElementById('q2-next');

brandSelect.addEventListener('change', function() {
    const value = this.value;
    
    if (value === 'other') {
        otherBrandContainer.style.display = 'block';
        q2NextBtn.disabled = !otherBrandInput.value.trim();
    } else if (value) {
        otherBrandContainer.style.display = 'none';
        q2NextBtn.disabled = false;
        
        // Store brand data
        quizData.currentBrand = value;
        quizData.currentBrandName = this.options[this.selectedIndex].text;
    } else {
        q2NextBtn.disabled = true;
    }
});

otherBrandInput.addEventListener('input', function() {
    if (this.value.trim()) {
        q2NextBtn.disabled = false;
        quizData.currentBrand = 'other';
        quizData.currentBrandName = this.value.trim();
    } else {
        q2NextBtn.disabled = true;
    }
});

q2NextBtn.addEventListener('click', function() {
    if (!q2NextBtn.disabled) {
        showQuestion(3);
    }
});

// Question 3 handlers
document.querySelectorAll('#q3 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        quizData.concern = this.getAttribute('data-value');
        
        // Infer budget from concern
        if (this.getAttribute('data-value') === 'cleanest') {
            quizData.budget = 'premium';
        }
        
        showQuestion(4);
    });
});

// Question 4 handlers
document.querySelectorAll('#q4 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        quizData.proteinSource = this.getAttribute('data-value');
        showQuestion(5);
    });
});

// Question 5 handlers
document.querySelectorAll('#q5 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        quizData.primaryUse = this.getAttribute('data-value');
        
        // Infer budget from use case if not already set
        if (quizData.budget === 'mid-range') {
            if (this.getAttribute('data-value') === 'muscle') {
                quizData.budget = 'mid-range';
            } else if (this.getAttribute('data-value') === 'weightloss' || this.getAttribute('data-value') === 'health') {
                quizData.budget = 'budget';
            }
        }
        
        // Track quiz completion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_complete', {
                'event_category': 'Quiz',
                'event_label': 'Generated Results',
                'current_brand': quizData.currentBrandName
            });
        }
        
        // Show results immediately
        showResults();
    });
});

function showResults() {
    // Hide all questions
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('active');
    });
    
    // Show results section
    document.getElementById('results').style.display = 'block';
    
    // Update progress to 100%
    document.getElementById('progress').style.width = '100%';
    document.querySelector('.progress-text').textContent = 'Complete!';
    
    // Generate personalized results
    generateResults();
    
    window.scrollTo(0, 0);
}

function generateResults() {
    const brandName = quizData.currentBrandName.toLowerCase().trim();
    
    // Try to find their brand in our database
    let matchedProduct = null;
    
    // First try exact brand match
    for (let product of proteinProducts) {
        if (brandName.includes(product.brand.toLowerCase()) || 
            product.brand.toLowerCase().includes(brandName)) {
            matchedProduct = product;
            break;
        }
    }
    
    // Special case handling
    if (brandName.includes('naked') && brandName.includes('mass')) {
        matchedProduct = proteinProducts.find(p => p.rank === 23);
    } else if (brandName.includes('naked')) {
        matchedProduct = proteinProducts.find(p => p.rank === 23);
    } else if (brandName.includes('huel')) {
        matchedProduct = proteinProducts.find(p => p.rank === 22);
    } else if (brandName.includes('momentous') && brandName.includes('plant')) {
        matchedProduct = proteinProducts.find(p => p.rank === 20);
    } else if (brandName.includes('garden')) {
        matchedProduct = proteinProducts.find(p => p.rank === 21);
    }
    
    if (matchedProduct) {
        displayKnownBrand(matchedProduct);
    } else {
        displayUnknownBrand(quizData.currentBrandName);
    }
}

function displayKnownBrand(product) {
    const resultCard = document.getElementById('brand-result');
    const summary = document.getElementById('result-summary');
    
    // Set summary based on safety level
    if (product.rank <= 7) {
        summary.innerHTML = `<span style="color: #2ecc71; font-weight: 600;">✅ Good news!</span> ${product.brand} is one of the safer options tested.`;
    } else if (product.rank <= 19) {
        summary.innerHTML = `<span style="color: #f39c12; font-weight: 600;">⚠️ Use with caution.</span> ${product.brand} has elevated heavy metal levels.`;
    } else {
        summary.innerHTML = `<span style="color: #e74c3c; font-weight: 600;">🚫 Important warning.</span> ${product.brand} has dangerous contamination levels.`;
    }
    
    // Build result card HTML
    resultCard.innerHTML = `
        <div class="brand-info">
            <h3>${product.fullName}</h3>
            <div class="rank-badge rank-${product.rank <= 7 ? 'safe' : product.rank <= 19 ? 'moderate' : 'bad'}">
                Rank: #${product.rank} of 23
            </div>
        </div>
        
        <div class="safety-details">
            <div class="detail-row">
                <strong>Lead Level:</strong>
                <span class="${product.rank <= 7 ? 'safe' : product.rank <= 19 ? 'moderate' : 'bad'}">
                    ${product.leadLevel}
                </span>
            </div>
            <div class="detail-row">
                <strong>Max Servings:</strong> ${product.maxServings}
            </div>
            <div class="detail-row">
                <strong>CR Guidance:</strong> ${product.guidance}
            </div>
            <div class="detail-row">
                <strong>Type:</strong> ${product.type}
            </div>
        </div>
        
        ${product.articleLink ? `
            <a href="${product.articleLink}" class="learn-more-link">
                Read Full ${product.brand} Analysis →
            </a>
        ` : ''}
    `;
    
    // Generate recommendations based on their preferences
    generateRecommendations(product);
    
    // Generate action steps
    generateActionSteps(product);
}

function displayUnknownBrand(brand) {
    const resultCard = document.getElementById('brand-result');
    const summary = document.getElementById('result-summary');
    
    summary.innerHTML = `<span style="color: #f39c12; font-weight: 600;">⚠️ Brand not tested.</span> ${brand} was not included in Consumer Reports testing.`;
    
    resultCard.innerHTML = `
        <div class="brand-info">
            <h3>${brand}</h3>
            <div class="rank-badge rank-moderate">
                Not Tested by Consumer Reports
            </div>
        </div>
        
        <div class="safety-details">
            <p><strong>This brand was not included in the October 2025 Consumer Reports testing of 23 products.</strong></p>
            
            <p>Without independent third-party testing, we cannot verify the safety of this product. Many untested brands may have similar or worse contamination than the products that failed testing.</p>
            
            <h4 style="margin-top: 20px;">What you should look for:</h4>
            <ul style="margin-left: 20px; line-height: 1.8;">
                <li><strong>NSF Certified for Sport</strong> - Tests every batch for heavy metals</li>
                <li><strong>Clean Label Project certification</strong> - Independent contamination testing</li>
                <li><strong>Informed Choice</strong> - Batch testing program</li>
            </ul>
            
            <p style="margin-top: 20px;"><strong>Our recommendation:</strong> Switch to a verified-safe option from Consumer Reports testing below. Don't gamble with unverified products.</p>
        </div>
    `;
    
    // Show all safe alternatives for unknown brands
    generateRecommendations(null);
    generateActionSteps(null);
}

function generateRecommendations(currentProduct) {
    const recsDiv = document.getElementById('recommendations');
    
    // Get safe products (rank 1-7)
    const safeProducts = proteinProducts.filter(p => p.rank <= 7);
    
    // Filter based on user preferences
    let filteredProducts = safeProducts;
    
    // If they want plant-based, only show OWYN
    if (quizData.proteinSource === 'plant') {
        filteredProducts = safeProducts.filter(p => p.brand === 'OWYN');
        // If OWYN not in list, add it
        if (filteredProducts.length === 0) {
            filteredProducts = [safeProducts.find(p => p.rank === 7)];
        }
    } else {
        // Filter out plant-based for whey/any preference
        filteredProducts = safeProducts.filter(p => p.rank !== 7);
    }
    
    // If they want mass gainer
    if (quizData.primaryUse === 'muscle') {
        const massGainers = filteredProducts.filter(p => p.fullName.includes('Mass'));
        if (massGainers.length > 0) {
            filteredProducts = [...massGainers, ...filteredProducts.filter(p => !p.fullName.includes('Mass')).slice(0, 2)];
        }
    }
    
    // If current product is in the list, exclude it
    if (currentProduct) {
        filteredProducts = filteredProducts.filter(p => p.brand !== currentProduct.brand);
    }
    
    // Take top 4-5 recommendations
    const recommendations = filteredProducts.slice(0, 5);
    
    recsDiv.innerHTML = recommendations.map(product => `
        <div class="recommendation-card">
            <div class="rec-header">
                <h4>${product.fullName}</h4>
                <span class="rec-rank">Rank #${product.rank}</span>
            </div>
            <p><strong>Lead:</strong> ${product.leadLevel}</p>
            <p><strong>Best for:</strong> ${product.bestFor}</p>
            ${product.amazonLink ? `
                <a href="${product.amazonLink}" target="_blank" rel="noopener" class="amazon-button">
                    View on Amazon →
                </a>
            ` : ''}
            ${product.articleLink ? `
                <a href="${product.articleLink}" class="read-more-small">Full Analysis</a>
            ` : ''}
        </div>
    `).join('');
}

function generateActionSteps(product) {
    const actionList = document.getElementById('action-list');
    
    if (!product) {
        // Unknown brand
        actionList.innerHTML = `
            <li><strong>Stop using your current protein powder</strong> until you can verify its safety</li>
            <li><strong>Check if your brand has third-party certifications</strong> (NSF, Clean Label, Informed Choice)</li>
            <li><strong>Contact the manufacturer</strong> and request Certificate of Analysis (COA) for heavy metals</li>
            <li><strong>Switch to a verified-safe option</strong> from the recommendations above</li>
            <li><strong>Read the full report</strong> to understand why testing matters</li>
        `;
    } else if (product.rank <= 7) {
        // Safe product
        actionList.innerHTML = `
            <li><strong>Keep using ${product.brand}</strong> - It's verified safe for daily consumption</li>
            <li><strong>Continue your current serving size</strong> - No concerns with lead accumulation</li>
            <li><strong>Read the detailed analysis</strong> to understand why it tested so well</li>
            <li><strong>Share this information</strong> with friends using contaminated brands</li>
        `;
    } else if (product.rank <= 19) {
        // Moderate contamination
        actionList.innerHTML = `
            <li><strong>Limit ${product.brand} to ${product.maxServings}</strong> as recommended by Consumer Reports</li>
            <li><strong>Consider switching</strong> to a top-ranked safe alternative above</li>
            <li><strong>Don't use daily long-term</strong> - Lead accumulates over time</li>
            <li><strong>Read the full analysis</strong> to understand the contamination levels</li>
            <li><strong>Monitor for symptoms</strong> if you've been using daily (fatigue, brain fog, headaches)</li>
        `;
    } else {
        // Dangerous contamination
        actionList.innerHTML = `
            <li><strong>STOP using ${product.brand} immediately</strong> - Lead levels are 5-15x over safe limits</li>
            <li><strong>Do not finish the container</strong> - Even occasional use is risky</li>
            <li><strong>Switch to a verified-safe alternative</strong> from the recommendations above</li>
            <li><strong>Consider getting a blood lead test</strong> if you've been using daily for 6+ months</li>
            <li><strong>Watch for lead poisoning symptoms</strong>: chronic fatigue, brain fog, headaches, mood changes</li>
            <li><strong>Read the detailed analysis</strong> to understand the severity of contamination</li>
        `;
    }
}

function restartQuiz() {
    // Reset quiz data
    quizData.frequency = '';
    quizData.currentBrand = '';
    quizData.currentBrandName = '';
    quizData.concern = '';
    quizData.proteinSource = '';
    quizData.primaryUse = '';
    
    // Hide results
    document.getElementById('results').style.display = 'none';
    
    // Reset form
    brandSelect.value = '';
    otherBrandInput.value = '';
    otherBrandContainer.style.display = 'none';
    q2NextBtn.disabled = true;
    
    // Show first question
    currentQuestion = 1;
    showQuestion(1);
}

// Initialize
updateProgress();
