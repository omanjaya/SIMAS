import SaraswatiBlogFeaturedPosts from '@/components/sections/saraswati-blog-featured-posts';
import SaraswatiBlogGrid, {
  BlogCard,
} from '@/components/sections/saraswati-blog-grid';
import SaraswatiBlogHero from '@/components/sections/saraswati-blog-header';
import SaraswatiCtaCard from '@/components/sections/saraswati-cta-card';
import type { BlogPost } from '@/lib/blog';
import { getAllBlogs } from '@/lib/blog';

function extractChip(post: BlogPost): string {
  const fromTagline =
    typeof post.tagline === 'string' ? post.tagline.trim() : '';
  const fromTags =
    Array.isArray(post.tags) && typeof post.tags[0] === 'string'
      ? post.tags[0].trim()
      : '';
  return fromTagline || fromTags || 'General';
}

export default function BlogPage() {
  const allPosts = getAllBlogs();

  const featuredPosts = allPosts.filter((p) => p.featured);

  const gridPosts: BlogCard[] = allPosts.map((p) => {
    const chip = extractChip(p);
    return {
      slug: p.slug,
      title:
        (typeof p.title === 'string' ? p.title.trim() : '') ||
        p.slug.replace(/-/g, ' '),
      tagline: chip,
      category: chip,
      intro: p.description ?? '',
    };
  });

  return (
    <>
      <SaraswatiBlogHero />
      {!!featuredPosts.length && (
        <SaraswatiBlogFeaturedPosts posts={featuredPosts} />
      )}
      <SaraswatiBlogGrid posts={gridPosts} />
      <SaraswatiCtaCard softBg />
    </>
  );
}
