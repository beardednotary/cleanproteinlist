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
    }).catch(err => console.warn('Tracking:', err));
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function goToResults() {
    // 1. Prepare the data for sessionStorage (what results.html expects)
    const storageData = {
        currentBrandName: quizData.currentBrand === 'other' ? quizData.otherBrand : quizData.currentBrand,
        proteinSource: quizData.proteinSource,
        primaryUse: quizData.useCase,
        budget: quizData.budgetWilling,
        concern: quizData.concern
    };

    // 2. Save it so results.html doesn't kick you back
    sessionStorage.setItem('quizAnswers', JSON.stringify(storageData));

    // 3. Prepare the URL params for tracking/backups
    const params = new URLSearchParams(quizData);
    
    // 4. Redirect
    window.location.replace(`./results.html?${params.toString()}`);
}

document.addEventListener('DOMContentLoaded', function() {
    
    // Q1 - Frequency
    document.querySelectorAll('#q1 .option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            quizData.frequency = this.dataset.value;
            showQuestion(2);
        });
    });

    // Q2 - Brand Selection
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

        q2NextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            quizData.currentBrand = brandSelect.value;
            quizData.otherBrand = brandSelect.value === 'other' ? otherInput.value.trim() : '';
            showQuestion(3);
        });
    }

    // Handlers for Questions 3, 4, 5, 6
    const mapping = { q3: 'awareness', q4: 'budgetWilling', q5: 'concern', q6: 'proteinSource' };
    Object.keys(mapping).forEach((id, index) => {
        document.querySelectorAll(`#${id} .option-btn`).forEach(btn => {
            btn.addEventListener('click', function() {
                quizData[mapping[id]] = this.dataset.value;
                showQuestion(index + 4); // Advances correctly to next Q
            });
        });
    });

    // Q7: FINAL ACTION - THE "FIX" IS HERE
    document.querySelectorAll('#q7 .option-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // STOP EVERYTHING ELSE
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); 
            
            quizData.useCase = this.dataset.value;
            
            // Fire tracking
            trackQuizData(quizData);
            
            // Redirect immediately
            goToResults();
        });
    });
});