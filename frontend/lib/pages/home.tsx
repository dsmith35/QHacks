import React, { Fragment, useEffect, useState } from "react";
import { HR, Spinner, Button } from "flowbite-react";
import { AuctionItem, useApi } from "../api";
import { AuctionPreviewSection } from "../components/auction-preview-section";
import OrderSection from "../components/orders-section";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

function HomePage() {
  const [auctionData, setAuctionData] = useState<AuctionItem[]>();
  const [isLoading, setIsLoading] = useState(false);
  const { fetchPinnedItems } = useApi();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    setIsLoading(true);
    try {
      const pinnedItems = await fetchPinnedItems();
      setAuctionData(pinnedItems);
    } catch (error) {
      console.error("Error fetching pinned auction items:", error);
      setAuctionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <HR />
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="text-xl font-bold">Welcome to QVault</h1>
        <Link to={ROUTES.AUCTION_GALLERY_PAGE}>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-4 py-2">
            See All Listings
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <Spinner aria-label="Loading pinned auction items" />
      ) : (
        <AuctionPreviewSection data={auctionData} />
      )}
      <br />
      <OrderSection />
    </Fragment>
  );
}

export { HomePage as default };
