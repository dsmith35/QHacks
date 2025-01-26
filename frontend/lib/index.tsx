import React, { Suspense, lazy } from "react";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import { FullScreenLoading } from "./components/full-screen-loading";
import { Topbar } from "./components/topbar";
import { Footer } from "./components/footer";
import "./index.css";

const LandingPage = lazy(() => import("./pages/landing"));
const BlogPage = lazy(() => import("./pages/blog"));
const PublicationPage = lazy(() => import("./pages/publication"));
const ProfilePage = lazy(() => import("./pages/profile"));
const LogInPage = lazy(() => import("./pages/log-in"));
const SignUpPage = lazy(() => import("./pages/sign-up"));
const InvoicePage = lazy(() => import("./pages/invoice"));
const PageNotFound = lazy(() => import("./pages/page-not-found"));
const HomePage = lazy(() => import("./pages/home"));
const AuctionGalleryPage = lazy(() => import("./pages/auction-gallery"));
const AuctionItemPage = lazy(() => import("./pages/auction-item"));

dayjs.extend(LocalizedFormat);

export function Root() {
  return (
    <BrowserRouter>
    <Suspense fallback={<FullScreenLoading />}>
      <Topbar/>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <div className="flex-1">
          <Routes>
            <Route path={ROUTES.LANDING_PAGE} element={ <LandingPage /> }/>
            <Route path={ROUTES.HOME_PAGE} element={ <HomePage /> }/>
            <Route path={ROUTES.BLOG} element={ <BlogPage /> }/>
            <Route path={ROUTES.PUBLICATION_PAGE} element={ <PublicationPage /> }/>
            <Route path={ROUTES.PROFILE_PAGE} element={ <ProfilePage /> }/>
            <Route path={ROUTES.SIGN_UP_PAGE} element={ <SignUpPage /> }/>
            <Route path={ROUTES.LOG_IN_PAGE} element={ <LogInPage /> }/>
            <Route path={ROUTES.INVOICE_PAGE} element={ <InvoicePage /> }/>
            <Route path={ROUTES.AUCTION_GALLERY_PAGE} element={ <AuctionGalleryPage /> }/>
            <Route path={ROUTES.AUCTION_ITEM_PAGE} element={ <AuctionItemPage /> }/>
            <Route path="*" element={ <PageNotFound /> }/>
          </Routes>
        </div>
      </div>
      <Footer/>
      </Suspense>
    </BrowserRouter>
  );
}
