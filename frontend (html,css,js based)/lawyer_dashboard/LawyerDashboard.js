function addTask() {
  const task = document.getElementById("taskcontent").value;
  const hour = parseFloat(document.getElementById("hours").value);
  const caseId = new URLSearchParams(window.location.search).get("case_id");
  const token = localStorage.getItem("access_token");

  fetch("http://localhost:8000/log_progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      case_id: caseId,
      description: task,
      time_spent: hour
    })
  })
  .then(response => response.ok && (() => {
    const list = document.createElement("li");
    list.textContent = task + " - " + hour + " hours";
    document.getElementById("taskList").appendChild(list);
    document.getElementById("taskcontent").value = "";
    document.getElementById("hours").value = "";
  })())
  .catch(() => {});
}
