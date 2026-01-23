// Quiz State
const quizData = {
    frequency: '',
    currentBrand: '',
    otherBrand: '',
    awareness: '',        // NEW
    budgetWilling: '',    // NEW
    concern: '',
    proteinSource: '',
    useCase: ''
};

let currentQuestion = 1;
const totalQuestions = 7; // Updated from 5 to 7

// Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwmlt138JCdtK2FpxuNHb0OlOOrayLF3WfEv0StA8btfZV02Xz6uDip73uBdqeBfXsq/exec';

// Track data to Google Sheets
function trackQuizData(data) {
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            type: 'quiz_completion',
            ...data
        })
    }).catch(err => console.log('Tracking error:', err));
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
    document.getElementById(`q${questionNum}`).classList.add('active');
    currentQuestion = questionNum;
    updateProgress();
}

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
    
    // Question 1: Frequency
    document.querySelectorAll('#q1 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.frequency = this.dataset.value;
            showQuestion(2);
        });
    });

    // Question 2: Current Brand
    const brandSelect = document.getElementById('current-brand');
    const otherContainer = document.getElementById('other-brand-container');
    const otherInput = document.getElementById('other-brand-name');
    const q2NextBtn = document.getElementById('q2-next');

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

    // NEW Question 3: Awareness (optional)
    document.querySelectorAll('#q3 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.awareness = this.dataset.value;
            showQuestion(4);
        });
    });

    // NEW Question 4: Budget Willingness (optional)
    document.querySelectorAll('#q4 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.budgetWilling = this.dataset.value;
            showQuestion(5);
        });
    });

    // Question 5: Concern (formerly Q3)
    document.querySelectorAll('#q5 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.concern = this.dataset.value;
            showQuestion(6);
        });
    });

    // Question 6: Protein Source (formerly Q4)
    document.querySelectorAll('#q6 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.proteinSource = this.dataset.value;
            showQuestion(7);
        });
    });

    // Question 7: Use Case (formerly Q5) - FINAL QUESTION
    document.querySelectorAll('#q7 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.useCase = this.dataset.value;
            
            // Track quiz completion to Google Sheets
            trackQuizData(quizData);
            
            // Continue to results (your existing flow)
            goToResults();
        });
    });
});

// Navigate to results page
function goToResults() {
    const params = new URLSearchParams({
        frequency: quizData.frequency,
        brand: quizData.currentBrand,
        other: quizData.otherBrand,
        concern: quizData.concern,
        source: quizData.proteinSource,
        use: quizData.useCase
    });
    window.location.href = `results.html?${params.toString()}`;
}