import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import type { NewsPostSummaryDto } from "@/models/NewsPost";
import { toProxiedImageUrl } from "@/utils/imageProxy";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const News = observer(() => {
  const navigate = useNavigate();
  const { pageStore, newsStore, adminSettingStore } = useStore();
  const siteName = adminSettingStore.setting?.siteName?.trim() || 'BMAK Store';
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    pageStore.getPageBySlugFromApi("news");
    newsStore.fetchNewsCategories();
    newsStore.fetchNewsPosts();
  }, [pageStore, newsStore]);

  const newsPage =
    pageStore.selectedPage?.slug === "news"
      ? pageStore.selectedPage
      : undefined;

  const publishedPosts = newsStore.posts.filter((post) => post.isPublished);

  const filteredArticles = publishedPosts.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      !selectedCategory || article.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  const recentArticles = [...publishedPosts]
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  const categories: NewsCategory[] = newsStore.categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: publishedPosts.filter((post) => post.categoryId === category.id)
      .length,
  }));

  const formatNewsDate = (post: NewsPostSummaryDto) =>
    new Date(post.publishedAt || post.createdAt).toLocaleDateString("vi-VN");

  const getThumbnail = (post: NewsPostSummaryDto) =>
    toProxiedImageUrl(post.thumbnailUrl) || "/images/default/no-image.png";

  const goToNewsDetail = (id: number) => {
    navigate(`/news/${id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Render page sections if available */}
      <PageSectionsRenderer sections={newsPage?.sections} />

      {/* News Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Search Bar */}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-9 mb-8 flex gap-2">
            <h1 className="text-3xl font-bold">Tin Tức</h1>
          </div>
          <div className="col-span-3 mb-8 flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button className="bg-gray-900 text-white px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Left Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="space-y-8">
              {(newsStore.isLoadingPosts || newsStore.isLoadingCategories) && (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-gray-500 text-lg">Đang tải tin tức...</p>
                </div>
              )}

              {!newsStore.isLoadingPosts && newsStore.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {newsStore.error}
                </div>
              )}

              {!newsStore.isLoadingPosts &&
                !newsStore.error &&
                (filteredArticles.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-12 text-center">
                    <p className="text-gray-500 text-lg">
                      Nội dung tin tức đang được cập nhật
                    </p>
                  </div>
                ) : (
                  filteredArticles.map((article, index) => (
                    <article
                      key={article.id}
                      className="border-b pb-8 last:border-b-0"
                    >
                      <div className="flex gap-6">
                        {/* Featured Image */}
                        <div
                          className="flex-shrink-0 w-64 h-48 cursor-pointer"
                          onClick={() => goToNewsDetail(article.id)}
                        >
                          <img
                            src={getThumbnail(article)}
                            alt={article.title}
                            className="w-full h-full object-contain bg-gray-50 rounded-lg"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-500 font-medium">
                              {formatNewsDate(article)}
                            </span>
                          </div>

                          <h2
                            className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors cursor-pointer"
                            onClick={() => goToNewsDetail(article.id)}
                          >
                            {article.title}
                          </h2>

                          <p className="text-gray-600 text-base leading-relaxed mb-4">
                            {article.summary ||
                              "Nội dung tin tức đang được cập nhật"}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>By {siteName}</span>
                              <span>•</span>
                              <span>{article.categoryName}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => goToNewsDetail(article.id)}
                              className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                            >
                              ĐỌC THÊM...
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-6">
              {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  DANH MỤC
                </h3>
                <ul className="space-y-3">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() =>
                            setSelectedCategory(
                              selectedCategory === cat.id ? null : cat.id,
                            )
                          }
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === cat.id
                              ? "bg-primary-50 text-primary-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-sm text-gray-500">
                            ({cat.count})
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>
                      <p className="text-gray-500">Không có danh mục nào</p>
                    </li>
                  )}
                </ul>
              </div>

              {/* Recent Articles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  GẦN ĐÂY
                </h3>
                <div className="space-y-4">
                  {recentArticles.length > 0 ? (
                    recentArticles.map((article) => (
                      <div
                        key={article.id}
                        className="pb-4 border-b last:border-b-0 last:pb-0"
                      >
                        <div className="flex gap-3">
                          {/* Thumbnail */}
                          <div
                            className="flex-shrink-0 w-20 h-20 cursor-pointer"
                            onClick={() => goToNewsDetail(article.id)}
                          >
                            <img
                              src={getThumbnail(article)}
                              alt={article.title}
                              className="w-full h-full object-contain bg-gray-50 rounded"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4
                              className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer"
                              onClick={() => goToNewsDetail(article.id)}
                            >
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-2">
                              {formatNewsDate(article)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Không có bài viết nào</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default News;
