"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface FloatingCard {
  id: number;
  imagePath: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  duration: number;
  delay: number;
  translateX: number;
  translateY: number;
  rotationEnd: number;
}

const CARD_IMAGES = [
  "boat_1",
  "boat_2",
  "boat_3",
  "boat_4",
  "boat_5",
  "boat_6",
  "boat_7",
  "boat_8",
  "crab_1",
  "crab_2",
  "crab_3",
  "crab_4",
  "crab_5",
  "crab_6",
  "crab_7",
  "crab_8",
  "crab_9",
  "fish_1",
  "fish_2",
  "fish_3",
  "fish_4",
  "fish_5",
  "fish_6",
  "fish_7",
  "swimmer_1",
  "swimmer_2",
  "swimmer_3",
  "swimmer_4",
  "swimmer_5",
  "shark_1",
  "shark_2",
  "shark_3",
  "shark_4",
  "shark_5",
  "shell_1",
  "shell_2",
  "shell_3",
  "shell_4",
  "shell_5",
  "shell_6",
  "octopus_1",
  "octopus_2",
  "octopus_3",
  "octopus_4",
  "octopus_5",
  "pinguin_1",
  "pinguin_2",
  "pinguin_3",
  "marine_1",
  "marine_2",
  "sirene",
  "boat_imp",
  "fish_imp",
  "pinguin_imp",
  "marine_imp",
];

const generateFloatingCards = (count: number): FloatingCard[] => {
  return Array.from({ length: count }, (_, i) => {
    const randomCard =
      CARD_IMAGES[Math.floor(Math.random() * CARD_IMAGES.length)];

    return {
      id: i,
      imagePath: `/cards/${randomCard}.webp`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      scale: Math.random() * 0.4 + 0.6, // 0.6 à 1.0
      duration: Math.random() * 40 + 40, // 40s à 80s pour une vitesse lente
      delay: 0, // Toutes les cartes commencent en même temps
      translateX: (Math.random() - 0.5) * 800, // -400px à 400px
      translateY: (Math.random() - 0.5) * 600, // -300px à 300px
      rotationEnd: Math.random() * 360 + 360, // rotation complète + aléatoire
    };
  });
};

export function FloatingCardsBackground({
  cardCount = 15,
}: {
  cardCount?: number;
}) {
  const [cards, setCards] = useState<FloatingCard[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCards(generateFloatingCards(cardCount));
    setMounted(true);
  }, [cardCount]);

  if (!mounted) return null;

  return (
    <>
      <style>{`
        ${cards
          .map(
            (card) => `
          @keyframes float-${card.id} {
            0%, 100% {
              transform: translate(0, 0) rotate(${card.rotation}deg) scale(${card.scale});
            }
            25% {
              transform: translate(${card.translateX * 0.3}px, ${card.translateY * 0.3}px) rotate(${card.rotation + 90}deg) scale(${card.scale * 1.05});
            }
            50% {
              transform: translate(${card.translateX}px, ${card.translateY}px) rotate(${card.rotation + 180}deg) scale(${card.scale * 0.95});
            }
            75% {
              transform: translate(${card.translateX * 0.5}px, ${card.translateY * -0.3}px) rotate(${card.rotation + 270}deg) scale(${card.scale * 1.02});
            }
          }
        `,
          )
          .join("\n")}
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {cards.map((card) => (
          <div
            key={card.id}
            className="absolute w-24 h-32"
            style={{
              left: `${card.x}%`,
              top: `${card.y}%`,
              animation: `float-${card.id} ${card.duration}s ease-in-out infinite`,
              animationDelay: `${card.delay}s`,
            }}
          >
            <Image
              src={card.imagePath}
              alt=""
              width={96}
              height={128}
              className="object-cover rounded-lg shadow-lg opacity-15 dark:opacity-10"
              unoptimized
            />
          </div>
        ))}
      </div>
    </>
  );
}
