import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ClientNewsResponse } from "../utilities";

export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

export interface NewsWidgetProps {
  widgetTitle: string;
  isLoadingNews: boolean;
  newsResponse: ClientNewsResponse[];
  className?: string;
}

const NewsWidget: React.FC<NewsWidgetProps> = (props) => {
  const { widgetTitle, isLoadingNews, newsResponse, className } = props;

  const [selectedNewsLabel, setSelectedNewsLabel] = useState<string>("");

  if (!newsResponse || !newsResponse.length) {
    return <div>No news available</div>;
  }

  return (
    <div
      className={cn(
        "card transition-all duration-500 p-3 max-w-[300px] h-full bg-zinc-100 border-zinc-200 border shadow-zinc-300 rounded-md overflow-y-scroll",
        className
      )}
    >
      <h1 className="mb-2 font-bold">{widgetTitle}</h1>
      <div className="flex flex-col space-y-3">
        {isLoadingNews ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-zinc-300" />
            <Skeleton className="h-4 w-[250px] bg-zinc-300" />
            <Skeleton className="h-4 w-[200px] bg-zinc-300" />
          </div>
        ) : null}
        <div className="selector-pills-horizontal overflow-x-scroll text-nowrap">
          {newsResponse
            ? newsResponse.map((item) => {
                return (
                  <button
                    key={item.question}
                    className="inline p-2 border border-gray-200 mr-2 rounded-2xl hover:bg-zinc-200"
                    onClick={() => setSelectedNewsLabel(item.question)}
                  >
                    {item.question}
                  </button>
                );
              })
            : null}
        </div>
        <div className="selected-news-list-from-pill">
          {newsResponse
            ? newsResponse
                .filter((item) => item.question === selectedNewsLabel)
                ?.map((item) => {
                  return item.responses.map((item) => {
                    return (
                      <a
                        key={item.title}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm hover:underline"
                      >
                        <h2 className="font-semibold">{item.title}</h2>
                        <p>{item.snippet}</p>
                        <p>Source: {item.source}</p>
                      </a>
                    );
                  });
                })
            : null}
        </div>
      </div>
    </div>
  );
};

export default NewsWidget;

// {news &&
//   news?.length > 0 &&
//   news.map((item, index) => (
//     <a
//       key={index}
//       href={item.url}
//       target="_blank"
//       rel="noreferrer"
//       className="text-sm hover:underline"
//     >
//       <h2 className="font-semibold">{item.title}</h2>
//       <p>{item.snippet}</p>
//       <p>Source: {item.source}</p>
//     </a>
//   ))}
