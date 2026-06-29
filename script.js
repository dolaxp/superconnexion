/* ===========================================================
   Super Connexion — منطق فحص بوكسيات الألياف البصرية (ODB)
   يعتمد على المتغير BOX_CODES المُعرَّف فى data.js
   =========================================================== */

(function () {
  "use strict";

  // قاعدة البيانات (تأتي من data.js) — تحويلها إلى Set لسرعة البحث
  var rawCodes = (typeof BOX_CODES !== "undefined") ? BOX_CODES : [];
  var codeSet = new Set(rawCodes.map(normalize));

  function normalize(code) {
    return String(code)
      // إزالة الرموز الخفية غير المرئية (RTL/LTR marks, zero-width, BOM)
      // وهي رموز قد تُنسخ بالخطأ مع الرقم من إكسل أو من محررات تدعم العربي
      .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g, "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  // عناصر الصفحة
  var input       = document.getElementById("boxInput");
  var btn         = document.getElementById("checkBtn");
  var result      = document.getElementById("result");
  var resultIcon  = document.getElementById("resultIcon");
  var resultTitle = document.getElementById("resultTitle");
  var resultCode  = document.getElementById("resultCode");
  var totalCount  = document.getElementById("totalCount");
  var fiberRail   = document.getElementById("fiberRail");

  // عرض إجمالي عدد البوكسيات
  if (totalCount) {
    totalCount.textContent = rawCodes.length.toLocaleString("en-US");
  }

  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var ICON_NO = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M12 9v4M12 16.5h.01" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>' +
                '<path d="M10.6 4.7L3.4 17.3c-.5.9.1 2 1.2 2h14.8c1.1 0 1.7-1.1 1.2-2L13.4 4.7c-.6-1-2.2-1-2.8 0Z" stroke="currentColor" stroke-width="2"/></svg>';

  function showResult(state, title, code) {
    result.classList.remove("ok", "no");
    result.classList.add(state === "ok" ? "ok" : "no");
    resultIcon.innerHTML = state === "ok" ? ICON_OK : (state === "warn" ? ICON_WARN : ICON_NO);
    resultTitle.textContent = title;
    resultCode.textContent = code || "";
    resultCode.style.display = code ? "inline-block" : "none";
    requestAnimationFrame(function () {
      result.classList.add("is-visible");
    });
  }

  function runFiberScan(onDone) {
    fiberRail.classList.remove("scanning");
    // إعادة تشغيل الأنيميشن من الصفر
    void fiberRail.offsetWidth;
    fiberRail.classList.add("scanning");
    window.setTimeout(function () {
      fiberRail.classList.remove("scanning");
      if (typeof onDone === "function") onDone();
    }, 520);
  }

  function checkBox() {
    var raw = (input.value || "").trim();

    if (!raw) {
      showResult("warn", "من فضلك ادخل رقم البوكس أولاً");
      input.focus();
      return;
    }

    btn.disabled = true;
    result.classList.remove("is-visible");

    runFiberScan(function () {
      var normalized = normalize(raw);
      if (codeSet.has(normalized)) {
        showResult("ok", "هذا بوكس جديد ✅", raw);
      } else {
        showResult("no", "عذراً، لم يتم العثور على بوكس جديد", raw);
      }
      btn.disabled = false;
    });
  }

  btn.addEventListener("click", checkBox);

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      checkBox();
    }
  });

  input.addEventListener("input", function () {
    // تحويل تلقائي لحروف كبيرة أثناء الكتابة لراحة المستخدم
    var start = input.selectionStart, end = input.selectionEnd;
    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);
  });

})();
