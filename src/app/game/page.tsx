import { CardStack } from "@/components/game/card-stack";
import { PlayingCard } from "@/components/game/playing-card";
import { getAllCardsShuffled } from "@/services/cards-service";

const GamePage = async () => {
    const cards = await getAllCardsShuffled();

    return (
        <div className="flex items-center justify-center gap-8 h-2xl">
            {
                /* <CardStack
                cards={[{ id: "boat_1", name: "Card 1", type: "boat" }]}
                name={"My Card Stack"}
                faceUp
            >
                Game Page
            </CardStack>
            <CardStack
                cards={[{ id: 1, name: "Card 1", type: "COLLECTION" }, {
                    id: 2,
                    name: "Card 1",
                    type: "COLLECTION",
                }, { id: 1, name: "Card 1", type: "COLLECTION" }]}
                name={"My Card Stack"}
            >
                Game Page
            </CardStack>
            <CardStack
                cards={[{ id: 1, name: "Card 1", type: "COLLECTION" }]}
                name={"My Card Stack"}
                faceUp
            >
                Game Page
            </CardStack> */
            }
            <div className="flex flex-col">
                <div className="flex flex-wrap card-hand">
                    {cards.slice(0, 5).map((card) => (
                        <PlayingCard
                            key={card.id}
                            card={card}
                            isFlipped={true}
                        />
                    ))}
                </div>
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
