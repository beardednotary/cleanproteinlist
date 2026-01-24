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

// Google tracking (leave blank for now)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmlt138JCdtK2FpxuNHb0OlOOrayLF3WfEv0StA8btfZV02Xz6uDip73uBdqeBfXsq/exec';

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
    }).catch(err => console.log('Tracking:', err));
}

// Update progress bar
function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('current-q').textContent = currentQuestion;
}

// Show specific question
function showQuestion(questionNum) {
    document.querySelectorAll('.question').forEach(q => q.classList.remove('active'));
    const nextQuestion = document.getElementById(`q${questionNum}`);
    if (nextQuestion) {
        nextQuestion.classList.add('active');
        currentQuestion = questionNum;
        updateProgress();
    }
}

// Navigate to results - CRITICAL FUNCTION
function goToResults() {
    const params = new URLSearchParams({
        frequency: quizData.frequency || '',
        brand: quizData.currentBrand || '',
        other: quizData.otherBrand || '',
        concern: quizData.concern || '',
        source: quizData.proteinSource || '',
        use: quizData.useCase || ''
    });
    
    // Force navigation
    window.location.href = `results.html?${params.toString()}`;
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', function() {
    
    // Q1: Frequency
    document.querySelectorAll('#q1 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.frequency = this.dataset.value;
            showQuestion(2);
        });
    });

    // Q2: Current Brand
    const brandSelect = document.getElementById('current-brand');
    const otherContainer = document.getElementById('other-brand-container');
    const otherInput = document.getElementById('other-brand-name');
    const q2NextBtn = document.getElementById('q2-next');

    if (brandSelect && q2NextBtn) {
        brandSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherContainer.style.display = 'block';
                q2NextBtn.disabled = otherInput.value.trim() === '';
            } else if (this.value) {
                otherContainer.style.display = 'none';
                q2NextBtn.disabled = false;
                quizData.currentBrand = this.value;
                quizData.otherBrand = '';
            } else {
                q2NextBtn.disabled = true;
            }
        });

        otherInput.addEventListener('input', function() {
            q2NextBtn.disabled = this.value.trim() === '';
        });

        q2NextBtn.addEventListener('click', function() {
            if (brandSelect.value === 'other') {
                quizData.currentBrand = 'other';
                quizData.otherBrand = otherInput.value.trim();
            } else {
                quizData.currentBrand = brandSelect.value;
            }
            showQuestion(3);
        });
    }

    // Q3: Awareness (optional)
    document.querySelectorAll('#q3 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.awareness = this.dataset.value;
            showQuestion(4);
        });
    });

    // Q4: Budget (optional)
    document.querySelectorAll('#q4 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.budgetWilling = this.dataset.value;
            showQuestion(5);
        });
    });

    // Q5: Concern
    document.querySelectorAll('#q5 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.concern = this.dataset.value;
            showQuestion(6);
        });
    });

    // Q6: Protein Source
    document.querySelectorAll('#q6 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.proteinSource = this.dataset.value;
            showQuestion(7);
        });
    });

    // Q7: Use Case - FINAL QUESTION → GOES TO RESULTS
    document.querySelectorAll('#q7 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.useCase = this.dataset.value;
            
            // Track data (optional)
            trackQuizData(quizData);
            
            // Navigate to results
            goToResults();
        });
    });
});