import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Loader2, User } from "lucide-react";
import { useGetBlogPost } from "../hooks/useQueries";

export default function BlogPostPage() {
  const { id } = useParams({ from: "/layout/blog/$id" });
  const navigate = useNavigate();

  const postId = BigInt(id);
  const { data: post, isLoading, isError } = useGetBlogPost(postId);

  const date = post
    ? new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <div
        data-ocid="blog-post.loading_state"
        className="container mx-auto px-4 py-10 sm:px-6 max-w-3xl"
      >
        <Skeleton className="h-5 w-32 mb-8 bg-secondary/50" />
        <Skeleton className="h-8 w-3/4 mb-4 bg-secondary/50" />
        <Skeleton className="h-3 w-48 mb-8 bg-secondary/50" />
        <div className="space-y-3">
          {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
            <Skeleton key={k} className="h-4 w-full bg-secondary/50" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div
        data-ocid="blog-post.error_state"
        className="container mx-auto px-4 py-20 text-center max-w-md"
      >
        <div className="text-5xl mb-4">📝</div>
        <h2 className="font-display text-2xl font-bold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">
          This blog post may have been removed.
        </p>
        <Link to="/blog">
          <Button
            data-ocid="blog-post.back.button"
            className="bg-primary text-primary-foreground"
          >
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article
      data-ocid="blog-post.page"
      className="container mx-auto px-4 py-10 sm:px-6 max-w-3xl"
    >
      {/* Back */}
      <button
        type="button"
        data-ocid="blog-post.back.button"
        onClick={() => navigate({ to: "/blog" })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Blog
      </button>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.author.toString().slice(0, 20)}…
          </span>
        </div>
      </header>

      <div
        className="border-t border-border pt-8"
        style={{ borderColor: "oklch(0.78 0.18 195 / 0.2)" }}
      />

      {/* Content */}
      <div className="prose prose-invert max-w-none mt-8">
        {post.content.split("\n").map((paragraph, i) =>
          paragraph.trim() ? (
            // biome-ignore lint/suspicious/noArrayIndexKey: content paragraphs have no stable id
            <p key={i} className="text-foreground/90 leading-relaxed mb-4">
              {paragraph}
            </p>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: blank lines have no stable id
            <br key={i} />
          ),
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-border">
        <Link to="/blog">
          <Button
            data-ocid="blog-post.more.secondary_button"
            variant="outline"
            className="gap-2 border-border"
          >
            <ArrowLeft className="h-4 w-4" />
            More Posts
          </Button>
        </Link>
      </div>
    </article>
  );
}
