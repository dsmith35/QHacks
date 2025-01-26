import React, { useEffect, useState } from "react";
import { Button, Card } from "flowbite-react";
import { AuctionItem, useApi } from "../api";
import { useRouter } from "../routes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

interface Props {
  data: AuctionItem;
}

export function AuctionListingPreview(props: Props) {
  const { data } = props;
  const { push } = useRouter();
  const { pinAuctionItem, unpinAuctionItem, getUserId } = useApi(); // Add getUserId from API

  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isPinned, setIsPinned] = useState<boolean>(false); // Initially false
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch current user ID on component mount
    const fetchUserId = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);

        // Check if the current user has pinned this item
        if (userId && data.pinned_by.includes(userId)) {
          setIsPinned(true);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserId();
  }, [data.pinned_by]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = dayjs();
      const endTime = dayjs(data.end_time);

      if (!endTime.isValid()) {
        setTimeLeft("Invalid end time");
        return;
      }

      const diff = endTime.diff(now);

      if (diff <= 0) {
        setTimeLeft("Auction ended");
      } else {
        setTimeLeft(dayjs.duration(diff).format(diff >= 86400000 ? "D[d] HH:mm:ss" : "HH:mm:ss"));
      }
    };

    updateTimeLeft(); // Initial calculation
    const timer = setInterval(updateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [data.end_time]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const togglePin = async () => {
    try {
      if (isPinned) {
        await unpinAuctionItem(data.id); // Unpin the item
      } else {
        await pinAuctionItem(data.id); // Pin the item
      }
      setIsPinned(!isPinned); // Toggle the pinned state
    } catch (error) {
      console.error("Error toggling pin state:", error);
    }
  };
  return (
    <Card className="relative max-w-sm mt-4 w-64 flex flex-col justify-between rounded-lg shadow-md">
      {/* Pin button */}
      <button
      onClick={togglePin}
      className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded ${
        isPinned ? "bg-red-500 hover:bg-red-600" : "bg-gray-300 hover:bg-gray-400"
      } text-white`}
      aria-label={isPinned ? "Unpin" : "Pin"}
      >
      📌
      </button>

      <div className="h-40 w-full overflow-hidden rounded-lg">
        <img
          src={data.image}
          alt={data.description}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col space-y-2 flex-grow">
        <h5 className="text-lg font-semibold text-blue-900 dark:text-white truncate">
          {data.title}
        </h5>
        <p className="text-sm text-gray-700 dark:text-gray-400 line-clamp-3">
          {data.description}
        </p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
          Highest Bid:{" "}
          <span className="text-blue-600">${formatCurrency(data.highest_bid)}</span>
          {currentUserId && (currentUserId === data.highest_bid_user) ? (<b> (You)</b>) : (null)}
        </p>
        <p className="text-sm font-medium text-red-600">
          Time Left: <span>{timeLeft}</span>
        </p>
      </div>
      <div className="p-4 flex justify-between items-center">
        <Button
          onClick={() => push("/auction-gallery/" + data.slug)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md py-2"
        >
          View Details
          <svg
            className="-mr-1 ml-2 h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
