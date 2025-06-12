(function(q){
    const el = q.el = {
        startScreen: q.get('start-screen'),
        startButton: q.get('start-button'),
        quizContainer: q.get('quiz-container'),
        questionText: q.get('question-text'),
        optionsContainer: q.get('options-container'),
        nextButton: q.get('next-button'),
        resultContainer: q.get('result-container'),
        resultImage: q.get('result-image'),
        resultTitle: q.get('result-title'),
        finalScore: q.get('final-score'),
        finalMessage: q.get('final-message'),
        restartButton: q.get('restart-button'),
        feedbackContainer: q.get('feedback-container'),
        feedbackTitle: q.get('feedback-title'),
        feedbackText: q.get('feedback-text'),
        progressBar: q.get('progress-bar'),
        questionCounter: q.get('question-counter'),
        reviewContainer: q.get('review-container'),
        reviewButton: q.get('review-button'),
        reviewContent: q.get('review-content'),
        backToResultsButton: q.get('back-to-results-button'),
        bestScore: q.get('best-score'),
        recordDisplay: q.get('record-display')
    };

    let allQuestions = [];
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let incorrectAnswers = [];

    async function fetchAndPrepareGame(){
        if(allQuestions.length === 0){
            try{
                const res = await fetch('questoes.json');
                if(!res.ok) throw new Error('Falha ao carregar questões.');
                allQuestions = await res.json();
            }catch(e){
                console.error(e);
                document.body.innerHTML = 'Erro ao carregar o jogo. Verifique o arquivo `questoes.json`.';
                return;
            }
        }
        prepareStartScreen();
    }

    function prepareStartScreen(){
        q.hide(el.quizContainer);
        q.hide(el.resultContainer);
        q.hide(el.reviewContainer);
        q.show(el.startScreen);

        const best = localStorage.getItem(q.HIGH_SCORE_KEY);
        if(best){
            el.recordDisplay.textContent = `Recorde atual: ${best}%`;
            q.show(el.recordDisplay);
        }else{
            q.hide(el.recordDisplay);
        }
    }

    function startGame(){
        q.hide(el.startScreen);
        currentQuestionIndex = 0;
        score = 0;
        incorrectAnswers = [];
        selectRandomQuestions();
        q.show(el.quizContainer);
        displayQuestion();
    }

    function selectRandomQuestions(){
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        questions = shuffled.slice(0, q.QUESTIONS_PER_GAME);
    }

    function displayQuestion(){
        resetState();
        const current = questions[currentQuestionIndex];
        const progress = (currentQuestionIndex / questions.length) * 100;
        el.progressBar.style.width = `${progress}%`;
        el.progressBar.textContent = `${Math.round(progress)}%`;
        el.questionCounter.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
        el.questionText.textContent = current.question;
        current.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.innerHTML = opt;
            btn.classList.add('option-button');
            btn.dataset.answerIndex = idx;
            btn.addEventListener('click', selectAnswer);
            el.optionsContainer.appendChild(btn);
        });
    }

    function resetState(){
        q.hide(el.nextButton);
        q.hide(el.feedbackContainer);
        el.optionsContainer.innerHTML = '';
    }

    function selectAnswer(e){
        const btn = e.target;
        const correctIndex = questions[currentQuestionIndex].answer;
        const selectedIndex = parseInt(btn.dataset.answerIndex,10);
        Array.from(el.optionsContainer.children).forEach(b => b.disabled = true);
        if(selectedIndex === correctIndex){
            score++;
            btn.classList.add('correct');
            showFeedback(true);
        }else{
            btn.classList.add('incorrect');
            incorrectAnswers.push({...questions[currentQuestionIndex], userAnswerIndex:selectedIndex});
            showFeedback(false, correctIndex);
        }
        if(currentQuestionIndex < questions.length - 1){
            el.nextButton.textContent = 'Próxima Pergunta';
        }else{
            el.nextButton.textContent = 'Ver Resultado Final';
        }
        q.show(el.nextButton);
    }

    function showFeedback(isCorrect, correctIndex=null){
        q.show(el.feedbackContainer);
        const explanation = questions[currentQuestionIndex].explanation;
        if(isCorrect){
            el.feedbackContainer.className = 'feedback-container correct';
            el.feedbackTitle.textContent = 'Resposta Correta!';
            el.feedbackText.innerHTML = `<strong>Justificativa:</strong> ${explanation}`;
        }else{
            el.feedbackContainer.className = 'feedback-container incorrect';
            el.feedbackTitle.textContent = 'Resposta Incorreta!';
            el.feedbackText.innerHTML = `<strong>Justificativa:</strong> ${explanation}`;
            el.optionsContainer.children[correctIndex].classList.add('correct');
        }
    }

    function handleNextButton(){
        currentQuestionIndex++;
        if(currentQuestionIndex < questions.length){
            displayQuestion();
        }else{
            showResult();
        }
    }

    function showResult(){
        q.hide(el.quizContainer);
        q.hide(el.feedbackContainer);
        el.progressBar.style.width = '100%';
        el.progressBar.textContent = '100%';
        const percentage = Math.round((score / questions.length) * 100);
        const previousHigh = parseInt(localStorage.getItem(q.HIGH_SCORE_KEY) || '0',10);
        if(percentage > previousHigh){
            localStorage.setItem(q.HIGH_SCORE_KEY, percentage);
        }
        el.bestScore.textContent = `Recorde: ${localStorage.getItem(q.HIGH_SCORE_KEY)}%`;
        if(percentage >= q.SUCCESS_THRESHOLD){
            el.resultImage.src = 'images/sucesso.png';
            el.resultTitle.textContent = 'Missão Cumprida!';
            el.finalMessage.textContent = "EXCELENTE! O Projeto Fênix foi um sucesso. A 'InovaBrasil S.A.' foi salva graças à sua expertise!";
        }else{
            el.resultImage.src = 'images/defeat.png';
            el.resultTitle.textContent = 'Missão Fracassada!';
            el.finalMessage.textContent = "A 'InovaBrasil' continua em risco. Estude mais a Lei das Estatais e tente novamente!";
        }
        el.finalScore.textContent = `Sua pontuação: ${score} de ${questions.length} (${percentage}%)`;
        if(incorrectAnswers.length > 0){
            q.show(el.reviewButton);
        }else{
            q.hide(el.reviewButton);
        }
        q.show(el.resultContainer);
    }

    function displayReview(){
        q.hide(el.resultContainer);
        q.show(el.reviewContainer);
        el.reviewContent.innerHTML = '';
        incorrectAnswers.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('review-item');
            div.innerHTML = `
                <h4>${item.question}</h4>
                <p>Sua resposta: <span class="user-answer-wrong">${item.options[item.userAnswerIndex]}</span></p>
                <p>Resposta correta: <span class="correct-answer-review">${item.options[item.answer]}</span></p>
                <p><strong>Justificativa:</strong> ${item.explanation}</p>
            `;
            el.reviewContent.appendChild(div);
        });
    }

    function showResultScreenAgain(){
        q.hide(el.reviewContainer);
        q.show(el.resultContainer);
    }

    function handleKeyDown(e){
        if(el.quizContainer.classList.contains('hidden')) return;
        const key = e.key;
        if(key >= '1' && key <= '4'){
            const idx = parseInt(key,10) - 1;
            const btn = el.optionsContainer.children[idx];
            if(btn && !btn.disabled) btn.click();
        }else if(key === 'Enter' && !el.nextButton.classList.contains('hidden')){
            el.nextButton.click();
        }
    }

    q.fetchAndPrepareGame = fetchAndPrepareGame;
    q.startGame = startGame;
    q.handleNextButton = handleNextButton;
    q.displayReview = displayReview;
    q.showResultScreenAgain = showResultScreenAgain;
    q.handleKeyDown = handleKeyDown;
})(window.quiz);

