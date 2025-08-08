document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault(); 

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:8000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
    .then(response => {
      if (!response.ok) return; 
      return response.json();
    })
    .then(data => {
      if (!data) return; 

      localStorage.setItem("token", data.access_token);

      window.location.href = "LawyerDashboard.html";
    })
    .catch(err => {});
});
