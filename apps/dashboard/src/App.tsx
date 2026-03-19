import { cn } from "@motosan/sage-ui";

function App() {
  return (
    <div className={cn("min-h-screen flex items-center justify-center")}>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sage Dash</h1>
        <p className="mt-2 text-muted-foreground">
          Dashboard monorepo powered by Vite, React 19, and Tailwind CSS v4
        </p>
      </div>
    </div>
  );
}

export default App;
