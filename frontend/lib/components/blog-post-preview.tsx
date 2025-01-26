import React from "react";
import { Button, Card } from "flowbite-react";
import { Publication } from "../api";
import { useRouter } from "../routes";
import StarRating from "./star-rating";

interface Props {
  data: Publication;
}

export function BlogPostPreview(props: Props) {
  const { data } = props;
  const { push } = useRouter();

  return (
    <Card className="max-w-sm mt-4 w-64 h-140 flex flex-col justify-between rounded-lg">
      <div className="overflow-hidden flex-grow">
        <div className="h-40 w-full overflow-hidden rounded-lg">
          <img
            src={data.image}
            alt={data.description}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h5 className="text-2xl font-bold tracking-tight text-blue-900 dark:text-white truncate">
            {data.title}
          </h5>
          <div className="flex items-center">
            <StarRating rating={data.rating} num_ratings={data.num_ratings} />
          </div>
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400 overflow-hidden overflow-ellipsis">
            {data.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.tag.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-200 text-blue-900 text-xs font-semibold rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-2 mt-auto">
        <Button onClick={() => push("/blog/" + data.slug)} className="w-full">
          Read more
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
