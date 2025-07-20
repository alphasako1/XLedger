function addTask() {
  const taskcontent = document.getElementById("taskcontent");
  const hours = document.getElementById("hours");

  const task = taskcontent.value;
  const hour = parseFloat(hours.value);

  const urlParams = new URLSearchParams(window.location.search);
  const caseId = urlParams.get("case_id");

  const token = localStorage.getItem("access_token");

  if (!task || !hour || !caseId || !token) {
    alert("Please fill in all fields and make sure you are logged in.");
    return;
  }

  const data = {
    case_id: caseId,
    description: task,
    time_spent: hour
  };

  fetch("http://localhost:8000/log_progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(data)
  })
    .then(function (response) {
      if (response.ok) {
        const list = document.getElementById("taskList");
        const newItem = document.createElement("li");
        newItem.textContent = task + " - " + hour + " hours";
        list.appendChild(newItem);

        taskcontent.value = "";
        hours.value = "";
      } else {
        alert("Failed to save data to the server.");
      }
    })
    .catch(function () {
      alert("Failed to connect to the server.");
    });
}

