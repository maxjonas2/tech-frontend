import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface NewsItem {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

export interface NewsWidgetProps {
  widgetTitle: string;
  isLoadingNews: boolean;
  news?: NewsItem[];
  className?: string;
}

const NewsWidget: React.FC<NewsWidgetProps> = (props) => {
  const { isLoadingNews, news, widgetTitle, className } = props;

  console.log("News data", news);

  return (
    <div
      className={cn(
        "card transition-all duration-500 p-3 w-full h-full bg-zinc-100 border-zinc-200 border shadow-zinc-300 rounded-md overflow-y-scroll",
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
        {news &&
          news?.length > 0 &&
          news.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm hover:underline"
            >
              <h2 className="font-semibold">{item.title}</h2>
              <p>{item.snippet}</p>
              <p>Source: {item.source}</p>
            </a>
          ))}
      </div>
    </div>
  );
};

export default NewsWidget;
