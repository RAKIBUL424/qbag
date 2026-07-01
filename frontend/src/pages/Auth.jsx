// import React, { useState } from "react";
// import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/user";

// const Auth = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const [registerData, setRegisterData] = useState({
//     username: "",
//     email: "",
//     mobile: "",
//     password: "",
//   });

//   const [loginData, setLoginData] = useState({
//     username: "",
//     password: "",
//   });

//   // Register Input Change
//   const handleRegisterChange = (e) => {
//     setRegisterData({
//       ...registerData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Login Input Change
//   const handleLoginChange = (e) => {
//     setLoginData({
//       ...loginData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // Register User
//   const handleRegister = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       setMessage("");

//       const res = await axios.post(
//         `${API_URL}/registar`,
//         registerData
//       );

//       setMessage("Registration successful!");

//       setRegisterData({
//         username: "",
//         email: "",
//         mobile: "",
//         password: "",
//       });

//       console.log(res.data);
//     } catch (error) {
//       setMessage(
//         error.response?.data?.detail || "Registration failed!"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Login User
//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);
//       setMessage("");

//       const res = await axios.post(
//         `${API_URL}/login`,
//         loginData
//       );

//       localStorage.setItem("token", res.data.token);

//       setMessage("Login successful!");

//       console.log(res.data);
//     } catch (error) {
//       setMessage(
//         error.response?.data?.detail || "Login failed!"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container py-5">
//       <div className="row justify-content-center">
//         <div className="col-md-5">

//           <div className="card shadow">
//             <div className="card-body p-4">

//               <h2 className="text-center mb-4">
//                 {isLogin ? "Login" : "Register"}
//               </h2>

//               <div className="d-flex mb-4">
//                 <button
//                   className={`btn ${
//                     isLogin
//                       ? "btn-primary"
//                       : "btn-outline-primary"
//                   } w-50`}
//                   onClick={() => setIsLogin(true)}
//                 >
//                   Login
//                 </button>

//                 <button
//                   className={`btn ${
//                     !isLogin
//                       ? "btn-success"
//                       : "btn-outline-success"
//                   } w-50`}
//                   onClick={() => setIsLogin(false)}
//                 >
//                   Register
//                 </button>
//               </div>

//               {message && (
//                 <div className="alert alert-info">
//                   {message}
//                 </div>
//               )}

//               {isLogin ? (
//                 <form onSubmit={handleLogin}>
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Username
//                     </label>

//                     <input
//                       type="text"
//                       className="form-control"
//                       name="username"
//                       value={loginData.username}
//                       onChange={handleLoginChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">
//                       Password
//                     </label>

//                     <input
//                       type="password"
//                       className="form-control"
//                       name="password"
//                       value={loginData.password}
//                       onChange={handleLoginChange}
//                       required
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-primary w-100"
//                     disabled={loading}
//                   >
//                     {loading ? "Logging in..." : "Login"}
//                   </button>
//                 </form>
//               ) : (
//                 <form onSubmit={handleRegister}>
//                   <div className="mb-3">
//                     <label className="form-label">
//                       Username
//                     </label>

//                     <input
//                       type="text"
//                       className="form-control"
//                       name="username"
//                       value={registerData.username}
//                       onChange={handleRegisterChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">
//                       Email
//                     </label>

//                     <input
//                       type="email"
//                       className="form-control"
//                       name="email"
//                       value={registerData.email}
//                       onChange={handleRegisterChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">
//                       Mobile
//                     </label>

//                     <input
//                       type="text"
//                       className="form-control"
//                       name="mobile"
//                       value={registerData.mobile}
//                       onChange={handleRegisterChange}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">
//                       Password
//                     </label>

//                     <input
//                       type="password"
//                       className="form-control"
//                       name="password"
//                       value={registerData.password}
//                       onChange={handleRegisterChange}
//                       required
//                     />
//                   </div>

//                   <button
//                     type="submit"
//                     className="btn btn-success w-100"
//                     disabled={loading}
//                   >
//                     {loading
//                       ? "Registering..."
//                       : "Register"}
//                   </button>
//                 </form>
//               )}

//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;



// pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://127.0.0.1:8000/user";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Register Input Change
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  // Login Input Change
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // Register User
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/registar`,
        registerData
      );

      setMessage("Registration successful! Please login.");
      setRegisterData({
        username: "",
        email: "",
        mobile: "",
        password: "",
      });

      console.log(res.data);
      
      setTimeout(() => {
        setIsLogin(true);
        setMessage("Please login with your credentials");
      }, 1500);
      
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Registration failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${API_URL}/login`,
        loginData
      );

      // ✅ Use the login function from context
      login(res.data.token, { username: loginData.username });
      
      setMessage("Login successful! Redirecting...");
      console.log(res.data);

      setTimeout(() => {
        navigate("/");
      }, 1000);
      
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Login failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">

          <div className="card shadow">
            <div className="card-body p-4">

              <h2 className="text-center mb-4">
                {isLogin ? "Login" : "Register"}
              </h2>

              <div className="d-flex mb-4">
                <button
                  className={`btn ${
                    isLogin
                      ? "btn-primary"
                      : "btn-outline-primary"
                  } w-50`}
                  onClick={() => {
                    setIsLogin(true);
                    setMessage("");
                  }}
                >
                  Login
                </button>

                <button
                  className={`btn ${
                    !isLogin
                      ? "btn-success"
                      : "btn-outline-success"
                  } w-50`}
                  onClick={() => {
                    setIsLogin(false);
                    setMessage("");
                  }}
                >
                  Register
                </button>
              </div>

              {message && (
                <div className={`alert ${
                  message.includes("successful") || message.includes("Please login") 
                    ? "alert-success" 
                    : message.includes("failed") 
                    ? "alert-danger" 
                    : "alert-info"
                }`}>
                  {message}
                </div>
              )}

              {isLogin ? (
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Email
                    </label>

                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Mobile
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={registerData.mobile}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "Registering..."
                      : "Register"}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;