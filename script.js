(function(q){
    const e = q.el;
    e.startButton.addEventListener('click', q.startGame);
    e.nextButton.addEventListener('click', q.handleNextButton);
    e.restartButton.addEventListener('click', q.fetchAndPrepareGame);
    e.reviewButton.addEventListener('click', q.displayReview);
    e.backToResultsButton.addEventListener('click', q.showResultScreenAgain);
    document.addEventListener('keydown', q.handleKeyDown);
    q.fetchAndPrepareGame();
})(window.quiz);

