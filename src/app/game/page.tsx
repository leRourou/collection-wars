import { PlayingCard } from "@/components/game/playing-card";
import { getAllCardsShuffled } from "@/services/cards-service";

const GamePage = async () => {
  const cards = await getAllCardsShuffled();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between">
      {/* Zone du haut - Main de l'adversaire */}
      <div className="flex justify-center p-4">
        <div className="flex flex-wrap card-hand">
          {cards.slice(0, 5).map((card) => (
            <PlayingCard key={card.id} card={card} isFlipped={true} />
          ))}
        </div>
      </div>

      {/* Zone du milieu - Plateau de jeu */}
      <div className="flex justify-center items-center">
        <div className="flex gap-4">
          {cards.slice(0, 3).map((card) => (
            <PlayingCard key={card.id} card={card} isFlipped={true} />
          ))}
        </div>
      </div>

      {/* Zone du bas - Main du joueur */}
      <div className="flex justify-center p-4">
        <div className="flex flex-wrap card-hand">
          {cards.slice(5, 10).map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              isFlipped={false}
              selectable
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
