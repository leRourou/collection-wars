import { FloatingCardsBackground } from "@/components/ui/floating-cards-background";

export default function Home() {
  return (
    <>
      <FloatingCardsBackground />
      <div className="flex flex-col items-center justify-center min-h-screen p-8 relative z-10">
        <h1 className="text-4xl font-bold">Collection wars</h1>
        <div>
          <p className="text-lg text-gray-300">Bienvenue sur Collection Wars !</p>
        </div>
      </div>
    </>
  );
}
