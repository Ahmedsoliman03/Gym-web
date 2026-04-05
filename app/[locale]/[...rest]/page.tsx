import { notFound } from "next/navigation";

/**
 * Catch-all route within [locale] folder
 * Triggers the localized notFound() function
 */
export default function CatchAllPage() {
  notFound();
}
