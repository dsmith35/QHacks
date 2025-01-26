import React from "react";

export function Footer() {
  return (
    <footer className="bg-gray-900 py-6 px-4 text-center text-gray-400">
      <div className="container mx-auto">
        <p className="text-sm">
          QHACKS 2025
        </p>
        <nav className="mt-2">
          <ul className="flex justify-center space-x-6">
            <li>
              <a
                href="/about"
                className="hover:text-white transition-colors duration-200"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="hover:text-white transition-colors duration-200"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="hover:text-white transition-colors duration-200"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
