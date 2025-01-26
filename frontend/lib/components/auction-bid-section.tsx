import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import { AuctionBid, AuctionItem, useApi } from "../api";
import { FullScreenLoading } from "./full-screen-loading";

dayjs.extend(relativeTime);
dayjs.extend(duration);

interface Props {
  aucId: number;
  auctionItem: AuctionItem;
  setAuctionOver: (isOver: boolean) => void;
}

const AuctionBidSection: React.FC<Props> = ({ aucId, auctionItem, setAuctionOver }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [rawBidData, setRawBidData] = useState<AuctionBid[]>([]);
  const [bidData, setBidData] = useState<AuctionBid[]>([]);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [bidPage, setBidPage] = useState<number>(1);
  const [newBid, setNewBid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successBid, setSuccessBid] = useState<AuctionBid | null>(null);

  const { getBids, getUserData, placeBid } = useApi();
  const BID_PAGE_MAX_LENGTH = 5;

  useEffect(() => {
    const updateTimeLeft = () => {
      const endTime = dayjs(auctionItem.end_time);
      const now = dayjs();
      const diff = endTime.diff(now);

      if (diff <= 0) {
        setTimeLeft("Auction ended");
        setAuctionOver(true);
      } else {
        const formattedTime = dayjs.duration(diff).format(diff >= 86400000 ? "D[d] HH:mm:ss" : "HH:mm:ss");
        setTimeLeft(formattedTime);
      }
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auctionItem]);

  useEffect(() => {
    const fetchBids = async () => {
      setInitialLoading(true);
      try {
        const bids = await getBids(aucId, 1);
        setRawBidData(bids);
        setBidPage(1);
        setHasMore(bids.length >= BID_PAGE_MAX_LENGTH);
      } catch (error) {
        console.error("Error fetching bids:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBids();
  }, [aucId]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (rawBidData.length > 0) {
        const promises = rawBidData.map(async (bid) => {
          if (!bid.first_name && !bid.last_name) {
            try {
              const userData = await getUserData(bid.bidder);
              return { ...bid, first_name: userData.first_name, last_name: userData.last_name };
            } catch (error) {
              console.error("Error fetching user data for bid:", error);
              return bid;
            }
          } else {
            return bid;
          }
        });
        const updatedBids = await Promise.all(promises);
        setBidData(updatedBids);
      } else {
        setBidData([]);
      }
    };

    fetchUserNames();
  }, [rawBidData]);

  useEffect(() => {
    if (bidData.length > 0 || rawBidData.length === 0) {
      setInitialLoading(false);
    }
    if (bidPage !== 1) {
      setLoadingMore(false);
    }
  }, [bidData, rawBidData.length, bidPage]);

  useEffect(() => {
    
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/auction/${aucId}/`);
    ws.onopen = () => console.log('WebSocket connected');
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket closed');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newBid = data.bid;
      setBidData((prevBids) => [newBid, ...prevBids]);
    };

    return () => {
      ws.close();
    };
  }, [aucId]);

  const loadMoreBids = async () => {
    setLoadingMore(true);
    try {
      const nextPage = bidPage + 1;
      const bids = await getBids(aucId, nextPage);
      setRawBidData((prevBids) => [...prevBids, ...bids]);
      setBidPage(nextPage);
      setHasMore(bids.length >= BID_PAGE_MAX_LENGTH);
    } catch (error) {
      console.error("Error fetching more bids:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    setSuccessBid(null);

    if (timeLeft == "Auction ended") {
      setSubmissionError(`This auction listing has expired.`);
      setIsSubmitting(false);
      return;
    }
    const parsedBid = parseFloat(newBid);
    if (isNaN(parsedBid) || parsedBid <= 0) {
      setSubmissionError("Please enter a valid bid amount.");
      setIsSubmitting(false);
      return;
    }
    if (parsedBid < auctionItem.highest_bid + auctionItem.min_bid_increment) {
      setSubmissionError(`Minimum bid is $${auctionItem.highest_bid + auctionItem.min_bid_increment}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const placedBid = await placeBid(aucId, parsedBid);

      if (placedBid) {
        setBidData((prevBids) => [placedBid, ...prevBids]);
        setRawBidData((prevBids) => [placedBid, ...prevBids]);
        setSuccessBid(placedBid);
        setNewBid("");
      } else {
        setSubmissionError("Failed to place bid. Are you signed in?");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setSubmissionError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return <FullScreenLoading />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="auction-bid-section p-4 bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="mb-6">
        {timeLeft !== "Auction ended" ? (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Place Your Bid ($)</h2>
            <form
            onSubmit={handleBidSubmit}
            className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3"
            >
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={newBid}
              onChange={(e) => setNewBid(e.target.value)}
              placeholder="Enter your bid"
              className="flex-grow px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-1.5 text-sm font-medium rounded-md transition-all ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Place Bid"}
            </button>
          </form>
        </div>
        ) : (
          <h2 className="text-xl font-bold text-gray-800 mb-3">Bidding is Over</h2>
        )}
        {submissionError && <p className="text-red-500 mt-2 text-sm">{submissionError}</p>}
        {successBid && (
          <div className="mt-3 bg-green-100 p-3 rounded-md border border-green-200 text-sm">
            <p className="text-green-800 font-medium">Bid placed successfully!</p>
            <p>
              <strong>Bid Amount:</strong> ${formatCurrency(successBid.bid_amount)}
            </p>
            <p>
              <strong>Time:</strong> {dayjs(successBid.created_at).format("MMMM D, YYYY h:mm A")}
            </p>
          </div>
        )}
      </div>

      {bidData.length > 0 && (
        <div className="winner-box bg-yellow-50 p-4 rounded-md border border-yellow-300 shadow-md mb-6">
          {timeLeft !== "Auction ended" ? (
          <p className="text-sm text-gray-500 mb-2">
            Auction ends in: <span className="font-semibold">{timeLeft}</span>
          </p>
          ) : (
            <p>{timeLeft}</p>
          )}
          {timeLeft !== "Auction ended" ? (
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Highest Bidder</h3>
          ) : (
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Winner</h3>
          )}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full flex items-center justify-center bg-yellow-300 text-yellow-800 font-bold">
                {bidData[0]?.first_name?.charAt(0).toUpperCase() || ""}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">
                {bidData[0]?.first_name} {bidData[0]?.last_name ? bidData[0]?.last_name.charAt(0) + "." : ""}
              </p>
              <p className="text-sm text-gray-600">
                Bid: <strong>${formatCurrency(bidData[0]?.bid_amount)}</strong>
              </p>
              <p className="text-xs text-gray-500">{dayjs(bidData[0]?.created_at).fromNow()}</p>
            </div>
          </div>
        </div>
      )}

      {bidData.length > 0 ? (
        <div className="bg-gray-50 p-3 rounded-md">
          <ul>
            {bidData.map((bid, index) => (
              <React.Fragment key={bid.id}>
                <li className="flex items-center space-x-3 p-3 rounded-md transition-transform transform hover:bg-gray-100">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm bg-blue-100 text-blue-600">
                      {bid.first_name ? bid.first_name.charAt(0).toUpperCase() : ""}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {bid.first_name} {bid.last_name ? bid.last_name.charAt(0) + "." : ""}
                      </h3>
                      <span className="text-xs text-gray-500">{dayjs(bid.created_at).fromNow()}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed a bid of <strong>${formatCurrency(bid.bid_amount)}</strong>
                    </p>
                  </div>
                </li>
                {index < bidData.length - 1 && <hr className="my-1 border-gray-200" />}
              </React.Fragment>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No bids yet. Be the first to bid!</p>
      )}

      <div className="mt-4 flex justify-center">
        {loadingMore ? (
          <FullScreenLoading />
        ) : (
          hasMore && bidData.length > 0 && (
            <button
              className="px-4 py-1.5 bg-gray-100 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-200"
              onClick={loadMoreBids}
            >
              Load More Bids
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default AuctionBidSection;