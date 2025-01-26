import React from "react";
import { Button, Checkbox, Label } from "flowbite-react";
import { getSecrets } from "../config";

interface Props {
  siteHasPublications: boolean;
}

export function GettingStartedSection(props: Props) {
  const { siteHasPublications } = props;
  const { authToken, isProd } = getSecrets();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-semibold">✨ Getting started</h2>
      <p className="text-gray-500 dark:text-gray-400">
        Welcome to QVault!
      </p>
    </div>
  );
}
