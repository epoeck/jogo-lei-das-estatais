(function(q){
    q.get = id => document.getElementById(id);
    q.show = el => el.classList.remove('hidden');
    q.hide = el => el.classList.add('hidden');
})(window.quiz);
