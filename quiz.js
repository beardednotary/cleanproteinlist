// Store user answers
const answers = {
    usage: '',
    currentBrand: '',
    otherBrand: '',
    concern: '',
    proteinType: '',
    primaryUse: ''
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
        answers.usage = this.getAttribute('data-value');
        
        // If they're researching, skip Q2
        if (answers.usage === 'researching') {
            showQuestion(3);
        } else {
            showQuestion(2);
        }
    });
});

// Question 2 handlers
const brandSelect = document.getElementById('current-brand');
const otherBrandContainer = document.getElementById('other-brand-container');
const q2NextBtn = document.getElementById('q2-next');

brandSelect.addEventListener('change', function() {
    answers.currentBrand = this.value;
    
    // Show "other" text input if needed
    if (this.value === 'other') {
        otherBrandContainer.style.display = 'block';
        q2NextBtn.disabled = true;
    } else {
        otherBrandContainer.style.display = 'none';
        q2NextBtn.disabled = false;
    }
});

document.getElementById('other-brand-name').addEventListener('input', function() {
    answers.otherBrand = this.value;
    q2NextBtn.disabled = this.value.trim() === '';
});

q2NextBtn.addEventListener('click', function() {
    if (answers.currentBrand) {
        showQuestion(3);
    }
});

// Question 3 handlers
document.querySelectorAll('#q3 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        answers.concern = this.getAttribute('data-value');
        showQuestion(4);
    });
});

// Question 4 handlers
document.querySelectorAll('#q4 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        answers.proteinType = this.getAttribute('data-value');
        showQuestion(5);
    });
});

// Question 5 handlers - Go to results
document.querySelectorAll('#q5 .option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        answers.primaryUse = this.getAttribute('data-value');
        
        // Store answers in sessionStorage
        sessionStorage.setItem('quizAnswers', JSON.stringify(answers));
        
        // Track quiz completion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'quiz_complete', {
                'event_category': 'engagement',
                'event_label': 'completed_quiz'
            });
        }
        
        // Go to results page
        window.location.href = 'results.html';
    });
});

// Initialize
updateProgress();