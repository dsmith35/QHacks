import React, { useEffect, useState, useRef } from "react";
import { MegaMenu, Navbar } from "flowbite-react";
import { ROUTES, useRouter } from "../routes";
import Inbox from "./inbox"; // Ensure this matches the filename

export function Topbar() {
  const { push, pathname } = useRouter();
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true); // Start with true to show loading state
  const [showInbox, setShowInbox] = useState(false); // State to manage inbox dropdown visibility
  const inboxRef = useRef<HTMLDivElement>(null); // Ref for the inbox dropdown

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/userinfo/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include HTTP-only cookies
        });

        if (response.ok) {
          const data = await response.json();
          setFirstName(data.first_name);
        } else {
          console.error('Failed to fetch user info. Are you logged in?');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false); // Set loading to false when data fetching is done
      }
    };

    fetchUserInfo();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inboxRef.current && !inboxRef.current.contains(event.target as Node)) {
        setShowInbox(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [inboxRef]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
      });

      if (response.ok) {
        setFirstName(""); // Clear name on successful logout
        push(ROUTES.LANDING_PAGE); // Redirect to home page after logout
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const logged_in_as = firstName ? (
    <div className="text-gray-400">Hello, <b>{firstName}!</b></div>
  ) : (
    <div />
  );

  return (
    <MegaMenu className="bg-gray-900">
      <div className={`mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4 md:space-x-8 w-full 
        ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Navbar.Brand className="cursor-pointer" onClick={() => push("/")}>
          <img
            alt="Django + React logo"
            src="/logo-512.png"
            className="mr-3 h-6 sm:h-9"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-400">
            QVault
          </span>
        </Navbar.Brand>

        {loading ? (
          <div className="flex items-center text-gray-400">Loading...</div>
        ) : (
          <>
            {logged_in_as}
            <Navbar.Toggle />
            <Navbar.Collapse>
              <Navbar.Link className="cursor-pointer text-gray-400"
                onClick={() => push(ROUTES.LANDING_PAGE)}> 
                Home 
              </Navbar.Link>
              <Navbar.Link className="cursor-pointer text-gray-400"
                onClick={() => push(ROUTES.AUCTION_GALLERY_PAGE)}>
                Auction
              </Navbar.Link>
              {firstName ? (
                <>
                  <div>
                    <Navbar.Link
                      onClick={() => setShowInbox(true)}
                      className="relative cursor-pointer text-gray-400"
                    >
                      Inbox
                    </Navbar.Link>
                    {showInbox && (
                      <div
                        ref={inboxRef}
                        className="absolute right-20 mt-2 w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-50"
                      >
                        <Inbox onClose={() => setShowInbox(false)} />
                      </div>
                    )}
                  </div>
                  <Navbar.Link className="cursor-pointer text-gray-400"
                  onClick={() => push(ROUTES.PROFILE_PAGE)}>
                  Profile
                  </Navbar.Link>
                  <Navbar.Link className="cursor-pointer text-gray-400"
                    onClick={handleLogout}>
                    Logout
                  </Navbar.Link>
                </>
              ) : (
                <>
                  <Navbar.Link className="cursor-pointer text-gray-400"
                    onClick={() => push(ROUTES.LOG_IN_PAGE)}>
                    Log In
                  </Navbar.Link>
                  <Navbar.Link className="cursor-pointer text-gray-400"
                    onClick={() => push(ROUTES.SIGN_UP_PAGE)}>
                    Sign Up
                  </Navbar.Link>
                </>
              )}
            </Navbar.Collapse>
          </>
        )}
      </div>
    </MegaMenu>
  );
}
