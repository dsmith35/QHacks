import React, { Fragment, useEffect, useState } from "react";
import { ROUTES, useRouter} from "../routes";
import { FullScreenLoading } from "../components/full-screen-loading";

function LandingPage() {
  const { push } = useRouter();

  useEffect(() => {
    push(ROUTES.HOME_PAGE);
  }, []);
  

  return (
    <FullScreenLoading />
  );
}

export { LandingPage as default };
