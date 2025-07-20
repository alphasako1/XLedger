import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  }

  return (
    <button onClick={handleLogout} style={{ marginTop: '20px' }}>
      Logout
    </button>
  );
}
