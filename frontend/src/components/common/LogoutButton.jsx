import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.clear(); // remove all stored data
    navigate("/login", { replace: true }); // replace so back button won’t return to dashboard
    window.location.reload(); // optional — clears any React state
  }

  return (
    <button onClick={handleLogout} style={{ marginTop: "10px" }}>
      Logout
    </button>
  );
}
