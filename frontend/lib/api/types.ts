interface TextBlock {
  title: string;
  body: string;
  description?: string;
}

export interface Publication extends TextBlock {
  id: number;
  slug: string;
  created_at: string;
  tag: string[];
  image: string;
  description: string;
  rating: number;
  num_ratings: number;
  phone: string;
  about: string;
  visible: boolean;
  available: boolean;
  hr_rate: number;
}

export interface GetPaginatedPublicationsResponse {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: Publication[];
}

export interface UserData {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface Review {
  user: number;
  publication: number;
  rating: number;
  comment: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
}


export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}


export interface Invoice {
  order_number: string;
  sender: number;
  recipient: number;
  created_at: string;
  items: InvoiceItem[];
  total_cost: number;
  complete: boolean;
  invoice_paid: boolean;
  sender_first_name: string | null;
  sender_last_name: string | null;
  recipient_first_name: string | null;
  recipient_last_name: string | null;
}

export interface Order {
  order_number: string;
  sender: number;
  recipient: number;
  created_at: string;
  sender_first_name: string | null;
  sender_last_name: string | null;
  recipient_first_name: string | null;
  recipient_last_name: string | null;
  complete: boolean;
  invoice_ready: boolean;
  invoice_paid: boolean;
}

export interface InboxMessage {
  content: string;
  redirect: string;
  created_at: string;
}

export interface Inbox {
  user: string;
  count: number;
  messages: InboxMessage[];
}

export interface AuctionItem {
  id: number;
  seller: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  min_bid_increment: number;
  starting_price: number;
  duration: number;
  highest_bid: number;
  highest_bid_user: number;
  visible: boolean;
  available: boolean;
  end_time: number;
  created_at: number;
  pinned_by: number[];
}

export interface GetPaginatedAuctionItemsResponse {
  count: number;
  current_page: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: AuctionItem[];
}

export interface AuctionBid {
  id: number;
  bidder: number;
  auction_item: AuctionItem;
  bid_amount: number;
  first_name: string | null;
  last_name: string | null;
  created_at: number;
}