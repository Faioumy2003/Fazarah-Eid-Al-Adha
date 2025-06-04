function getRandomQuestions(age) {
    let easyCount = 0, mediumCount = 0, hardCount = 0;

    if (age <= 6) {
        easyCount = 8;
        mediumCount = 2;
        hardCount = 0;
    } else if (age >= 7 && age <= 8) {
        easyCount = 6;
        mediumCount = 3;
        hardCount = 1;
    } else if (age > 8 && age <= 12.5) {
        easyCount = 5;
        mediumCount = 3;
        hardCount = 2;
    } else {
        // هنا ممنوع الدخول (تحقق في الكود الرئيسي)
        return [];
    }

    // صنف الأسئلة حسب الصعوبة
    const easy = questionsBank.filter(q => q.difficulty === "سهل");
    const medium = questionsBank.filter(q => q.difficulty === "متوسط");
    const hard = questionsBank.filter(q => q.difficulty === "صعب");

    function getRandom(arr, n) {
        let arrCopy = [...arr];
        let res = [];
        for (let i = 0; i < n && arrCopy.length; i++) {
            const idx = Math.floor(Math.random() * arrCopy.length);
            res.push(arrCopy.splice(idx,1)[0]);
        }
        return res;
    }

    const selectedEasy = getRandom(easy, easyCount);
    const selectedMedium = getRandom(medium, mediumCount);
    const selectedHard = getRandom(hard, hardCount);

    let selected = [...selectedEasy, ...selectedMedium, ...selectedHard];
    // خلط ترتيب الأسئلة
    for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]];
    }
    return selected;
}