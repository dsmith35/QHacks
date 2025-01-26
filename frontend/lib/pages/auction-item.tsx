import React, { useEffect, useState } from "react";
import { AuctionItem, useApi } from "../api";
import { Link, useParams } from "react-router-dom";
import { FullScreenLoading } from "../components/full-screen-loading";
import Chat from "../components/chat";
import PageNotFound from "./page-not-found";
import AuctionBidSection from "../components/auction-bid-section";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface Props {
  aucData?: AuctionItem;
}

const AuctionItemPage: React.FC<Props> = (props: Props) => {
  const { aucData: auctionItemData } = props;
  const { auction_item } = useParams<{ auction_item: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [aucData, setAucData] = useState<AuctionItem | undefined>();
  const [isPinned, setIsPinned] = useState(false);
  const { getAuctionItem, fetchPinnedItems, pinAuctionItem, unpinAuctionItem } = useApi();
  const [auctionOver, setAuctionOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const updateTimeLeft = () => {
      const now = dayjs();
      const endTime = dayjs(aucData?.end_time);

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
  }, [isLoading, aucData]);

  const getData = async () => {
    if (auction_item) {
      setIsLoading(true);
      try {
        const data = await getAuctionItem(auction_item);
        setAucData(data);

        const pinnedItems = await fetchPinnedItems();
        setIsPinned(pinnedItems.some((item) => item.id === data.id));
      } catch (error) {
        console.error("Error fetching auction item data:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setAucData(auctionItemData);
    }
  };

  const togglePin = async () => {
    if (!aucData) return;

    try {
      if (isPinned) {
        await unpinAuctionItem(aucData.id);
      } else {
        await pinAuctionItem(aucData.id);
      }
      setIsPinned(!isPinned);
    } catch (error) {
      console.error("Error toggling pin state:", error);
    }
  };

  if (isLoading) {
    return <FullScreenLoading />;
  }

  if (!aucData) {
    return <PageNotFound />;
  }

  return (
    <div>
      {/* Time Left Section */}
      <div className="text-4xl font-bold text-red-600 text-center mb-8">
        {timeLeft}
      </div>

      <main className="mx-auto max-w-screen-xl px-4 py-8 antialiased">
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="flex-1">
            <Link to="/auction-gallery">
              <button
                id="back-button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition duration-200"
              >
                Back
              </button>
            </Link>
            <br />

            {/* Centered Title, Availability, and Pin Button */}
            <div className="flex flex-col items-center mt-4 px-4">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {aucData.title}
              </h1>

              {/* Availability and Pin Button */}
              <div className="flex items-center mt-2">
                <p
                  className={`text-sm ${
                    aucData.available && !auctionOver
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {aucData.available && !auctionOver
                    ? "🟢 Available"
                    : "⚫ Listing Expired"}
                </p>
                
                <button
                  onClick={togglePin}
                  className={`ml-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
                    isPinned
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  } text-white`}
                  aria-label={isPinned ? "Unpin" : "Pin"}
                >
                  📌
                </button>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <img
                src={aucData.image}
                alt={aucData.title}
                className="w-80 h-auto object-contain rounded-lg border-4 border-gray-300 dark:border-gray-700"
              />
            </div>

            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                About
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {aucData.description}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Message Auctioneer
              </h2>
              <Chat />
            </section>
          </div>

          <aside className="md:w-1/3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Bids
            </h2>
            <AuctionBidSection
              aucId={aucData.id}
              auctionItem={aucData}
              setAuctionOver={setAuctionOver}
            />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AuctionItemPage;
