import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { BLOG_POSTS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { BlogPost } from "@/types/blogPost";
import NewsletterSignup from "@/components/NewsletterSignup";
import { FloatingPaths } from "@/components/ui/background-paths";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, industry news, and career tips from the Western Dental Academy team.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await client.fetch<BlogPost[]>(BLOG_POSTS_QUERY);

  return (
    <>
      {/* ── Page header ──────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-24 pb-16"
        style={{ backgroundColor: "#1E3560" }}
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p
            className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#4A9FD4] mb-4"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Western Dental Academy
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Blog &amp; Insights
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-xl mx-auto leading-relaxed">
            Industry news, career tips, and behind-the-scenes stories from our
            team and participants.
          </p>
        </div>
      </section>

      {/* ── Post grid ────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: "#F4F7F9" }}>
        <div className="max-w-6xl mx-auto px-6">
          {posts && posts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#1E3560]/10">
                    {post.mainImage?.asset ? (
                      <Image
                        src={urlFor(post.mainImage).width(640).height(384).url()}
                        alt={post.mainImage.alt ?? post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="w-12 h-12 rounded-full opacity-20"
                          style={{ backgroundColor: "#4A9FD4" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6 gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#2B303A]/50">
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                      {post.author && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>

                    <h2
                      className="text-lg font-bold text-[#1E3560] leading-snug group-hover:text-[#4A9FD4] transition-colors duration-200"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-sm text-[#2B303A]/70 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    <span className="mt-auto pt-2 text-sm font-semibold text-[#4A9FD4] group-hover:text-[#1E3560] transition-colors duration-200">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p
                className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#4A9FD4] mb-4"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Coming Soon
              </p>
              <h2
                className="text-2xl font-bold text-[#1E3560] mb-3"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                No posts yet — check back soon.
              </h2>
              <p className="text-[#2B303A]/60 max-w-sm mx-auto">
                We&apos;re working on articles about dental careers, industry
                trends, and student success stories.
              </p>
            </div>
          )}
        </div>
      </section>

<NewsletterSignup />
    </>
  );
}
