import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Search } from "lucide-react";
import { useStore } from "@/store";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  author: string;
  date: string;
  category: string;
  slug: string;
  tags?: string[];
}

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const News = observer(() => {
  const { pageStore } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    pageStore.getPageBySlugFromApi("news");
  }, [pageStore]);

  const newsPage =
    pageStore.selectedPage?.slug === "news"
      ? pageStore.selectedPage
      : undefined;

  // Mock data - trong thực tế sẽ fetch từ BE
  const articles: NewsArticle[] = [
    {
      id: 1,
      title:
        "4 Sai Lầm Về Gạch Ốp Tường Khiến Ngôi Nhà Nhanh Xuống Cấp Sau 2 Năm",
      excerpt:
        "Sai lầm khi xem nhè độ hút nước của gạch ốp tường. Sai lầm khi dùng xi măng ốp gạch khô lòn...",
      content: "Nội dung tin tức đang được cập nhật",
      image:
        "https://images.unsplash.com/photo-1565971511849-76a60a516170?w=800&q=80",
      author: "Gạch An Khanh",
      date: "25/12/2025",
      category: "Tin Tức",
      slug: "4-sai-lam-ve-gach-op-tuong",
      tags: ["gạch", "tường", "xây dựng"],
    },
    {
      id: 2,
      title: '5 Lưu Ý "Vàng" Khi Mua Gạch Ốp Tường Giúp Ngôi Nhà Bền Đẹp',
      excerpt:
        "Khi lựa chọn gạch ốp tường, bạn cần biết những điểm quan trọng...",
      content: "Nội dung tin tức đang được cập nhật",
      image:
        "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80",
      author: "Gạch An Khanh",
      date: "03/07/2025",
      category: "Giới Thiệu",
      slug: "5-luu-y-vang-khi-mua-gach",
      tags: ["gạch", "mua sắm"],
    },
  ];

  const categories: NewsCategory[] = [
    { id: 1, name: "Chính sách", slug: "chinh-sach", count: 5 },
    { id: 2, name: "Giới Thiệu", slug: "gioi-thieu", count: 6 },
    { id: 3, name: "Khuyến Mãi", slug: "khuyen-mai", count: 1 },
    { id: 4, name: "Tin Tức", slug: "tin-tuc", count: 6 },
  ];

  const recentArticles = articles.slice(0, 3);

  const filteredArticles = articles.filter((article) => {
    const matchSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      !selectedCategory || article.category === selectedCategory;
    return matchSearch && matchCategory;
  });

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
              {filteredArticles.length === 0 ? (
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
                      <div className="flex-shrink-0 w-64 h-48">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {article.date}
                          </span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors cursor-pointer">
                          {article.title}
                        </h2>

                        <p className="text-gray-600 text-base leading-relaxed mb-4">
                          {article.excerpt}
                        </p>

                        {/* Tags */}
                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {article.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 cursor-pointer transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>By {article.author}</span>
                            <span>•</span>
                            <span>{article.category}</span>
                          </div>
                          <button className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                            ĐỌC THÊM...
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
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
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === cat.name ? null : cat.name,
                          )
                        }
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === cat.name
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
                  ))}
                </ul>
              </div>

              {/* Recent Articles */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  GẦN ĐÂY
                </h3>
                <div className="space-y-4">
                  {recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 w-20 h-20">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-2">
                            {article.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
