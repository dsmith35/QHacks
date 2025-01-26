import React, { useState, useEffect } from "react";
import { type AuctionItem, useApi } from "../api";
import { useDebounce } from "../hooks";
import { AuctionListingPreview } from "./auction-listing-preview";
import { FullScreenLoading } from "./full-screen-loading";
import { BlogHeader } from "./blog-header";

interface IProps {
  data: AuctionItem[] | undefined;
}

export function AuctionPreviewSection(props: IProps) {
  const { data: auctionData } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<AuctionItem[]>(auctionData);
  const { fetchPinnedItems } = useApi(); // Import the fetchPinnedItems function

  useEffect(() => {
    setData(auctionData);
  }, []);

  const getData = async () => {
    setIsLoading(true);
    try {
      const pinnedItems = await fetchPinnedItems(); // Fetch pinned items directly
      setData(pinnedItems);
    } catch (error) {
      console.error("Error fetching pinned auction items:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading ? <FullScreenLoading /> : null}
      <div className="grid grid-cols-4 gap-4">
        {data && data.length > 0
          ? data.map((auctionData, index) => {
              return (
              <div>
                <h1>Pinned Listings</h1>
                <AuctionListingPreview data={auctionData} key={index} />
              </div>);
            })
          : null}
      </div>
    </div>
  );
}
