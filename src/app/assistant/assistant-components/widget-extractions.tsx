import { cn } from "@/lib/utils";
import React from "react";
import { InformationExtraction } from "../utilities";

export interface ExtractionsWidgetProps {
  className?: string;
  extractions?: InformationExtraction[];
}

const ExtractionsWidget: React.FC<ExtractionsWidgetProps> = (props) => {
  const { className, extractions } = props;

  return (
    <div
      className={cn(
        "card transition-all duration-500 p-3 max-w-[300px] h-full bg-zinc-100 border-zinc-200 border shadow-zinc-300 rounded-md overflow-y-scroll",
        className
      )}
    >
      <h1>Widget Extractions</h1>

      {extractions && extractions.length > 0 ? (
        extractions.map((extraction, index) => {
          // Parse the 'information' if it is a string.
          let infoObject: { [key: string]: string | string[] } = {};
          if (typeof extraction.information === "string") {
            try {
              infoObject = JSON.parse(extraction.information);
            } catch (error) {
              console.error(
                "Failed to parse information:",
                extraction.information
              );
            }
          } else {
            infoObject = extraction.information;
          }

          return (
            <div
              key={index}
              className="extraction my-2 p-2 bg-white rounded shadow-sm"
            >
              <h2 className="text-lg font-semibold">{extraction.question}</h2>
              <ul className="mt-1 list-disc pl-5">
                {Object.entries(infoObject).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong>{" "}
                    {Array.isArray(value) ? value.join(", ") : value}
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      ) : (
        <p>No extractions available.</p>
      )}
    </div>
  );
};

export default ExtractionsWidget;
