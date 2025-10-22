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

// Brand Safety Data (from Consumer Reports)
const brandSafety = {
    'naked': { name: 'Naked Nutrition', status: 'contaminated', lead: '7.7 µg', rating: 'AVOID' },
    'huel': { name: 'Huel Black Edition', status: 'contaminated', lead: '6.3 µg', rating: 'AVOID' },
    'momentous-plant': { name: 'Momentous Plant Protein', status: 'contaminated', lead: 'Elevated', rating: 'Limit' },
    'garden': { name: 'Garden of Life Sport', status: 'contaminated', lead: 'Elevated', rating: 'Limit' },
    'vega': { name: 'Vega Sport', status: 'contaminated', lead: 'Elevated', rating: 'Limit' },
    'ensure': { name: 'Ensure Plant-Based', status: 'moderate', lead: 'Moderate', rating: 'Limit to 5/week' },
    'musclemilk': { name: 'Muscle Milk Pro', status: 'moderate', lead: 'Moderate', rating: 'Limit to 5/week' },
    'orgain': { name: 'Orgain', status: 'moderate', lead: 'Moderate', rating: 'Limit use' },
    'owyn': { name: 'OWYN Pro Elite', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'transparent': { name: 'Transparent Labs', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'optimum': { name: 'Optimum Nutrition', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'bsn': { name: 'BSN Syntha-6', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'momentous': { name: 'Momentous Whey Isolate', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'dymatize': { name: 'Dymatize Super Mass', status: 'safe', lead: '<0.5 µg', rating: 'Safe' },
    'muscletech': { name: 'MuscleTech Mass', status: 'safe', lead: 'Undetectable', rating: 'Safe' },
    'bodyfortress': { name: 'Body Fortress', status: 'safe', lead: '<0.5 µg', rating: 'Safe' }
};

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
        
        if (brandSafety[value]) {
            quizData.currentBrandName = brandSafety[value].name;
            quizData.concernLevel = brandSafety[value].status;
        } else {
            quizData.currentBrandName = this.options[this.selectedIndex].text;
            quizData.concernLevel = 'unknown';
        }
    } else {
        q2NextBtn.disabled = true;
    }
});

otherBrandInput.addEventListener('input', function() {
    if (this.value.trim()) {
        q2NextBtn.disabled = false;
        quizData.currentBrand = 'other';
        quizData.currentBrandName = this.value.trim();
        quizData.concernLevel = 'unknown';
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
        
        // Store quiz data in sessionStorage for later use
        sessionStorage.setItem('quizAnswers', JSON.stringify(quizData));
        
        // Track quiz completion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_complete', {
                'event_category': 'Quiz',
                'event_label': 'Reached Email Collection',
                'current_brand': quizData.currentBrandName
            });
        }
        
        // Show email collection
        showEmailCollection();
    });
});

function showEmailCollection() {
    // Hide question 5
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('active');
    });
    
    // Show email step
    document.getElementById('email-step').style.display = 'block';
    
    // Update progress to 100%
    document.getElementById('progress').style.width = '100%';
    document.querySelector('.progress-text').textContent = 'Almost done!';
    
    window.scrollTo(0, 0);
    
    // Kit form will handle the rest automatically
    // After user submits, Kit will redirect to your thank-you page
}

// Initialize
updateProgress();
