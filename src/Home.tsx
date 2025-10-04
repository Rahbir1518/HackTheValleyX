import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";
import Learning from "./Learning";

const App = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <div>
              <h1 className="text-2xl text-red-700">Home</h1>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Go to Login
              </button>
            </div>
          }
        />

        {/* Login Page */}
        <Route
          path="/login"
          element={
            <div>
              <Login />
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Go to Sign Up
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          }
        />

        {/* Sign Up Page */}
        <Route
          path="/signup"
          element={
            <div>
              <SignUp />
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Back to Login
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          }
        />

        {/* Dashboard Page */}
        <Route
          path="/dashboard"
          element={
            <div>
              <Dashboard />
              <button
                onClick={() => navigate("/learning")}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded"
              >
                Go to Learning
              </button>
            </div>
          }
        />

        {/* Learning Page */}
        <Route path="/learning" element={<Learning />} />
      </Routes>
    </div>
  );
};

export default App;
