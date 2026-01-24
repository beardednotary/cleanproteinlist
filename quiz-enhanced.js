console.log('Quiz Enhanced JS Loaded');

// Quiz State
const quizData = {
    frequency: '',
    currentBrand: '',
    otherBrand: '',
    awareness: '',
    budgetWilling: '',
    concern: '',
    proteinSource: '',
    useCase: ''
};

let currentQuestion = 1;
const totalQuestions = 7;

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmlt138JCdtK2FpxuNHb0OlOOrayLF3WfEv0StA8btfZV02Xz6uDip73uBdqeBfXsq/exec';

// 1. Improved Tracking: No-CORS and error handling
function trackQuizData(data) {
    if (!GOOGLE_SCRIPT_URL) return;
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            type: 'quiz_completion',
            ...data
        })
    }).catch(err => console.warn('Tracking info:', err)); 
}

function updateProgress() {
    const progressEl = document.getElementById('progress');
    const currentQEl = document.getElementById('current-q');
    if (progressEl) progressEl.style.width = (currentQuestion / totalQuestions) * 100 + '%';
    if (currentQEl) currentQEl.textContent = currentQuestion;
}

function showQuestion(questionNum) {
    document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
    const nextQuestion = document.getElementById(`q${questionNum}`);
    if (nextQuestion) {
        nextQuestion.classList.add('active');
        currentQuestion = questionNum;
        updateProgress();
        window.scrollTo(0, 0); // Good for mobile users
    }
}

function goToResults() {
    const params = new URLSearchParams({
        frequency: quizData.frequency || '',
        brand: quizData.currentBrand || '',
        other: quizData.otherBrand || '',
        concern: quizData.concern || '',
        source: quizData.proteinSource || '',
        use: quizData.useCase || ''
    });
    
    // Using ./ ensures it looks in the current directory
    window.location.href = `./results.html?${params.toString()}`;
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Q1 - Q6 (Keep your existing logic for these)
    document.querySelectorAll('#q1 .option-btn').forEach(btn => {
        btn.addEventListener('click', () => { quizData.frequency = btn.dataset.value; showQuestion(2); });
    });

    // Q2 Logic
    const brandSelect = document.getElementById('current-brand');
    const otherContainer = document.getElementById('other-brand-container');
    const otherInput = document.getElementById('other-brand-name');
    const q2NextBtn = document.getElementById('q2-next');

    if (brandSelect && q2NextBtn) {
        brandSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherContainer.style.display = 'block';
                q2NextBtn.disabled = otherInput.value.trim() === '';
            } else {
                otherContainer.style.display = 'none';
                q2NextBtn.disabled = this.value === '';
            }
        });

        otherInput.addEventListener('input', () => {
            q2NextBtn.disabled = otherInput.value.trim() === '';
        });

        q2NextBtn.addEventListener('click', () => {
            quizData.currentBrand = brandSelect.value;
            quizData.otherBrand = brandSelect.value === 'other' ? otherInput.value.trim() : '';
            showQuestion(3);
        });
    }

    // Handlers for Q3, Q4, Q5, Q6
    const simpleQuestions = [3, 4, 5, 6];
    const dataKeys = ['awareness', 'budgetWilling', 'concern', 'proteinSource'];
    
    simpleQuestions.forEach((num, index) => {
        document.querySelectorAll(`#q${num} .option-btn`).forEach(btn => {
            btn.addEventListener('click', function() {
                quizData[dataKeys[index]] = this.dataset.value;
                showQuestion(num + 1);
            });
        });
    });

    // Q7: FINAL STEPS
    document.querySelectorAll('#q7 .option-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            quizData.useCase = this.dataset.value;
            
            // Fire tracking
            trackQuizData(quizData);
            
            // Redirect
            setTimeout(goToResults, 150); 
        });
    });
});