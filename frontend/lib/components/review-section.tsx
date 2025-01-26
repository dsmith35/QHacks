import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Import plugin for relative time
import { Review, useApi } from "../api";
import StarRating from "./star-rating";
import { FullScreenLoading } from "./full-screen-loading";

dayjs.extend(relativeTime); // Extend dayjs with relativeTime plugin

interface Props {
  pubId: number;
}

const ReviewSection: React.FC<Props> = ({ pubId }) => {
  const [rawReviewData, setRawReviewData] = useState<Review[] | null>(null);
  const [reviewData, setReviewData] = useState<Review[] |null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true); // Set initial loading to true
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true); // Track if there are more reviews to load
  const [reviewPage, setReviewPage] = useState<number>(1); // Track the current page of reviews
  const { getReviews, getUserData } = useApi();
  const REVIEW_PAGE_MAX_LENGTH = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      setInitialLoading(true); // Start initial loading
      try {
        const reviews = await getReviews(pubId, 1);
        setRawReviewData(reviews);
        setReviewPage(1); // Reset page to 1 when fetching initial reviews
        setHasMore(reviews.length >= REVIEW_PAGE_MAX_LENGTH);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } 
    };

    fetchReviews();
  }, [pubId]);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (rawReviewData != null) {
        const promises = rawReviewData.map(async (review) => {
          if (!review.first_name && !review.last_name) {
            try {
              const userData = await getUserData(review.user);
              return { ...review, first_name: userData.first_name, last_name: userData.last_name}; // Add username to review data
            } catch (error) {
              console.error(`Error fetching user data for review`, error);
              return review; // Return original review if user data fetch fails
            }
          } else {
            return review; // Return review with existing first and last names
          }
        });
        const updatedReviews = await Promise.all(promises);
        setReviewData(updatedReviews);
      }
    };
  
      fetchUserNames();

  }, [rawReviewData]);

  useEffect(() => {
    if (reviewData != null) {
      setInitialLoading(false);
    }
    if (reviewPage != 1) {
      setLoadingMore(false);
    }
  }, [reviewData]);


  const loadMoreReviews = async () => {
    setLoadingMore(true);
    try {
      const nextPage = reviewPage + 1;
      const reviews = await getReviews(pubId, nextPage); // Adjust getReviews API function to accept a page parameter
      setRawReviewData((prevReviews) => [...prevReviews, ...reviews]);
      setReviewPage(nextPage);
      setHasMore(reviews.length >= REVIEW_PAGE_MAX_LENGTH); // Assuming 8 reviews per page, set hasMore based on received reviews
    } catch (error) {
      console.error('Error fetching more reviews:', error);
    }
  };


  if (initialLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div>
      {reviewData.length > 0 ? (
        <ul>
          {reviewData.map((review, index) => (
            <React.Fragment key={index}>
              <li className="py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                      {review.first_name ? review.first_name.charAt(0).toUpperCase() : ""}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{review.first_name} {review.last_name.charAt(0)}.</h3>
                      <div className="text-sm text-gray-500">
                        {dayjs(review.created_at).fromNow()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <StarRating rating={review.rating} showRatingNumber={false} />
                      <p>{review.comment}</p>
                    </div>
                  </div>
                </div>
              </li>
              {index < reviewData.length - 1 && (
                <hr className="border-t-2 border-gray-300 my-2" />
              )}
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <p>No reviews</p>
      )}
      <div className="mt-4 flex justify-center">
        {loadingMore ? (
          <FullScreenLoading />
        ) : (
          <button
            className="bg-white text-black font-semibold py-2 px-4 border-2 border-gray-300 rounded"
            onClick={loadMoreReviews}
            style={{
              visibility: reviewData.length > 0 && hasMore && !loadingMore ? 'visible' : 'hidden'
            }}
          >
            More Reviews
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
