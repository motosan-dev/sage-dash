import { Toaster } from "sonner";
import { AppRouter } from "@/router";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster richColors closeButton position="top-right" />
    </>
  );
}

export default App;
