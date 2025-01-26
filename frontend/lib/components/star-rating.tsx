import React from "react";

interface StarRatingProps {
  rating: number;
  num_ratings?: number; // Making num_ratings optional
  showRatingNumber?: boolean; // Prop to decide whether to display rating number
}

const StarRating: React.FC<StarRatingProps> = ({ rating, num_ratings, showRatingNumber = true }) => {
  const totalStars = 5;
  const fullStars = Math.round(rating / 20); // 20% per star
  const required_ratings = 5;

  const stars = [];
  for (let i = 0; i < totalStars; i++) {
    if (i < fullStars) {
      stars.push(<StarIcon key={i} type="full" />);
    } else {
      stars.push(<StarIcon key={i} type="empty" />);
    }
  }
  
  if (num_ratings === undefined) {
    return (
      <div className="flex items-center">
        <span> {stars} </span>
        {showRatingNumber && (
          <p className="ms-2 text-sm font-bold text-gray-900 dark:text-white">{(Math.round(rating * 100) / 2000).toFixed(1)}</p>
        )}
      </div>
    );
  }

  let rating_info = (
    <p className="text-sm font-small text-gray-400 dark:text-white"> 
      (<span className="font-medium">{required_ratings - num_ratings} </span> more ratings needed)
    </p>
  );

  if (num_ratings === required_ratings - 1) {
    rating_info = (
      <p className="text-sm font-small text-gray-400 dark:text-white"> 
        (<span className="font-medium">1 </span> more rating needed)
      </p>
    );
  } else if (num_ratings >= required_ratings) {
    rating_info = (
      <div className="flex items-center">
        <span> {stars} </span>
        <span className="flex items-center mx-2">
          <p className="ms-2 text-sm font-bold text-gray-900 dark:text-white">{(Math.round(rating * 100) / 2000).toFixed(1)}</p>
          <span className="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"></span>
          <p className="text-sm font-medium text-gray-900 dark:text-white">({num_ratings})</p>
        </span>
      </div>
    );
  }

  return (
    <div>
      {rating_info}
    </div>
  );
};

interface StarIconProps {
  type: "full" | "empty";
}
const StarIcon: React.FC<StarIconProps> = ({ type }) => {
  let starClassName = "w-4 h-4";
  let starContent = "";
  
  if (type === "full") {
    starClassName += " text-yellow-500";
    starContent = "★";
  } else if (type === "empty") {
    starClassName += " text-gray-300";
    starContent = "☆";
  } 

  return <span className={starClassName}>{starContent}</span>;
};

export default StarRating;
