import React from "react";
import { Item } from "../types";
import { CatalogView } from "../components/CatalogView";

interface PageProps {
  items: Item[];
  setPage?: (p: string) => void;
  showToast?: (m: string, t?: "success" | "error" | "info") => void;
  user?: any;
}

export const PeralatanMendaki: React.FC<PageProps> = ({ items, setPage, showToast, user }) => {
  return (
    <CatalogView 
      items={items}
      title="Peralatan Mendaki"
      subtitle="Eksklusif perlengkapan untuk pendakian gunung dan trek teknis."
      initialCategory="Hiking"
      setPage={setPage}
      showToast={showToast}
      user={user}
    />
  );
};
