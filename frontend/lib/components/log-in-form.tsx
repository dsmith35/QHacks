// src/components/LoginForm.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, useRouter } from "../routes";
import { loginUser } from '../api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errors, setErrors] = useState<{ [key: string]: string } | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Router for navigation
  const { push } = useRouter();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous errors
    setErrors(null);

    // Call the loginUser function
    await loginUser(email, password, push, setErrors, setLoading);
    console.log(errors);
  };

  // Handle input changes and clear specific errors
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update the corresponding state
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);

    // Clear error for the specific field
    if (errors) {
      setErrors(prevErrors => {
        if (prevErrors && prevErrors[name]) {
          const updatedErrors = { ...prevErrors };
          delete updatedErrors[name];
          return Object.keys(updatedErrors).length > 0 ? updatedErrors : null;
        }
        return prevErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <div className="flex justify-between mb-6">
          <Link to="/">
            <button
              id="back-button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200"
            >
              Home
            </button>
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
          {/* Display general errors */}
          {errors && errors.general && (
            <div className="mb-4 text-red-500 text-sm">
              {errors.general}
            </div>
          )}
          {/* Display non-field errors */}
          {errors && errors.non_field_errors && (
            <div className="mb-4 text-red-500 text-sm">
              {errors.non_field_errors}
            </div>
          )}
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                errors && errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {/* Display email-specific error */}
            {errors && errors.email && (
              <div className="mt-1 text-red-500 text-sm">{errors.email}</div>
            )}
          </div>
          {/* Password Field */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                errors && errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {/* Display password-specific error */}
            {errors && errors.password && (
              <div className="mt-1 text-red-500 text-sm">{errors.password}</div>
            )}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 flex items-center justify-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        {/* Link to Sign Up Page */}
        <div className="mt-4 text-center">
          <Link to={ROUTES.SIGN_UP_PAGE} className="text-blue-500 hover:underline">
            Don't have an account? Sign up here!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
