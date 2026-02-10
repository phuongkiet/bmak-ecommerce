import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/store";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";

const AboutUs = observer(() => {
  const { pageStore } = useStore();

  useEffect(() => {
    pageStore.getPageBySlugFromApi("about-us");
  }, [pageStore]);

  const aboutPage =
    pageStore.selectedPage?.slug === "about-us"
      ? pageStore.selectedPage
      : undefined;

  const fallback = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giới thiệu</h1>
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <p>Trang giới thiệu đang được phát triển...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Giới thiệu</h1>
      </div>
      <PageSectionsRenderer
        sections={aboutPage?.sections}
        fallback={fallback}
      />
    </div>
  );
});

export default AboutUs;
