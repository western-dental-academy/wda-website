import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";

export { client, urlFor, sanityFetch, SanityLive, groq };

/**
 * One-shot fetch for static data that does not need live updates.
 * Use `sanityFetch` instead when the page renders inside <SanityLive />.
 */
export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  return client.fetch<T>(query, params, { next: { revalidate: 60 } });
}
