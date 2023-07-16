import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GridPage from "./GridPage";

const baseUrl = "https://us.api.blizzard.com/owl/v1";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey: [url] }) => {
        const options: { headers?: { Authorization: string } } = {};
        const access_token = localStorage.getItem("access_token");
        if (access_token) {
          options["headers"] = { Authorization: `Bearer ${access_token}` };
        }
        const { data } = await axios.get(`${baseUrl}/${url}`, options);
        return data;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GridPage />
    </QueryClientProvider>
  );
}

export default App;
