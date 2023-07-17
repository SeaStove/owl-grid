import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import qs from "qs";
import { useQuery } from "@tanstack/react-query";
import gameMap from "./assets/gameMap.json";

interface OwlData {
  currentSegments: string[];
  futureSegments: string[];
  matches: object;
  players: object;
  segments: object;
  teams: TeamsObject;
}

export interface PlayerData {
  id: number;
  teams: Team[];
  stats: { [key: string]: number };
  heroes: Heroes;
  teamLogo: string;
  teamIcon: string;
  teamPrimaryColor: string;
  teamSecondaryColor: string;
  name: string;
  familyName: string;
  givenName: string;
  headshotUrl: string;
  role: string;
}

export interface Team {
  id: number | string;
  stats: { [key: string]: number };
  heroes: Heroes;
  earliestMatch: number;
}

export interface Heroes {
  [key: string]: { [key: string]: number };
}

interface TeamData {
  code: string;
  competitions: string[];
  icon: string;
  id: number;
  logo: string;
  name: string;
  primaryColor: string;
  roster: number[];
  secondaryColor: string;
  [key: string]: string | number | string[] | number[];
}

interface TeamsObject {
  [key: string]: TeamData;
}

function GridPage() {
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState();
  const [cols, setCols] = useState<TeamData[]>();
  const [accessToken, setAccessToken] = useState();
  const [gridSelected, setGridSelected] = useState<number[] | null>();
  const squares = [
    // [row, col]
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ];

  const tokenCalled = useRef<boolean>(false);
  useEffect(() => {
    const getAccessToken = async () => {
      const username = import.meta.env.VITE_CLIENT_ID;
      const password = import.meta.env.VITE_CLIENT_SECRET;
      if (!username || !password) {
        console.error("No client id or secret in the env file.");
        return false;
      }
      const res = await axios.post(
        "https://oauth.battle.net/token",
        qs.stringify({ grant_type: "client_credentials" }),
        {
          auth: {
            username,
            password,
          },
        }
      );

      if (res && res.data?.access_token) {
        setAccessToken(res.data.access_token);
        localStorage.setItem("access_token", res.data.access_token);
      }
    };
    if (!accessToken && !tokenCalled.current) {
      tokenCalled.current = true;
      getAccessToken();
    }
  }, []);

  const { data: owlData } = useQuery<OwlData>({ queryKey: ["owl2"] });
  // const { data: seasonData } = useQuery<SeasonData>({
  //   queryKey: ["segments/owl2-2023-regular-tournaments-playoffs"],
  // });

  function camelCaseToReadable(camelCaseString) {
    // Split the camelCaseString into words using regular expression
    const words = camelCaseString.split(/(?=[A-Z])/);

    // Capitalize the first letter of each word and join them back
    const readableString = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return readableString;
  }

  const currentDate = useMemo(() => {
    // Function to get the current date in 'YYYY-MM-DD' format

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (currentDate && gameMap && owlData) {
      const todaysGame = gameMap[currentDate];
      setRows(todaysGame.stats);
      setCols(todaysGame.teams.map((teamId) => owlData.teams[teamId]));
    }
  }, [currentDate, gameMap, owlData]);

  const LoadingSpinner = () => (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-14 h-14 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-owl-orange"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const GuessBlock = () => (
    <div>
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">
        Total Guesses
      </div>
      <div className="text-center text-7xl font-semibold">{count}</div>
    </div>
  );

  return (
    <div className="w-screen h-full min-h-screen flex justify-center items-center  text-white flex-col pr-4">
      <h1 className="w-full text-center  text-owl-orange mt-3 text-8xl md:text-9xl bebas">
        OWLdle
      </h1>
      <div className="mt-4 flex-shrink-0 flex-grow flex-col items-center justify-center flex">
        {!cols || !rows ? (
          <LoadingSpinner />
        ) : (
          <div className="flex-grow flex items-center justify-center ">
            <div>
              <div className="flex justify-evenly sm:justify-start">
                <div className="owl-logo w-20 sm:w-36 md:w-48 flex justify-center items-center"></div>
                {cols.map((teamData) => (
                  <div
                    className="w-20 sm:w-36 md:w-48 flex justify-center items-center px-3 pb-1"
                    key={teamData.id}
                  >
                    <img src={teamData.logo} alt={teamData.name} />
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <div>
                  {Object.keys(rows ?? {}).map((statName) => (
                    <div
                      className="flex items-center justify-center text-md md:text-3xl w-20 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 p-3 text-center"
                      key={statName}
                    >
                      {`${camelCaseToReadable(statName)} > ${rows[statName]}`}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl  dark:border-gray-950 grid grid-cols-3 grid-rows-3 overflow-hidden gap-1">
                  {squares.map((val) => (
                    <button
                      className="border-r border-b hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-center w-24 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 transition-colors duration-75 overflow-hidden dark:border-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#59d185] focus-visible:z-50"
                      key={val.toString()}
                      onClick={() => {
                        setGridSelected(val);
                        setCount((currentCount) => currentCount + 1);
                      }}
                    />
                  ))}
                </div>
                <div className="sm:w-36 md:w-48 h-full hidden justify-center sm:flex">
                  <GuessBlock />
                </div>
              </div>
              <div className="sm:w-36 md:w-48 h-full mt-4 flex justify-center sm:hidden">
                <GuessBlock />
              </div>
            </div>
          </div>
        )}
      </div>
      {gridSelected && rows && cols && (
        <div
          className="fixed inset-0 bg-gray-300 dark:bg-slate-600 dark:bg-opacity-50 bg-opacity-50 overflow-y-auto h-full w-full p-2"
          onClick={() => {
            setGridSelected(null);
          }}
        >
          <div
            className="relative top-20 mx-auto p-5 drop-shadow sm:w-96 shadow-lg rounded-md bg-white dark:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="mt-3 text-center p-4">
              <div className="text-2xl font-bold">Who ya got?</div>
              <div className="text-gray-500">
                {`${camelCaseToReadable(
                  Object.keys(rows)[gridSelected[0]]
                )} > ${Object.values(rows)[gridSelected[0]]}`}{" "}
                - {cols[gridSelected[1]].name}
              </div>
              <div className="flex items-center justify-centerw-full mt-4">
                <input
                  autoFocus
                  type="text"
                  className="w-full rounded-l-lg h-12 px-2"
                />
                <button className="bg-owl-orange rounded-r-lg h-12 ">
                  Guess
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <span className="text-gray-500 hidden sm:block mt-4 mb-2">
        This page was made using{" "}
        <a
          href="https://develop.battle.net/documentation/owl/community-apis"
          target="_blank"
        >
          the Overwatch League Community API.
        </a>{" "}
        Check out the code on{" "}
        <a href="https://github.com/SeaStove/owl-grid" target="_blank">
          GitHub
        </a>
        .
      </span>
    </div>
  );
}

export default GridPage;
