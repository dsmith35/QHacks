// src/components/SignUpForm.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, useRouter } from "../routes";
import { loginUser } from '../api';

const SignUpForm: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password1, setPassword1] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [passwordsMatchError, setPasswordsMatchError] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const { push } = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({});
    setPasswordsMatchError('');
    setLoading(true);

    // Validate password match
    if (password1 !== password2) {
      setPasswordsMatchError('Passwords do not match');
      setLoading(false);
      return;
    }

    const user = {
      first_name: firstName,
      last_name: lastName,
      email,
      password1,
      password2,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        // Optionally, you can clear form fields here
        // Clear any existing errors
        setErrors({});

        // Automatically log in the user after successful registration
        await loginUser(email, password1, push, setErrors, setLoading);
      } else {
        // Handle specific field errors
        const errorObj: { [key: string]: string } = {};
        Object.keys(data).forEach(key => {
          errorObj[key] = data[key][0]; // Assuming API returns first error message for each field
        });
        setErrors(errorObj);
        setLoading(false);
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while processing your request.' });
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error message for the input field on change
    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[name];
      return updatedErrors;
    });
    // Clear passwords match error when either password input changes
    if (name === 'password1' || name === 'password2') {
      setPasswordsMatchError('');
    }

    // Update state with the new input value
    switch (name) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password1':
        setPassword1(value);
        break;
      case 'password2':
        setPassword2(value);
        break;
      default:
        break;
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
          <h1 className="text-2xl font-semibold mb-4 text-center">Create Account</h1>
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
          {/* First Name Field */}
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-gray-700">
              First Name:
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={firstName}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors && errors.firstName && (
              <div className="mt-1 text-red-500 text-sm">{errors.firstName}</div>
            )}
          </div>
          {/* Last Name Field */}
          <div className="mb-4">
            <label htmlFor="lastName" className="block text-gray-700">
              Last Name:
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={lastName}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors && errors.lastName && (
              <div className="mt-1 text-red-500 text-sm">{errors.lastName}</div>
            )}
          </div>
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
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors && errors.email && (
              <div className="mt-1 text-red-500 text-sm">{errors.email}</div>
            )}
          </div>
          {/* Password1 Field */}
          <div className="mb-4">
            <label htmlFor="password1" className="block text-gray-700">
              Password:
            </label>
            <input
              id="password1"
              name="password1"
              type="password"
              value={password1}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                errors.password1 ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors && errors.password1 && (
              <div className="mt-1 text-red-500 text-sm">{errors.password1}</div>
            )}
          </div>
          {/* Password2 Field */}
          <div className="mb-4">
            <label htmlFor="password2" className="block text-gray-700">
              Confirm Password:
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              value={password2}
              required
              onChange={handleInputChange}
              className={`mt-1 p-2 w-full border ${
                passwordsMatchError ? 'border-red-500' : 'border-gray-300'
              } rounded focus:outline-none focus:ring-2 focus:ring-blue-400`}
            />
            {errors && passwordsMatchError && (
              <div className="mt-1 text-red-500 text-sm">{passwordsMatchError}</div>
            )}
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        {/* Link to Log in Page */}
        <div className="mt-4 text-center">
          <Link to={ROUTES.LOG_IN_PAGE} className="text-blue-500 hover:underline">
            Already have an account? Log in here!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
