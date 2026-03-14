import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { BookOpen, Calendar, Loader2, Plus, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { BlogPost } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateBlogPost, useListBlogPosts } from "../hooks/useQueries";

const SAMPLE_POSTS: Array<{
  title: string;
  preview: string;
  date: string;
  author: string;
}> = [
  {
    title: "The Ultimate Guide to Selling Digital Products in 2026",
    preview:
      "Learn the strategies that top creators use to generate passive income through digital products — from pricing to platform selection.",
    date: "Feb 28, 2026",
    author: "DigiTech Team",
  },
  {
    title: "How AI Is Transforming Digital Product Discovery",
    preview:
      "AI-powered search and recommendation engines are changing how buyers find and purchase digital goods. Here's what you need to know.",
    date: "Feb 20, 2026",
    author: "DigiTech Team",
  },
  {
    title: "Building a Profitable Ebook Business: From Zero to $10k/Month",
    preview:
      "Real case studies from creators who turned their knowledge into profitable ebook businesses using the right platform and marketing.",
    date: "Feb 12, 2026",
    author: "DigiTech Team",
  },
];

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const date = new Date(Number(post.timestamp) / 1_000_000).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );

  const preview =
    post.content.length > 160 ? `${post.content.slice(0, 160)}…` : post.content;

  return (
    <Link to="/blog/$id" params={{ id: post.id.toString() }}>
      <article
        data-ocid={`blog.post.item.${index}`}
        className="group card-glass rounded-xl p-6 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author.toString().slice(0, 12)}…
          </span>
        </div>

        <h2 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {preview}
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-primary text-sm font-medium">
          Read more
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </article>
    </Link>
  );
}

function SamplePostCard({
  post,
  index,
}: { post: (typeof SAMPLE_POSTS)[0]; index: number }) {
  return (
    <article
      data-ocid={`blog.sample.item.${index}`}
      className="card-glass rounded-xl p-6 opacity-70"
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {post.date}
        </span>
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {post.author}
        </span>
      </div>
      <h2 className="font-display text-lg font-bold mb-2 leading-tight">
        {post.title}
      </h2>
      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
        {post.preview}
      </p>
    </article>
  );
}

export default function BlogPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: posts, isLoading } = useListBlogPosts();
  const createPost = useCreateBlogPost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }
    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
      });
      toast.success("Blog post published!");
      setDialogOpen(false);
      setTitle("");
      setContent("");
    } catch {
      toast.error("Failed to publish post");
    }
  };

  const displayPosts = posts ?? [];
  const showSamples = displayPosts.length === 0;

  return (
    <div data-ocid="blog.page" className="container mx-auto px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            DigiTech Blog
          </h1>
          <p className="text-muted-foreground">
            Insights, tutorials, and stories from the digital economy
          </p>
        </div>

        {isAuthenticated && (
          <Button
            data-ocid="blog.create.open_modal_button"
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm"
          >
            <Plus className="h-4 w-4" />
            Write Post
          </Button>
        )}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div
          data-ocid="blog.posts.loading_state"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {["a", "b", "c", "d", "e", "f"].map((k) => (
            <div key={k} className="card-glass rounded-xl p-6 space-y-3">
              <Skeleton className="h-3 w-32 bg-secondary/50" />
              <Skeleton className="h-5 w-full bg-secondary/50" />
              <Skeleton className="h-5 w-4/5 bg-secondary/50" />
              <Skeleton className="h-3 w-full bg-secondary/50" />
              <Skeleton className="h-3 w-2/3 bg-secondary/50" />
            </div>
          ))}
        </div>
      ) : showSamples ? (
        <>
          <div className="mb-4 text-sm text-muted-foreground px-1">
            Sample posts — be the first to write on DigiTech!
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SAMPLE_POSTS.map((post, i) => (
              <SamplePostCard key={post.title} post={post} index={i + 1} />
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPosts.map((post, i) => (
            <PostCard key={post.id.toString()} post={post} index={i + 1} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="blog.create.modal"
          className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Write a Blog Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="blog-title">Title *</Label>
              <Input
                id="blog-title"
                data-ocid="blog.create.title.input"
                placeholder="Your post title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary/50 border-border text-lg font-display"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="blog-content">Content *</Label>
              <Textarea
                id="blog-content"
                data-ocid="blog.create.content.textarea"
                placeholder="Write your article here…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-secondary/50 border-border min-h-[240px] resize-none leading-relaxed"
                rows={10}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              data-ocid="blog.create.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              data-ocid="blog.create.submit_button"
              onClick={handleCreate}
              disabled={
                createPost.isPending || !title.trim() || !content.trim()
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing…
                </>
              ) : (
                "Publish Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
