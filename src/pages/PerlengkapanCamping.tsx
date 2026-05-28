import React from "react";
import { Item } from "../types";
import { CatalogView } from "../components/CatalogView";

interface PageProps {
  items: Item[];
  setPage?: (p: string) => void;
  showToast?: (m: string, t?: "success" | "error" | "info") => void;
  user?: any;
}

export const PerlengkapanCamping: React.FC<PageProps> = ({ items, setPage, showToast, user }) => {
  return (
    <CatalogView 
      items={items}
      title="Perlengkapan Camping"
      subtitle="Koleksi tenda dan akomodasi outdoor untuk kenyaman maksimal."
      initialCategory="Camping"
      setPage={setPage}
      showToast={showToast}
      user={user}
    />
  );
};
