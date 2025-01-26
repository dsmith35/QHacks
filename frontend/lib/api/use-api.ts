import {
  getPaginatedPublicationsEndpoint,
  getPublicationsEndpoint,
  getPublicationEndpoint,
  getFilteredPublicationsEndpoint,
  getPaginatedFilteredPublicationsEndpoint,
  sortingMethodA,
  getReviewsEndpoint,
  getUserDataEndpoint,
  getInvoiceEndpoint,
  getOrdersEndpoint,
  getOrderEndpoint,
  getCheckAuthEndpoint,
  getInboxEndpoint,
  getPaginatedAuctionItemsEndpoint,
  getAuctionItemsEndpoint,
  getAuctionItemEndpoint,
  getFilteredAuctionItemsEndpoint,
  getPaginatedFilteredAuctionItemsEndpoint,
  getBidsEndpoint,
} from "./utils";
import { getSecrets } from "../config";
import type { GetPaginatedPublicationsResponse, Publication, Review, UserData, Invoice, Order, Inbox,
  GetPaginatedAuctionItemsResponse, AuctionItem,
  AuctionBid
 } from "./types";

import dayjs from 'dayjs';

const { isProd, authToken } = getSecrets();

const LOCAL_API_URL = "http://127.0.0.1:8000";


export function useApi() {
  const getHeaders = new Headers({
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    Authorization: "Token " + authToken,
  });

  async function getPublications(
    args: {
      useTag: boolean;
      title: string;
      tag: string[];
    } = {
      useTag: false,
      title: "",
      tag: [],
    }
  ): Promise<Publication[]> {
    const endpoint = (() => {
      const shouldFilter = args.tag && args.title;

      if (isProd) {
        if (shouldFilter) {
          return getFilteredPublicationsEndpoint(args);
        }

        return getPublicationsEndpoint;
      }

      if (shouldFilter) {
        return LOCAL_API_URL + getFilteredPublicationsEndpoint(args);
      }

      return LOCAL_API_URL + getPublicationsEndpoint;
    })();

    const response = await fetch(endpoint, {
      cache: "default",
      method: "GET",
      headers: getHeaders,
      // credentials: 'include',
    });
  
    let publications: Publication[] = await response.json();

    // Filter out publications with visible set to false
    publications = publications.filter(publication => publication.visible);
  
    publications = sortingMethodA(publications);
  
    return publications;
  }

  async function getPaginatedPublications(args?: {
    page?: number;
    querystring?: string;
    filter?: {
      title?: string;
      tags?: string[];
    }
  }): Promise<GetPaginatedPublicationsResponse> {
    const endpoint = (() => {
      if (!args) {
        if (isProd) {
          return getPaginatedPublicationsEndpoint;
        }
        return LOCAL_API_URL + getPaginatedPublicationsEndpoint;
      }
  
      if (args.querystring) {
        return args.querystring;
      }
  
      if (args.page && !args.filter) {
        if (isProd) {
          return getPaginatedPublicationsEndpoint + `?page=${args.page}`;
        }
        return LOCAL_API_URL + getPaginatedPublicationsEndpoint + `?page=${args.page}`;
      } else if (args.filter) {
        let filterEndpoint;
        if (isProd) {
          filterEndpoint = getPaginatedFilteredPublicationsEndpoint({
            title: args.filter.title,
            tag: args.filter.tags,
          });
        } else {
          filterEndpoint = LOCAL_API_URL + getPaginatedFilteredPublicationsEndpoint({
            title: args.filter.title,
            tag: args.filter.tags,
          });
        }
        return filterEndpoint;
      }
    })();
  
    const response = await fetch(endpoint, {
      cache: "default",
      method: "GET",
      headers: getHeaders,
      // credentials: 'include',
    });
  
    let paginatedResponse: GetPaginatedPublicationsResponse = await response.json();
  
    // Filter out publications with visible set to false
    paginatedResponse.results = paginatedResponse.results.filter((publication) => publication.visible);
    paginatedResponse.results = paginatedResponse.results.filter((publication) => publication.available);
  
    // Sort the publications within the paginated response
    paginatedResponse.results = sortingMethodA(paginatedResponse.results);
  
    return paginatedResponse;
  }
  

  async function getPublication(slug: string): Promise<Publication> {
    try {
      const response = await fetch(
        isProd ? getPublicationEndpoint(slug) : LOCAL_API_URL + getPublicationEndpoint(slug),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          // credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        return await response.json();
      } else {
        console.error(`Failed to fetch publication. Status: ${response.status}`);
        return; // Return an empty array if response status is not 200
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return; // Return an empty array if there's an error
    }
  }

  async function getReviews(pubId: number, page: number = 1): Promise<Review[]> {
    try {
      const response = await fetch(
        `${isProd ? getReviewsEndpoint(pubId) : LOCAL_API_URL + getReviewsEndpoint(pubId)}?page=${page}`,
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          // credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        const data = await response.json();
        return data.results; // Assuming the API returns a paginated response with `results`
      } else {
        console.error(`Failed to fetch reviews. Status: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }
  

  

  async function getUserData(userId: number): Promise<UserData> {
    try {
      const response = await fetch(
        isProd ? getUserDataEndpoint(userId) : LOCAL_API_URL + getUserDataEndpoint(userId),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          // credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        return await response.json();
      } else {
        console.error(`Failed to fetch user data. Status: ${response.status}`);
        return; // Return an empty array if response status is not 200
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return; // Return an empty array if there's an error
    }
  }

  async function getInvoice(orderNum: string): Promise<Invoice | false> {
    try {
      const invoiceResponse = await fetch(
        isProd ? getInvoiceEndpoint(orderNum) : LOCAL_API_URL + getInvoiceEndpoint(orderNum),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          credentials: 'include',
        }
      );
  
      if (invoiceResponse.status !== 200) {
        console.error(`Failed to fetch invoice data. Status: ${invoiceResponse.status}`);
        return false;
      }
  
      const invoice = await invoiceResponse.json();
  
      const orderResponse = await fetch(
        isProd ? getOrderEndpoint(orderNum) : LOCAL_API_URL + getOrderEndpoint(orderNum),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          credentials: 'include',
        }
      );
  
      if (orderResponse.status !== 200) {
        console.error(`Failed to fetch order data. Status: ${orderResponse.status}`);
        return false;
      }
  
      const order = await orderResponse.json();
  
      return { ...invoice, invoice_paid: order.invoice_paid };
    } catch (error) {
      console.error('Error fetching invoice or order data:', error);
      return false;
    }
  }
  
  
  
  async function getOrders(): Promise<Order[]> {
    try {
      const response = await fetch(
        isProd ? getOrdersEndpoint() : LOCAL_API_URL + getOrdersEndpoint(),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        return await response.json();
      } else {
        console.error(`Failed to fetch user data. Status: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return [];
    }
  }

  async function getIsAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(
        isProd ? getCheckAuthEndpoint() : LOCAL_API_URL + getCheckAuthEndpoint(),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        return await response.json();
      } else {
        console.error(`Failed to fetch data. Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return false;
    }
  }

  async function getInbox(): Promise<Inbox> {
    try {
      const response = await fetch(
        isProd ? getInboxEndpoint() : LOCAL_API_URL + getInboxEndpoint(),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        return await response.json();
      } else {
        console.error(`Failed to fetch data. Status: ${response.status}`);
        return;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      return;
    }
  }

  async function getAuctionItems(
    args: {
      userId: number; // Current authenticated user's ID
    }
  ): Promise<AuctionItem[]> {
    const endpoint = (() => {
      return isProd
        ? getAuctionItemsEndpoint
        : LOCAL_API_URL + getAuctionItemsEndpoint;
    })();
  
    const response = await fetch(endpoint, {
      cache: "default",
      method: "GET",
      headers: getHeaders,
    });
  
    if (!response.ok) {
      console.error(`Failed to fetch auction items. Status: ${response.status}`);
      return [];
    }
  
    let auction_items: AuctionItem[] = await response.json();
  
    // Filter to only include items pinned by the current user
    auction_items = auction_items.filter((item) =>
      item.pinned_by.includes(args.userId)
    );
  
    return auction_items;
  }
  

  async function getPaginatedAuctionItems(args?: {
    page?: number;
    querystring?: string;
    filter?: {
      title?: string;
      tags?: string[];
    }
  }): Promise<GetPaginatedAuctionItemsResponse> {
    const endpoint = (() => {
      if (!args) {
        if (isProd) {
          return getPaginatedAuctionItemsEndpoint;
        }
        return LOCAL_API_URL + getPaginatedAuctionItemsEndpoint;
      }
  
      if (args.querystring) {
        return args.querystring;
      }
  
      if (args.page && !args.filter) {
        if (isProd) {
          return getPaginatedAuctionItemsEndpoint + `?page=${args.page}`;
        }
        return LOCAL_API_URL + getPaginatedAuctionItemsEndpoint + `?page=${args.page}`;
      } else if (args.filter) {
        let filterEndpoint;
        if (isProd) {
          filterEndpoint = getPaginatedFilteredAuctionItemsEndpoint({
            title: args.filter.title,
          });
        } else {
          filterEndpoint = LOCAL_API_URL + getPaginatedFilteredAuctionItemsEndpoint({
            title: args.filter.title,
          });
        }
        return filterEndpoint;
      }
    })();
  
    const response = await fetch(endpoint, {
      cache: "default",
      method: "GET",
      headers: getHeaders,
      // credentials: 'include',
    });
  
    let paginatedResponse: GetPaginatedAuctionItemsResponse = await response.json();
  
    // Filter out auction items with visible set to false
    paginatedResponse.results = paginatedResponse.results.filter((auction_item) => auction_item.visible);
    paginatedResponse.results = paginatedResponse.results.map((auction_item) => {
      const endTime = dayjs(auction_item.end_time); // Convert end_time to a Day.js object
      const isAvailable = endTime.isAfter(dayjs()); // Determine if the publication is still active
      return {
          ...auction_item,
          available: isAvailable, // Dynamically set the is_available field
      };
  }).filter((auction_item) => auction_item.available); // Filter only available
  
    // Sort the auction items within the paginated response
    // paginatedResponse.results = sortingMethodA(paginatedResponse.results);
  
    return paginatedResponse;
  }
  
  async function getAuctionItem(slug: string): Promise<AuctionItem | undefined> {
    try {
      const response = await fetch(
        isProd ? getAuctionItemEndpoint(slug) : LOCAL_API_URL + getAuctionItemEndpoint(slug),
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
        }
      );
  
      if (response.status === 200) {
        const auctionItem = await response.json();
  
        // Dynamically calculate and set available
        const endTime = dayjs(auctionItem.end_time); // Convert end_time to a Day.js object
        auctionItem.available = endTime.isAfter(dayjs()); // Determine availability based on current time
  
        return auctionItem;
      } else {
        console.error(`Failed to fetch auction item. Status: ${response.status}`);
        return undefined; // Return undefined if response status is not 200
      }
    } catch (error) {
      console.error('Error fetching auction item:', error);
      return undefined; // Return undefined if there's an error
    }
  }
  
  async function getBids(aucId: number, page: number = 1): Promise<AuctionBid[]> {
    try {
      const response = await fetch(
        `${isProd ? getBidsEndpoint(aucId) : LOCAL_API_URL + getBidsEndpoint(aucId)}?page=${page}`,
        {
          cache: "default",
          method: "GET",
          headers: getHeaders,
          // credentials: 'include',
        }
      );
  
      if (response.status === 200) {
        const data = await response.json();
        return data.results; // Assuming the API returns a paginated response with `results`
      } else {
        console.error(`Failed to fetch bids. Status: ${response.status}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      return [];
    }
  }

  async function placeBid(
    aucId: number,
    bidAmount: number,
  ): Promise<AuctionBid | null> {
    try {
      const response = await fetch(
        `${isProd ? getBidsEndpoint(aucId)+'/' : LOCAL_API_URL + getBidsEndpoint(aucId)+'/'}`,
        {
          method: "POST",
          headers: {
            ...getHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ auction_item: aucId, bid_amount: bidAmount}),
          credentials: 'include',
        }
      );
  
      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        return data; // Assuming the API returns the created bid object
      } else {
        const errorData = await response.json();
        console.error(`Failed to place bid. Status: ${response.status}`, errorData);
        return null;
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      return null;
    }
  }

  async function getUserId(): Promise<number | null> {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/userinfo/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include HTTP-only cookies
      });
  
      if (!response.ok) {
        console.error(`Failed to fetch user info. Status: ${response.status}`);
        return null;
      }
  
      const userInfo = await response.json();
      return userInfo.id; // Assuming `id` is the field containing the user ID
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  async function fetchPinnedItems() {
    const userId = await getUserId();

    if (!userId) {
      console.error('User ID could not be retrieved');
      return [];
    }

    const pinnedItems = await getAuctionItems({ userId });

    return pinnedItems;
  }

  async function pinAuctionItem(auctionId: number): Promise<void> {
    await fetch(`http://127.0.0.1:8000/api/auction-items/${auctionId}/pin/`, {
      method: "POST",
      credentials: "include",
    });
  }
  
  async function unpinAuctionItem(auctionId: number): Promise<void> {
    await fetch(`http://127.0.0.1:8000/api/auction-items/${auctionId}/unpin/`, {
      method: "POST",
      credentials: "include",
    });
  }

  async function updateOrderComplete(orderNum: string, isPaid: boolean): Promise<void> {
    try {
      const response = await fetch(
        `${isProd ? getOrderEndpoint(orderNum) : LOCAL_API_URL + getOrderEndpoint(orderNum)}/`,
        {
          method: "POST",
          headers: {
            ...getHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ invoice_paid: isPaid }),
          credentials: "include",
        }
      );
  
      if (!response.ok) {
        console.error(`Failed to update order. Status: ${response.status}`);
        throw new Error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order complete status:", error);
      throw error; // Re-throw error to handle in the calling function
    }
  }
  
  
  


  return {
    getPublications,
    getPaginatedPublications,
    getPublication,
    getReviews,
    getUserData,
    getInvoice,
    getOrders,
    getIsAuthenticated,
    getInbox,
    getAuctionItems,
    getPaginatedAuctionItems,
    getAuctionItem,
    getBids,
    placeBid,
    getUserId,
    fetchPinnedItems,
    pinAuctionItem,
    unpinAuctionItem,
    updateOrderComplete,
  };
}

