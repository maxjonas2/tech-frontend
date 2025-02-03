"use client";

import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";

const RightSidePanel = ({
  isOpen = false,
  json = null,
  loading = false,
  serverLog,
}: {
  isOpen: boolean;
  json: Object | null;
  loading: boolean;
  serverLog?: string[];
}) => {
  return (
    <div
      className={`${
        isOpen ? "w-1/5 p-4" : "w-0 p-0"
      } bg-white shadow-md transition-all duration-300 relative overflow-y-scroll`}
    >
      <h1 className="text-xl font-semibold mb-4">Log do Servidor</h1>
      {loading && (
        <div className="absolute inset-0 grid place-content-center font-semibold text-[1rem] animate-pulse">
          Loading...
        </div>
      )}
      {serverLog && (
        <div className="space-y-2">
          {serverLog.map((log, index) => (
            <div key={index} className="font-mono">
              {log}
            </div>
          ))}
        </div>
      )}
      <div>{json && <JsonView value={json} style={lightTheme} />}</div>
    </div>
  );
};

export default RightSidePanel;
