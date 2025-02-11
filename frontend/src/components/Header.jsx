import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiService from "../services/apiService";
import { toast } from "react-hot-toast";

const Header = () => {
  const { user, setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          QuizMaster 🚀
        </Link>

        {/* Navigation Links */}
        <nav>
          <ul className="flex space-x-6 text-white font-medium">
            <li>
              <Link to="/" className="hover:text-gray-200 transition duration-200">
                Home
              </Link>
            </li>

            {/* Show 'Create Quiz' if the user is an admin */}
            {user?.role === "admin" && (
              <li>
                <Link to="/create-quiz" className="hover:text-gray-200 transition duration-200">
                  Create Quiz
                </Link>
              </li>
            )}

            {/* Show 'Login' and 'Register' if no user is logged in */}
            {!user && (
              <>
                <li>
                  <Link to="/login" className="hover:text-gray-200 transition duration-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-gray-200 transition duration-200">
                    Register
                  </Link>
                </li>
              </>
            )}

            {/* Show 'Logout' if user is logged in */}
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
