(function () {
  const form = document.getElementById("regForm");

  function setError(inputEl, message) {
    const id = inputEl.getAttribute("id") || inputEl.name;
    const err = document.querySelector(`.error[data-for="${id}"]`);
    if (err) { err.textContent = message; err.style.display = message ? "block" : "none"; }
    inputEl.classList.toggle("invalid", !!message);
    inputEl.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function setGroupError(name, message) {
    const err = document.querySelector(`.error[data-for="${name}"]`);
    if (err) { err.textContent = message; err.style.display = message ? "block" : "none"; }
  }

  function clearAllErrors() {
    document.querySelectorAll(".error").forEach(e => { e.textContent = ""; e.style.display = "none"; });
    document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));
  }

  function isAtLeast16(dobStr) {
    if (!dobStr) return false;
    const dob = new Date(dobStr);
    const today = new Date();
    const sixteen = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    return dob <= sixteen;
  }

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
  }

  function validatePassword(v) {
    // 8+ chars, one number, one special
    return /^(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(v || "");
  }

  function validatePhone(v) {
    return /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(v || "");
  }

  function validateUrl(v) {
    if (!v) return true; // optional
    try { new URL(v); return true; } catch { return false; }
  }

  function validateFile(file) {
    if (!file) return true; // optional
    const ok = ["image/png", "image/jpeg"];
    const maxBytes = 2 * 1024 * 1024; // 2MB
    return ok.includes(file.type) && file.size <= maxBytes;
  }

  form.addEventListener("submit", (e) => {
    clearAllErrors();
    let firstInvalid = null;

    // Simple honeypot
    const nickname = form.elements["nickname"];
    if (nickname && nickname.value.trim() !== "") {
      e.preventDefault();
      alert("Bot submission blocked.");
      return;
    }

    // Required text fields
    ["firstName", "lastName"].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        setError(el, "This field is required.");
        if (!firstInvalid) firstInvalid = el;
      }
    });

    // Email
    const email = document.getElementById("email");
    if (!email.value.trim()) {
      setError(email, "Email is required.");
      if (!firstInvalid) firstInvalid = email;
    } else if (!validateEmail(email.value.trim())) {
      setError(email, "Enter a valid email address.");
      if (!firstInvalid) firstInvalid = email;
    }

    // Password + confirm
    const pwd = document.getElementById("password");
    const conf = document.getElementById("confirm");
    if (!validatePassword(pwd.value)) {
      setError(pwd, "Min 8 chars, include a number and a symbol.");
      if (!firstInvalid) firstInvalid = pwd;
    }
    if (pwd.value !== conf.value) {
      setError(conf, "Passwords do not match.");
      if (!firstInvalid) firstInvalid = conf;
    }

    // Phone
    const phone = document.getElementById("phone");
    if (!validatePhone(phone.value.trim())) {
      setError(phone, "Enter a valid 10-digit phone number (with optional country code).");
      if (!firstInvalid) firstInvalid = phone;
    }

    // DOB
    const dob = document.getElementById("dob");
    if (!dob.value) {
      setError(dob, "Date of birth is required.");
      if (!firstInvalid) firstInvalid = dob;
    } else if (!isAtLeast16(dob.value)) {
      setError(dob, "You must be at least 16 years old.");
      if (!firstInvalid) firstInvalid = dob;
    }

    // Gender (radio)
    const gender = form.querySelector('input[name="gender"]:checked');
    if (!gender) {
      setGroupError("gender", "Please select a gender.");
      if (!firstInvalid) firstInvalid = form.querySelector('input[name="gender"]');
    } else {
      setGroupError("gender", "");
    }

    // Course (datalist-backed input) + Mode (select)
    const course = document.getElementById("course");
    if (!course.value.trim()) {
      setError(course, "Please choose a course.");
      if (!firstInvalid) firstInvalid = course;
    }
    const mode = document.getElementById("mode");
    if (!mode.value) {
      setError(mode, "Please select a study mode.");
      if (!firstInvalid) firstInvalid = mode;
    }

    // CGPA (optional but if present must be 0..10)
    const cgpa = document.getElementById("cgpa");
    if (cgpa.value) {
      const num = Number(cgpa.value);
      if (Number.isNaN(num) || num < 0 || num > 10) {
        setError(cgpa, "CGPA must be between 0 and 10.");
        if (!firstInvalid) firstInvalid = cgpa;
      }
    }

    // Portfolio URL (optional, but must be valid if provided)
    const portfolio = document.getElementById("portfolio");
    if (!validateUrl(portfolio.value.trim())) {
      setError(portfolio, "Enter a valid URL (including http/https).");
      if (!firstInvalid) firstInvalid = portfolio;
    }

    // File (optional) type/size
    const photo = document.getElementById("photo");
    if (photo.files && photo.files[0] && !validateFile(photo.files[0])) {
      setError(photo, "Only PNG/JPG up to 2 MB.");
      if (!firstInvalid) firstInvalid = photo;
    }

    // Communication preferences (at least one)
    const commChecked = form.querySelectorAll('input[name="comm"]:checked');
    if (commChecked.length === 0) {
      setGroupError("comm", "Select at least one communication method.");
      if (!firstInvalid) firstInvalid = form.querySelector('input[name="comm"]');
    } else {
      setGroupError("comm", "");
    }

    // Terms
    const terms = document.getElementById("terms");
    if (!terms.checked) {
      setGroupError("terms", "You must agree to the terms.");
      if (!firstInvalid) firstInvalid = terms;
    } else {
      setGroupError("terms", "");
    }

    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
    }
    // else: allow submission to server
  });
})();
