const SHEET_API = "https://script.google.com/macros/s/XXXXXXXXXXXX/exec"; // ضع رابط الـ WebApp هنا

document.querySelector('.entry-form').onsubmit = async function(e) {
    e.preventDefault();
    const nid = document.getElementById('nid').value.trim();
    const name = document.getElementById('fullName').value.trim();
    const commitment = document.getElementById('commitment').checked;

    // تحقق الاسم
    if(name.split(" ").length < 4){
        alert("يرجى كتابة الاسم الرباعي كاملًا.");
        return;
    }
    // تحقق الرقم القومي
    if(!/^\d{14}$/.test(nid)){
        alert("الرقم القومي يجب أن يكون 14 رقمًا.");
        return;
    }
    // تحقق السن بناءً على الرقم القومي
    const birthYear = nid[0] === '3' 
        ? parseInt('20' + nid.slice(1,3)) 
        : parseInt('19' + nid.slice(1,3));
    const currentYear = new Date().getFullYear();
    let age = currentYear - birthYear;
    if(age >= 13){
        alert("المسابقة مخصصة فقط لمن هم أقل من 13 سنة.");
        return;
    }
    // التزام التعهد
    if(!commitment){
        alert("يجب أن تتعهد أمام الله أنك ستحل بنفسك.");
        return;
    }

    // تحقق من Google Sheet (محاولة مُسبقة)
    const res = await fetch(SHEET_API, {
        method: "POST",
        body: JSON.stringify({nid, name}),
        headers: {'Content-Type': 'application/json'}
    });
    const result = await res.json();
    if (result.exists) {
        alert("لقد شاركت بالفعل ولا يمكنك دخول الامتحان مرة أخرى.");
        return false;
    }

    // سجل بيانات الطفل محليًا
    localStorage.setItem('childName', name);
    localStorage.setItem('childNID', nid);

    // الانتقال مباشرة لصفحة الامتحان
    window.location.href = "quiz.html";
};
