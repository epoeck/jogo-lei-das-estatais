// --- Elementos do DOM ---
const startScreenEl = document.getElementById('start-screen');
const startButtonEl = document.getElementById('start-button');
const quizContainerEl = document.getElementById('quiz-container');
const questionTextEl = document.getElementById('question-text');
const optionsContainerEl = document.getElementById('options-container');
const nextButtonEl = document.getElementById('next-button');
const resultContainerEl = document.getElementById('result-container');
const resultImageEl = document.getElementById('result-image');
const resultTitleEl = document.getElementById('result-title');
const finalScoreEl = document.getElementById('final-score');
const finalMessageEl = document.getElementById('final-message');
const restartButtonEl = document.getElementById('restart-button');
const feedbackContainerEl = document.getElementById('feedback-container');
const feedbackTitleEl = document.getElementById('feedback-title');
const feedbackTextEl = document.getElementById('feedback-text');
const progressBarEl = document.getElementById('progress-bar');
const questionCounterEl = document.getElementById('question-counter');
const reviewContainerEl = document.getElementById('review-container');
const reviewButtonEl = document.getElementById('review-button');
const reviewContentEl = document.getElementById('review-content');
const backToResultsButtonEl = document.getElementById('back-to-results-button');

// --- Estado do Jogo ---
let allQuestions = [];
let questions = []; 
let currentQuestionIndex = 0;
let score = 0;
let incorrectAnswers = []; // << NOVO: Armazena os erros para revisão
const QUESTIONS_PER_GAME = 10;

// --- Funções do Jogo ---

// Carrega as questões do JSON
async function fetchAndPrepareGame() {
    if (allQuestions.length === 0) {
        try {
            const response = await fetch('questoes.json');
            if (!response.ok) throw new Error('Falha ao carregar questões.');
            allQuestions = await response.json();
        } catch (error) {
            console.error(error);
            document.body.innerHTML = "Erro ao carregar o jogo. Verifique o arquivo `questoes.json` e o console.";
            return;
        }
    }
    prepareStartScreen();
}

// Prepara a tela inicial
function prepareStartScreen() {
    quizContainerEl.classList.add('hidden');
    resultContainerEl.classList.add('hidden');
    reviewContainerEl.classList.add('hidden');
    startScreenEl.classList.remove('hidden');
}

// Inicia o quiz após clicar no botão "Iniciar Missão"
function startGame() {
    startScreenEl.classList.add('hidden');
    
    currentQuestionIndex = 0;
    score = 0;
    incorrectAnswers = [];
    selectRandomQuestions();

    quizContainerEl.classList.remove('hidden');
    displayQuestion();
}

// Seleciona 10 perguntas aleatórias
function selectRandomQuestions() {
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    questions = shuffled.slice(0, QUESTIONS_PER_GAME);
}

// Mostra a pergunta atual
function displayQuestion() {
    resetState();
    const currentQuestion = questions[currentQuestionIndex];
    
    const progressPercentage = (currentQuestionIndex / questions.length) * 100;
    progressBarEl.style.width = `${progressPercentage}%`;
    questionCounterEl.textContent = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
    questionTextEl.textContent = currentQuestion.question;

    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerHTML = option;
        button.classList.add('option-button');
        button.dataset.answerIndex = index;
        button.addEventListener('click', selectAnswer);
        optionsContainerEl.appendChild(button);
    });
}

// Reseta o estado da tela para a próxima pergunta
function resetState() {
    nextButtonEl.classList.add('hidden');
    feedbackContainerEl.classList.add('hidden');
    optionsContainerEl.innerHTML = '';
}

