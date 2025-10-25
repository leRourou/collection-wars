"use client";
import { CardStack } from "@/components/game/card-stack";

const GamePage = () => {
    return (
        <div className="flex items-center justify-center gap-8 h-2xl">
            <CardStack
                cards={[{ id: 1, name: "Card 1", type: "COLLECTION" }]}
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
            </CardStack>
        </div>
    );
};

export default GamePage;
