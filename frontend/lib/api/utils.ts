import type { Publication } from "./types";
import { ROUTES, useRouter } from "../routes";

export function getFilteredPublicationsEndpoint(
  args: {
    useTag: boolean;
    title: string;
    tag: string[];
  } = {
    useTag: false, //title or tag
    title: "",
    tag: [],
  }
) {
  const { title, tag, useTag } = args;

  return `/api/publications/filter/?${useTag ? 'tag' : 'title'}=${title}`;
}

export function getPaginatedFilteredPublicationsEndpoint(
  args: {
    title: string;
    tag: string[];
  } = {
    title: "",
    tag: [],
  }
) {
  const { title, tag } = args;

  return `/api/publications/p/filter/?title=${title}&tag=${tag ? tag : ""}`;
}

export function getPublicationEndpoint(slug: string) {
  return getPublicationsEndpoint + slug + "/";
}

export const getPublicationsEndpoint = "/api/publications/";
export const getPaginatedPublicationsEndpoint = getPublicationsEndpoint + "p/";

// sorting functions
export function sortByRating(publications: Publication[]): Publication[] {
  return publications.sort((a, b) => b.rating - a.rating);
}
export function sortByNumRatings(publications: Publication[]): Publication[] {
  return publications.sort((a, b) => b.num_ratings - a.num_ratings);
}

export function sortingMethodA(publications: Publication[]): Publication[] {
  // Filter publications into two separate arrays based on num_ratings condition
  const upToFourNumRatings = publications.filter(pub => pub.num_ratings <= 4);
  const fivePlusNumRatings = publications.filter(pub => pub.num_ratings > 4);

  // Sort each array based on the respective criteria
  const sortedUpToFour = upToFourNumRatings.sort((a, b) => b.num_ratings - a.num_ratings);
  const sortedFivePlus = fivePlusNumRatings.sort((a, b) => b.rating - a.rating);

  // Concatenate sorted arrays back together
  return [...sortedFivePlus, ...sortedUpToFour];
}

export async function fetchUserData(): Promise<any> {
  const apiUrl = 'http://127.0.0.1:8000/api/userinfo/';
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include HTTP-only cookies
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error('Failed to fetch user info.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export function getReviewsEndpoint(pubId: number) {
  return "/api/publications/" + pubId + "/reviews";
}

export function getUserDataEndpoint(userId: number) {
  return "/api/userinfo/public/" + userId;
}

export function getInvoiceEndpoint(orderNum: string) {
  return "/api/invoices/" + orderNum;
}

export function getOrdersEndpoint() {
  return "/api/orders/";
}

export function getOrderEndpoint(orderNum: string) {
  return "/api/orders/" + orderNum;
}

export function getCheckAuthEndpoint() {
  return "/api/auth/checkauth";
}

export function getInboxEndpoint() {
  return "/api/inbox";
}

export const loginUser = async (
  email: string,
  password: string,
  push: (path: string) => void,
  setErrors: (error: { [key: string]: string } | null) => void,
  setLoading: (loading: boolean) => void
) => {
  setLoading(true);

  const user = {
    email,
    password,
  };

  try {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      setErrors({ general: data.error || 'Login failed' });
      setLoading(false);
      return;
    }

    setErrors(null);
    push(ROUTES.LANDING_PAGE); // Redirect to landing page on successful login
  } catch (error) {
    setErrors({ general: 'An error occurred while processing your request.' });
    setLoading(false);
  }

  
};

export function getFilteredAuctionItemsEndpoint(
  args: {
    title: string;
  } = {
    title: "",
  }
) {
  const { title } = args;

  return `/api/auction-items/filter/?'title'=${title}`;
}

export function getPaginatedFilteredAuctionItemsEndpoint(
  args: {
    title: string;
  } = {
    title: "",
  }
) {
  const { title } = args;

  return `/api/auction-items/p/filter/?title=${title}`;
}

export function getAuctionItemEndpoint(slug: string) {
  return getAuctionItemsEndpoint + slug + "/";
}

export const getAuctionItemsEndpoint = "/api/auction-items/";
export const getPaginatedAuctionItemsEndpoint = getAuctionItemsEndpoint + "p/";

export function getBidsEndpoint(aucId: number) {
  return "/api/auction-items/" + aucId + "/bids";
}