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
        
        // Determine concern level (for internal tracking)
        if (['naked', 'huel'].includes(value)) {
            quizData.concernLevel = 'contaminated';
        } else if (['momentous-plant', 'garden', 'vega'].includes(value)) {
            quizData.concernLevel = 'high-risk';
        } else if (['ensure', 'musclemilk', 'orgain'].includes(value)) {
            quizData.concernLevel = 'moderate';
        } else if (['owyn', 'transparent', 'optimum', 'bsn', 'momentous-whey', 'dymatize', 'muscletech', 'bodyfortress'].includes(value)) {
            quizData.concernLevel = 'safe';
        } else {
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

// Question 5 handlers - REDIRECT TO RESULTS
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
        
        // Store quiz data for results page
        sessionStorage.setItem('quizAnswers', JSON.stringify(quizData));
        
        // Track quiz completion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_complete', {
                'event_category': 'Quiz',
                'event_label': 'Completed Quiz',
                'current_brand': quizData.currentBrandName
            });
        }
        
        // Redirect to results page
        window.location.href = 'results.html';
    });
});

// Initialize
updateProgress();