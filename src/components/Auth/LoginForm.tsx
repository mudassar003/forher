// // src/components/Auth/LoginForm.tsx
// "use client";

// import { useAuthFormStore } from "@/store/authFormStore"; // ✅ Use the correct form store
// import { signInWithGoogle, signInWithEmail } from "@/lib/auth";

// const LoginForm = () => {
//   const { email, password, loading, error, setEmail, setPassword, setLoading, setError, resetForm } =
//     useAuthFormStore(); // ✅ Now using the correct form store

//   const handleEmailLogin = async () => {
//     setLoading(true);
//     const { error } = await signInWithEmail(email, password);
//     if (error) {
//       setError(error);
//     } else {
//       resetForm();
//     }
//     setLoading(false);
//   };

//   const handleGoogleLogin = async () => {
//     setLoading(true);
//     const { error } = await signInWithGoogle();
//     if (error) {
//       setError(error);
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
//       <h2 className="text-lg font-semibold mb-4">Login</h2>

//       {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

//       <input
//         type="email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//         placeholder="Email"
//         className="w-full p-2 border rounded mt-2"
//       />

//       <input
//         type="password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         placeholder="Password"
//         className="w-full p-2 border rounded mt-2"
//       />

//       <button
//         onClick={handleEmailLogin}
//         disabled={loading}
//         className="w-full bg-blue-500 text-white p-2 rounded mt-4"
//       >
//         {loading ? "Logging in..." : "Login"}
//       </button>

//       <p className="text-center my-3 text-gray-500">OR</p>

//       <button
//         onClick={handleGoogleLogin}
//         disabled={loading}
//         className="w-full bg-red-500 text-white p-2 rounded"
//       >
//         {loading ? "Signing in..." : "Sign in with Google"}
//       </button>
//     </div>
//   );
// };

// export default LoginForm;

"use client";

import { useAuthFormStore } from "@/store/authFormStore";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { FaApple } from "react-icons/fa"; // Apple icon

const LoginForm = () => {
  const {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    setLoading,
    setError,
    resetForm,
  } = useAuthFormStore();

  const router = useRouter();

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(error);
    } else {
      resetForm();
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:outline-none"
        />

        <div className="text-right">
          <a href="/forgot-password" className="text-sm text-purple-600 hover:underline">
            Forgot your password?
          </a>
        </div>

        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </div>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="mx-2 text-gray-500">or</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition disabled:opacity-50"
      >
        <FcGoogle className="text-xl" />
        {loading ? "Signing in..." : "Continue with Google"}
      </button>

      <button
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-100 transition mt-3 disabled:opacity-50"
      >
        <FaApple className="text-xl" />
        Continue with Apple
      </button>

      <p className="text-center text-sm mt-6 text-gray-500">
        First time here?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Create an account
        </a>
      </p>
    </div>
  );
};

export default LoginForm;
