import { useState, useEffect, useRef } from "react";
import axios from "axios";
import qs from "qs";
import { useQuery } from "@tanstack/react-query";

interface OwlData {
  currentSegments: string[];
  futureSegments: string[];
  matches: object;
  players: object;
  segments: object;
  teams: TeamsObject;
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
  const [rows, setRows] = useState<TeamData[]>();
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

  useEffect(() => {
    if (owlData && owlData?.teams && !rows && !cols) {
      const teamsData: TeamsObject = owlData?.teams;
      const teamInfo = Object.values(teamsData);

      // Shuffle the team IDs to get a random order
      const shuffledTeamIds = teamInfo.sort(() => Math.random() - 0.5);

      // Pick the first 3 teams for state 1
      const colsSelectedTeams = shuffledTeamIds.slice(0, 3);
      setCols(colsSelectedTeams);

      // Pick the next 3 teams for state 2
      const rowsSelectedTeams = shuffledTeamIds.slice(3, 6);
      setRows(rowsSelectedTeams);
    }
  }, [owlData]);

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
    <div className="w-screen h-full flex justify-center items-center  text-white flex-col pr-4">
      <h1 className="w-full text-center  text-owl-orange mt-3 text-8xl bebas">
        OWL GRID
      </h1>
      <div className="mt-4 flex-shrink-0 flex-grow flex-col items-center justify-center flex">
        {!cols || !rows ? (
          <LoadingSpinner />
        ) : (
          <div className="flex-grow flex items-center justify-center mt-4">
            <div>
              <div className="flex justify-evenly sm:justify-start">
                <div className="owl-logo w-20 sm:w-36 md:w-48 flex justify-center items-center"></div>
                {Object.values(cols ?? {}).map((teamData) => (
                  <div
                    className="w-20 sm:w-36 md:w-48 flex justify-center items-center p-3"
                    key={teamData.id}
                  >
                    <img src={teamData.logo} alt={teamData.name} />
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <div>
                  {Object.values(rows ?? {}).map((teamData) => (
                    <div
                      className="flex items-center justify-center w-20 sm:w-36 md:w-48 h-24 sm:h-36 md:h-48 p-3"
                      key={teamData.id}
                    >
                      <img src={teamData.logo} alt={teamData.name} />
                    </div>
                  ))}
                </div>
                <div className="rounded-xl  dark:border-gray-950 grid grid-cols-3 overflow-hidden gap-1">
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
          className="fixed inset-0 bg-gray-300 dark:bg-slate-600 dark:bg-opacity-50 bg-opacity-50 overflow-y-auto h-full w-full"
          onClick={() => {
            setGridSelected(null);
          }}
        >
          <div
            className="relative top-20 mx-auto p-5 drop-shadow w-96 shadow-lg rounded-md bg-white dark:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="mt-3 text-center">
              <div className="text-2xl font-bold">Who ya got?</div>
              <div className="text-gray-500">
                {rows[gridSelected[0]].name} - {cols[gridSelected[1]].name}
              </div>
              <div className="flex items-center justify-centerw-full mt-4">
                <input type="text" className="w-full rounded-l-lg h-12 px-2" />
                <button className="bg-owl-orange rounded-r-lg h-12 ">
                  Guess
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GridPage;
