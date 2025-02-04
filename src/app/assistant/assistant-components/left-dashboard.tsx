import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { j2s } from "@/utils/helper-functions";
import { useContext, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { AssistantContext } from "../providers";
import { actions, createAction } from "../reducer";
import NewsWidget, { NewsItem, NewsWidgetProps } from "./client-news";
import ChartWidget from "./widget-chart";
import ExtractionsWidget from "./widget-extractions";

const LeftDashboard = ({
  shown,
  widgetsShown,
  isLoading,
  toggleDashboard,
  generalInfo,
  clientNews,
  sectorNews,
  clientName,
}: {
  shown: boolean;
  widgetsShown: boolean;
  isLoading: boolean;
  toggleDashboard: () => void;
  generalInfo?: string;
  clientNews?: NewsWidgetProps;
  sectorNews?: NewsItem[];
  clientName: string;
}) => {
  // useEffect for widgetsShown
  useEffect(() => {
    if (widgetsShown) {
      revealCards();
    } else {
      hideCards();
    }
  }, [widgetsShown]);

  const { state, dispatch } = useContext(AssistantContext);
  const { isSecondTabOpen } = state;

  const [ipAddress, setIpAddress] = useState(state.ipAddress);
  const [portNumber, setPortNumber] = useState(state.portNumber);

  function handleSettingsConfirm() {
    dispatch(createAction(actions.SET_IP_ADDRESS, ipAddress));
    dispatch(createAction(actions.SET_PORT_NUMBER, portNumber));
  }

  useEffect(() => {
    console.log(`IP Address: ${ipAddress}, Port Number: ${portNumber}`);
  }, [state.ipAddress, state.portNumber]);

  function revealCards() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        (card as HTMLElement).style.opacity = "1";
      }, index * 200);
    });
  }

  function hideCards() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        (card as HTMLElement).style.opacity = "0";
      }, index * 200);
    });
  }

  return (
    <div
      className={cn(
        shown ? "w-[660px] p-4" : "w-1/5 p-4",
        "overflow-y-sroll overflow-x-hidden bg-white transition-all duration-1000 relative"
      )}
    >
      {isLoading && (
        <div className="absolute grid inset-0 place-items-center">
          <p className="animate-pulse">Loading Data...</p>
        </div>
      )}
      <div className="w-full text-sm">
        <div className="flex flex-row justify-between items-center">
          <h1 className="text-xl font-semibold mb-4" onClick={toggleDashboard}>
            Artefatos
          </h1>
          <label htmlFor="show-second-tab-checkbox">
            <input
              type="checkbox"
              id="show-second-tab-checkbox"
              checked={isSecondTabOpen}
              onChange={() =>
                dispatch(
                  createAction(actions.SET_SECOND_TAB_OPEN, !isSecondTabOpen)
                )
              }
            />
            <span className="ml-2">Show Second Tab</span>
          </label>
        </div>

        <div className="general-artifacts space-y-4">
          <section className="flex gap-4">
            <div className="flex flex-col gap-4">
              <div className="card transition-all duration-500 p-3 w-[300px] h-[400px] bg-zinc-100 border-zinc-200 border shadow-zinc-300 rounded-md overflow-y-scroll">
                <h1 className="mb-2 font-bold">
                  {/* {intentInfo && intentInfo.intent == "client_info"
                    ? intentInfo.argument
                    : "Nome da Empresa"} */}
                  {clientName.replace("Brasil", "")}
                </h1>
                <div>
                  {typeof generalInfo == "object" ? (
                    j2s(generalInfo)
                  ) : (
                    <Markdown>{generalInfo}</Markdown>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1">
              {clientNews?.newsResponse && (
                <NewsWidget
                  isLoadingNews={clientNews.isLoadingNews}
                  newsResponse={clientNews.newsResponse}
                  widgetTitle={clientNews.widgetTitle}
                  className="max-h-[400px]"
                />
              )}
            </div>
          </section>
          <section className="flex gap-4">
            <ExtractionsWidget extractions={state.clientExtractions} />
            <div className="widget-container w-[300px] h-[300px] card transition-all duration-500">
              <ChartWidget />
            </div>
          </section>
          <section className="card transition-all duration-500 p-3 w-[616px] h-[200px] bg-slate-200 border-slate-300 border shadow-zinc-300 rounded-md">
            <h1 className="mb-2 font-bold">More Info</h1>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt
              dolor nobis, reprehenderit laudantium laboriosam quas dolore
              tempora! Minima eligendi nobis reiciendis iusto doloribus, maiores
              aut, debitis deserunt iure, ad delectus.
            </p>
          </section>
        </div>

        <div className="files-container hidden">
          <h1>Files</h1>
          {/* <FilesCard files={mockFiles} /> */}
        </div>

        <div className="settings-container hidden">
          <h1>Settings</h1>
          <div className="form-container">
            <Input
              type="text"
              placeholder="IP Address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Port Number"
              value={portNumber}
              onChange={(e) => setPortNumber(e.target.value)}
            />
            <button onClick={handleSettingsConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabSwitcher = () => {
  // A pill-like space with an inner pill 'button' that switches to the right or left

  const options = ["OptionA", "OptionB"];
  const [selectedOption, setSelectedOption] = useState(options[1]);
  const marginIncrement = 80;

  return (
    <div className="switcher-container w-40 h-10 rounded-2xl bg-gray-200 shadow-gray-300 shadow-inner relative z-0">
      <div className="switcher-options w-full h-full flex flex-row justify-evenly items-center z-50">
        {options.map((option) => {
          return (
            <button onClick={() => setSelectedOption(option)} key={option}>
              {option}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "switcher-pill w-20 h-10 rounded-2xl bg-gray-400 absolute top-0 bottom-0 right-20 z-0"
        )}
        style={{
          transition: "left 0.2s ease-in-out",
          left: options.indexOf(selectedOption) * marginIncrement + "px",
        }}
      ></div>
    </div>
  );
};

export default LeftDashboard;
