document.getElementById("register-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  fetch("http://localhost:8000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role })
  })
    .then(response => {
      if (!response.ok) return;
      return response.json();
    })
    .then(data => {
      if (data) {
        window.location.href = "login.html"; 
      }
    })
    .catch(err => { });
});

