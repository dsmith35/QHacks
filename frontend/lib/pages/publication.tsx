import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Publication, Review, useApi } from "../api";
import { useParams } from "react-router-dom";
import { FullScreenLoading } from "../components/full-screen-loading";
import StarRating from "../components/star-rating";
import Chat from "../components/chat";
import ReviewSection from "../components/review-section";
import PageNotFound from "./page-not-found";

interface Props {
  pubData?: Publication;
}

const PublicationPage: React.FC<Props> = (props: Props) => {
  const { pubData: publicationData } = props;
  const { publication } = useParams<{ publication: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [pubData, setPubData] = useState<Publication | undefined>();
  const { getPublication } = useApi();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    if (publication) {
      setIsLoading(true);
      try {
        const data = await getPublication(publication);
        setPubData(data);
      } catch (error) {
        console.error('Error fetching publication data:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setPubData(publicationData);
    }
  };

  if (isLoading) {
    return <FullScreenLoading />;
  }
  if (!pubData) {
    return <PageNotFound/>
  }

  return (
    <main className="pt-8 pb-16 lg:pt-16 lg:pb-24 antialiased">
      <div className="flex justify-between px-4 mx-auto max-w-screen-xl">
        <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
          <header className="mb-4 lg:mb-6 not-format">
            <address className="flex items-center mb-6 not-italic">
              <img
                className="w-16 h-16 rounded-full mr-4"
                src={pubData.image}
                alt={pubData.description}
              />
              <div>
                <div className="flex items-center">
                  <span className="text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl dark:text-white">
                    {pubData.title}
                  </span>
                  &nbsp;&nbsp;
                  <span className="text-sm text-gray-500 font-extrabold">
                      {pubData.available ? "🟢 Available" : "⚫ Busy"}
                    </span>
                </div>
                <div className="flex items-center mt-2">
                  <StarRating rating={pubData.rating} num_ratings={pubData.num_ratings} />
                </div>
                <div>${pubData.hr_rate}/hr</div>
              </div>
            </address>
          </header>
          <p className="lead">{pubData.description}</p>
          <br/>
          <div className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About</h2>
          <div>{pubData.about}</div>
          <br/>
          <br/>
          <div className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-600 pb-2"></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
          <ReviewSection pubId={pubData.id} />
          <br/><br/><br/><br/>
        </article>
        <div className="ml-8">
          <Chat />
        </div>
      </div>
    </main>
  );
};

export default PublicationPage;