// Lida com a seleção de uma resposta
function selectAnswer(e) {
    const selectedButton = e.target;
    const correctIndex = questions[currentQuestionIndex].answer;
    const selectedIndex = parseInt(selectedButton.dataset.answerIndex);

    Array.from(optionsContainerEl.children).forEach(button => {
        button.disabled = true;
    });

    if (selectedIndex === correctIndex) {
        score++;
        selectedButton.classList.add('correct');
        showFeedback(true);
    } else {
        selectedButton.classList.add('incorrect');
        incorrectAnswers.push({ // << NOVO: Salva a pergunta errada
            ...questions[currentQuestionIndex],
            userAnswerIndex: selectedIndex
        });
        showFeedback(false, correctIndex);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
        nextButtonEl.textContent = "Próxima Pergunta";
    } else {
        nextButtonEl.textContent = "Ver Resultado Final";
    }
    nextButtonEl.classList.remove('hidden');
}

// Mostra o feedback (correto/incorreto)
function showFeedback(isCorrect, correctIndex = null) {
    feedbackContainerEl.classList.remove('hidden');
    const explanation = questions[currentQuestionIndex].explanation;
    
    if(isCorrect) {
        feedbackContainerEl.className = 'feedback-container correct';
        feedbackTitleEl.textContent = 'Resposta Correta!';
        feedbackTextEl.innerHTML = `<strong>Justificativa:</strong> ${explanation}`;
    } else {
        feedbackContainerEl.className = 'feedback-container incorrect';
        feedbackTitleEl.textContent = 'Resposta Incorreta!';
        feedbackTextEl.innerHTML = `<strong>Justificativa:</strong> ${explanation}`;
        optionsContainerEl.children[correctIndex].classList.add('correct');
    }
}

// Avança para a próxima pergunta
function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

// Mostra o resultado final
function showResult() {
    quizContainerEl.classList.add('hidden');
    feedbackContainerEl.classList.add('hidden');
    
    const percentage = Math.round((score / questions.length) * 100);

    if (percentage >= 70) {
        resultImageEl.src = 'images/sucesso.png';
        resultTitleEl.textContent = "Missão Cumprida!";
        finalMessageEl.textContent = "EXCELENTE! O Projeto Fênix foi um sucesso. A 'InovaBrasil S.A.' foi salva graças à sua expertise!";
    } else {
        resultImageEl.src = 'images/defeat.png';
        resultTitleEl.textContent = "Missão Fracassada!";
        finalMessageEl.textContent = "A 'InovaBrasil' continua em risco. Estude mais a Lei das Estatais e tente novamente!";
    }

    finalScoreEl.textContent = `Sua pontuação: ${score} de ${questions.length} (${percentage}%)`;
    
    if (incorrectAnswers.length > 0) {
        reviewButtonEl.classList.remove('hidden');
    } else {
        reviewButtonEl.classList.add('hidden');
    }
    
    resultContainerEl.classList.remove('hidden');
}

// << NOVO: Função para mostrar a revisão de erros >>
function displayReview() {
    resultContainerEl.classList.add('hidden');
    reviewContainerEl.classList.remove('hidden');
    reviewContentEl.innerHTML = '';

    incorrectAnswers.forEach(item => {
        const reviewItem = document.createElement('div');
        reviewItem.classList.add('review-item');

        reviewItem.innerHTML = `
            <h4>${item.question}</h4>
            <p>Sua resposta: <span class="user-answer-wrong">${item.options[item.userAnswerIndex]}</span></p>
            <p>Resposta correta: <span class="correct-answer-review">${item.options[item.answer]}</span></p>
            <p><strong>Justificativa:</strong> ${item.explanation}</p>
        `;
        reviewContentEl.appendChild(reviewItem);
    });
}

// << NOVO: Função para voltar da revisão para a tela de resultados >>
function showResultScreenAgain() {
    reviewContainerEl.classList.add('hidden');
    resultContainerEl.classList.remove('hidden');
}

// --- Event Listeners ---
startButtonEl.addEventListener('click', startGame);
nextButtonEl.addEventListener('click', handleNextButton);
restartButtonEl.addEventListener('click', fetchAndPrepareGame);
reviewButtonEl.addEventListener('click', displayReview);
backToResultsButtonEl.addEventListener('click', showResultScreenAgain);

// --- Início do Jogo ---
fetchAndPrepareGame();