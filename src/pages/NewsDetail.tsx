import { useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useStore } from "@/store";
import { proxyImageSourcesInHtml, toProxiedImageUrl } from "@/utils/imageProxy";

interface SidebarCategory {
    id: number;
    name: string;
    count: number;
}

const NewsDetail = observer(() => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { newsStore } = useStore();

    const newsId = Number(id);

    useEffect(() => {
        if (!Number.isFinite(newsId) || newsId <= 0) {
            navigate("/news");
            return;
        }

        newsStore.fetchNewsCategories();
        newsStore.fetchNewsPosts();
        newsStore.fetchNewsPostById(newsId);

        return () => {
            newsStore.clearSelectedPost();
        };
    }, [newsId, newsStore, navigate]);

    const post = newsStore.selectedPost?.id === newsId ? newsStore.selectedPost : null;

    const publishedPosts = newsStore.posts.filter((item) => item.isPublished);

    const categories: SidebarCategory[] = newsStore.categories.map((category) => ({
        id: category.id,
        name: category.name,
        count: publishedPosts.filter((item) => item.categoryId === category.id).length,
    }));

    const recentPosts = useMemo(
        () =>
            [...publishedPosts]
                .filter((item) => item.id !== newsId)
                .sort((a, b) => {
                    const dateA = new Date(a.publishedAt || a.createdAt).getTime();
                    const dateB = new Date(b.publishedAt || b.createdAt).getTime();
                    return dateB - dateA;
                })
                .slice(0, 4),
        [publishedPosts, newsId],
    );

    const formatNewsDate = (value?: string | Date) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString("vi-VN");
    };

    const coverImage = toProxiedImageUrl(post?.thumbnailUrl) || "/images/default/no-image.png";

    if (newsStore.isLoadingPostDetail) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-gray-500">
                Đang tải chi tiết bài viết...
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-gray-600 mb-4">Không tìm thấy bài viết.</p>
                <button
                    type="button"
                    onClick={() => navigate("/news")}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Quay lại trang Tin tức
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                    <button type="button" onClick={() => navigate("/")} className="hover:text-primary-600">
                        Trang chủ
                    </button>
                    <ChevronRight size={14} />
                    <button type="button" onClick={() => navigate("/news")} className="hover:text-primary-600">
                        Tin tức
                    </button>
                    <ChevronRight size={14} />
                    <span className="text-gray-700 line-clamp-1">{post.title}</span>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-9">
                        <article className="bg-white">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6">
                                <span>{formatNewsDate(post.publishedAt || post.createdAt)}</span>
                                <span>•</span>
                                <span>{post.categoryName}</span>
                                <span>•</span>
                                <span>{post.viewCount || 0} lượt xem</span>
                            </div>

                            <div className="w-full bg-gray-50 rounded-lg overflow-hidden mb-6">
                                <img
                                    src={coverImage}
                                    alt={post.title}
                                    className="w-full max-h-[520px] object-contain"
                                />
                            </div>

                            {post.summary && (
                                <div className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
                                    {post.summary}
                                </div>
                            )}

                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: proxyImageSourcesInHtml(post.content) }}
                            />
                        </article>
                    </div>

                    <div className="col-span-12 lg:col-span-3">
                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">DANH MỤC</h3>
                                <ul className="space-y-3">
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <button
                                                type="button"
                                                onClick={() => navigate("/news")}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors"
                                            >
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-sm text-gray-500">({category.count})</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">GẦN ĐÂY</h3>
                                <div className="space-y-4">
                                    {recentPosts.length === 0 ? (
                                        <p className="text-sm text-gray-500">Chưa có bài viết gần đây.</p>
                                    ) : (
                                        recentPosts.map((item) => (
                                            <div
                                                key={item.id}
                                                className="pb-4 border-b last:border-b-0 last:pb-0"
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className="flex-shrink-0 w-20 h-20 cursor-pointer"
                                                        onClick={() => navigate(`/news/${item.id}`)}
                                                    >
                                                        <img
                                                            src={toProxiedImageUrl(item.thumbnailUrl) || "/images/default/no-image.png"}
                                                            alt={item.title}
                                                            className="w-full h-full object-contain bg-gray-50 rounded"
                                                        />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h4
                                                            className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer"
                                                            onClick={() => navigate(`/news/${item.id}`)}
                                                        >
                                                            {item.title}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {formatNewsDate(item.publishedAt || item.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
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

export default NewsDetail;