import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { BLOG_POST_BY_SLUG_QUERY, BLOG_POSTS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { BlogPost } from "@/types/blogPost";
import { FloatingPaths } from "@/components/ui/background-paths";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await client.fetch<BlogPost[]>(BLOG_POSTS_QUERY);
  return (posts ?? []).map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<BlogPost | null>(BLOG_POST_BY_SLUG_QUERY, { slug });
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.mainImage?.asset
      ? { images: [{ url: urlFor(post.mainImage).width(1200).height(630).url() }] }
      : undefined,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Portable Text components styled to WDA typography ────────────────────────
// Scale: H2 1.75rem/600/#1E3560 · H3 1.25rem/500/#4A9FD4 · body 1rem/400/#2B303A/1.6lh

const portableTextComponents = {
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        className="text-[1.75rem] font-semibold text-[#1E3560] mt-10 mb-4 leading-snug"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        className="text-[1.25rem] font-medium text-[#4A9FD4] mt-8 mb-3 leading-snug"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4
        className="text-base font-semibold text-[#1E3560] mt-6 mb-2"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {children}
      </h4>
    ),
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-base text-[#2B303A] leading-[1.6] mb-5">{children}</p>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-[#4A9FD4] pl-5 my-6 text-[#2B303A]/70 italic leading-[1.6]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-6 mb-5 space-y-1.5 text-[#2B303A] leading-[1.6]">
        {children}
      </ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-6 mb-5 space-y-1.5 text-[#2B303A] leading-[1.6]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-base">{children}</li>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-base">{children}</li>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-[#1E3560]">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    link: ({
      value,
      children,
    }: {
      value?: { href: string };
      children?: React.ReactNode;
    }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#4A9FD4] underline underline-offset-2 hover:text-[#1E3560] transition-colors duration-200"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({
      value,
    }: {
      value: { asset: { _ref: string }; alt?: string; caption?: string };
    }) => (
      <figure className="my-8">
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{ aspectRatio: "16/9" }}
        >
          <Image
            src={urlFor(value).width(1200).height(675).url()}
            alt={value.alt ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 740px"
          />
        </div>
        {value.caption && (
          <figcaption className="mt-2 text-center text-xs text-[#2B303A]/50">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch<BlogPost | null>(BLOG_POST_BY_SLUG_QUERY, { slug });

  if (!post) notFound();

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section
        style={{ backgroundColor: "#1E3560" }}
        className="relative overflow-hidden pt-24 pb-14"
      >
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
        <div className="relative max-w-3xl mx-auto px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors mb-8"
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-2 text-xs text-white/50 mb-5">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.author && (
              <>
                <span aria-hidden>·</span>
                <span>{post.author}</span>
              </>
            )}
          </div>

          <h1
            className="text-3xl md:text-4xl font-bold text-white leading-tight mb-5"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-white/60 text-lg leading-[1.6]">{post.excerpt}</p>
          )}
        </div>
      </section>

      {/* ── Hero image ───────────────────────────────── */}
      {post.mainImage?.asset && (
        <div className="max-w-3xl mx-auto px-6 -mt-6 mb-12">
          <div
            className="relative w-full overflow-hidden rounded-2xl shadow-lg"
            style={{ aspectRatio: "16/9" }}
          >
            <Image
              src={urlFor(post.mainImage).width(1200).height(675).url()}
              alt={post.mainImage.alt ?? post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 740px"
            />
          </div>
        </div>
      )}

      {/* ── Body ─────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-6 pb-24">
        {post.body && (
          <PortableText value={post.body as never} components={portableTextComponents} />
        )}

        {/* Author card */}
        <div
          className="mt-16 pt-8 border-t flex items-center gap-4"
          style={{ borderColor: "rgba(30,53,96,0.1)" }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
            style={{ backgroundColor: "#1E3560" }}
            aria-hidden
          >
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-[#1E3560]"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {post.author}
            </p>
            <p className="text-xs text-[#2B303A]/50">Western Dental Academy</p>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A9FD4] hover:text-[#1E3560] transition-colors duration-200"
          >
            ← All Posts
          </Link>
        </div>
      </article>
    </>
  );
}
