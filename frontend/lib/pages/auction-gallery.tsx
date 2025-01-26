import React, { useEffect, useState } from "react";
import {
  type GetPaginatedAuctionItemsResponse,
  type AuctionItem,
  useApi,
} from "../api";
import { useDebounce } from "../hooks";
import { AuctionListingPreview } from "../components/auction-listing-preview";
import { FullScreenLoading } from "../components/full-screen-loading";
import { BlogHeader } from "../components/blog-header";

interface IProps {
  paginatedAuctionItems?: GetPaginatedAuctionItemsResponse;
  auctionItem?: AuctionItem;
}

function AuctionGalleryPage(props: IProps) {
  const { paginatedAuctionItems, auctionItem } = props;
  const [data, setData] = useState<GetPaginatedAuctionItemsResponse>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { getPaginatedAuctionItems } = useApi();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    getData();
  }, []);
  

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData({ filter: { title: debouncedSearchTerm } });
    } else {
      if (paginatedAuctionItems) {
        setData(paginatedAuctionItems);
      } else {
        getData();
      }
    }
  }, [debouncedSearchTerm]);

  const getData = async (args?: {
    querystring?: string;
    page?: number;
    filter?: { title?: string; tags?: string[] };
  }) => {
    setIsLoading(true);
    const response = await getPaginatedAuctionItems(args);
    setData(response);
    setIsLoading(false);
  };

  const handleNextPage = () => {
    if (data?.next) {
      getData({ querystring: data.next });
    }
  };

  const handlePreviousPage = () => {
    if (data?.previous) {
      getData({ querystring: data.previous });
    }
  };


  return (
    <div>
      <BlogHeader setSearchTerm={setSearchTerm} />
      {isLoading && <FullScreenLoading />}
      {!isLoading && data && (
        <div>
          <div className="grid grid-cols-4 gap-4">
            {data.count > 0 &&
              data.results.map((auctionItem, index) => (
                <AuctionListingPreview data={auctionItem} key={index} />
              ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={!data.previous}
              className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l ${
                !data.previous ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={!data.next}
              className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r ${
                !data.next ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuctionGalleryPage;