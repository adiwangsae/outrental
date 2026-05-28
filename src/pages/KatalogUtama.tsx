import React from "react";
import { Item } from "../types";
import { CatalogView } from "../components/CatalogView";

interface PageProps {
  items: Item[];
  setPage?: (p: string) => void;
  showToast?: (m: string, t?: "success" | "error" | "info") => void;
  user?: any;
}

export const KatalogUtama: React.FC<PageProps> = ({ items, setPage, showToast, user }) => {
  return (
    <CatalogView 
      items={items}
      title="Katalog Utama"
      subtitle="Jelajahi seluruh ekosistem peralatan outdoor berkualitas tinggi kami."
      setPage={setPage}
      showToast={showToast}
      user={user}
    />
  );
};
