import React from "react";
import { Label, TextInput } from "flowbite-react";

interface Props {
  setSearchTerm: (searchTerm: string) => void;
  title?: string;
  description?: string;
}

export function BlogHeader(props: Props) {
  const {
    setSearchTerm,
    title = "📝 Auction Listings",
    description = "You can search for listings here or navigate using using pagination.",
  } = props;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
      <div className="mt-4">
        <div className="mb-2 block">
          <Label htmlFor="base" value="Search listings" />
        </div>
        <TextInput
          id="base"
          type="text"
          sizing="md"
          placeholder={"Search"}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>
    </div>
  );
}
