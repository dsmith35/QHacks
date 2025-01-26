import React, { Fragment, useEffect, useState } from "react";
import { type UserData, fetchUserData, useApi } from "../api";
import { useRouter } from "../routes";


function ProfilePage() {
  const { push, pathname } = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


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
          setUserData(data);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setLoading(false); // Set loading to false when data fetching is done
      }
    };

    fetchUserInfo();

    // Cleanup function to prevent memory leaks
    return () => {
      // Optional cleanup code here if needed
    };
  }, [pathname]);

  return (
    <Fragment>
      {loading ? (
        <p>Loading...</p> // Show loading message while fetching data
      ) : userData ? (
        <div>
          <p>Name: {userData.first_name} {userData.last_name}</p>
          <p>Email: {userData.email}</p>
        </div>
      ) : (
        <p>No user data available. Please log in.</p> // Handle case where data is not fetched
      )}
    </Fragment>
  );
}

export { ProfilePage as default };