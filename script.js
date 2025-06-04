// سكريبت مبدئي للتحقق من الشروط ويمكن تطويره مع كل خطوة جديدة
document.querySelector('.entry-form').onsubmit = function(e){
    e.preventDefault();
    // التقاط البيانات
    const fullName = document.getElementById('fullName').value.trim();
    const nid = document.getElementById('nid').value.trim();
    const commitment = document.getElementById('commitment').checked;
    // تحقق الاسم
    if(fullName.split(" ").length < 4){
        alert("يرجى كتابة الاسم الرباعي كاملًا.");
        return;
    }
    // تحقق الرقم القومي
    if(!/^\d{14}$/.test(nid)){
        alert("الرقم القومي يجب أن يكون 14 رقمًا.");
        return;
    }
    // تحقق السن بناءً على الرقم القومي
    const birthYear = parseInt('19' + nid.slice(1,3));
    const currentYear = new Date().getFullYear();
    let age = currentYear - birthYear;
    if (nid[0] === '3') age = currentYear - parseInt('20' + nid.slice(1,3));
    // أقل من 13 سنة
    if(age >= 13){
        alert("المسابقة مخصصة فقط لمن هم أقل من 13 سنة.");
        return;
    }
    // التزام التعهد
    if(!commitment){
        alert("يجب أن تتعهد أمام الله أنك ستحل بنفسك.");
        return;
    }
    // يمكنك الآن الانتقال للامتحان أو تنفيذ أي منطق لاحق
    alert("تم استلام بياناتك! عند بدء المسابقة ستظهر 10 أسئلة مختلفة حسب سنك، ولكل سؤال 30 ثانية ولا يمكن الخروج من الامتحان.");
    // من هنا يمكنك إظهار صفحة الاختبار ومنع الخروج حسب الخطوة التالية
};
