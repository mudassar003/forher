"use client";

import { useAuthFormStore } from "@/store/authFormStore"; // ✅ Use the correct form store
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";

const LoginForm = () => {
  const { email, password, loading, error, setEmail, setPassword, setLoading, setError, resetForm } =
    useAuthFormStore(); // ✅ Now using the correct form store

  const handleEmailLogin = async () => {
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      setError(error);
    } else {
      resetForm();
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
      <h2 className="text-lg font-semibold mb-4">Login</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border rounded mt-2"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border rounded mt-2"
      />

      <button
        onClick={handleEmailLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded mt-4"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center my-3 text-gray-500">OR</p>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full bg-red-500 text-white p-2 rounded"
      >
        {loading ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
};

export default LoginForm;
