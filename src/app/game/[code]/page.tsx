"use client";

import {
  CheckCircle2,
  CircleStop,
  Crown,
  Dice3,
  Hourglass,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { PlayingCard } from "@/components/game/playing-card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSocket } from "@/hooks/use-socket";
import { useSession } from "@/lib/auth/auth-client";
import { isDuoValid } from "@/lib/game/game-engine";
import type { RoundResult } from "@/lib/game/round-scoring";
import { calculateScore } from "@/lib/game/scoring";
import { useGameStore } from "@/store/game-store";
import type { Room } from "@/types/game";
import { EndRoundChoice, RoundPhase } from "@/types/game";
import type { GameCard } from "@/types/game-card";

const PLAYABLE_CARD_TYPES = ["boat", "crab", "fish", "swimmer", "shark"];

export default function GamePage() {
  const params = useParams();
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const {
    gameState,
    setGameState,
    selectedCards,
    toggleCardSelection,
    clearSelection,
    drawnCards,
    setDrawnCards,
  } = useGameStore();

  const roomCode = params.code as string;
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedCardForDiscard, setSelectedCardForDiscard] =
    useState<GameCard | null>(null);
  const [isSelectingDiscardPile, setIsSelectingDiscardPile] = useState(false);
  const [showEndRoundModal, setShowEndRoundModal] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [showRoundResultModal, setShowRoundResultModal] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [finalGameData, setFinalGameData] = useState<any>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  // Duo effect state
  const [effectInProgress, setEffectInProgress] = useState<{
    type: "crab" | "shark_swimmer" | null;
    step: "choose_pile" | "choose_card" | "choose_target" | null;
    pileIndex?: 1 | 2;
  } | null>(null);
  const [crabPileCards, setCrabPileCards] = useState<GameCard[]>([]);
  const [possibleTargets, setPossibleTargets] = useState<
    Array<{
      userId: string;
      name: string;
      handCount: number;
    }>
  >([]);

  // Helper function to check if a card type is playable in duos
  const isCardPlayable = (card: GameCard): boolean => {
    return PLAYABLE_CARD_TYPES.includes(card.type);
  };

  // Request game state and room info on mount if not present
  useEffect(() => {
    if (!socket || !isConnected) return;

    if (!gameState) {
      console.log("Requesting game state for:", roomCode);
      socket.emit("game:get-state", { roomCode });
    }

    if (!currentRoom) {
      console.log("Requesting room info for:", roomCode);
      socket.emit("room:get-info", { roomCode });
    }
  }, [socket, isConnected, roomCode, gameState, currentRoom]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room:joined", ({ room }) => {
      setCurrentRoom(room);
    });

    socket.on("room:info", ({ room }) => {
      setCurrentRoom(room);
    });

    socket.on("game:state-update", ({ gameState }) => {
      setGameState(gameState);
      setIsActionLoading(false);
    });

    socket.on("game:invalid-action", ({ message }) => {
      alert(message);
      setIsActionLoading(false);
    });

    socket.on("game:cards-drawn", ({ cards }) => {
      setDrawnCards(cards);
      setIsActionLoading(false);
    });

    socket.on("game:ended", ({ winnerId, finalScores }) => {
      setFinalGameData({ winnerId, finalScores });
      setShowRoundResultModal(false);
      setShowFinalSummary(true);
    });

    socket.on("round:ended", ({ scores, gameState, roundResult }) => {
      console.log("Round ended", scores, gameState, roundResult);
      if (roundResult) {
        setRoundResult(roundResult);
        setShowRoundResultModal(true);
      } else {
        toast.success("Manche terminée !");
      }
    });

    socket.on("round:continue-requested", () => {
      setShowRoundResultModal(false);
      toast.success("Nouvelle manche !");
    });

    // Duo effect event listeners
    socket.on("effect:crab-choose-pile", () => {
      setEffectInProgress({ type: "crab", step: "choose_pile" });
    });

    socket.on("effect:crab-show-cards", ({ pileIndex, cards }) => {
      setCrabPileCards(cards);
      setEffectInProgress({ type: "crab", step: "choose_card", pileIndex });
    });

    socket.on("effect:shark-swimmer-choose-target", ({ possibleTargets }) => {
      setPossibleTargets(possibleTargets);
      setEffectInProgress({ type: "shark_swimmer", step: "choose_target" });
    });

    socket.on("effect:executed", ({ effectType, metadata }) => {
      setEffectInProgress(null);
      setCrabPileCards([]);
      setPossibleTargets([]);

      switch (effectType) {
        case "crab":
          toast.success(
            `Carte récupérée : ${metadata.selectedCard?.type || "inconnue"}`,
          );
          break;
        case "boat":
          toast.success("Effet Bateau : Vous pouvez rejouer !");
          break;
        case "fish":
          toast.success(
            `Carte piochée : ${metadata.drawnCard?.type || "inconnue"}`,
          );
          break;
        case "shark_swimmer":
          toast.success(
            `Carte volée à ${metadata.targetPlayerName} : ${metadata.stolenCard?.type || "inconnue"}`,
          );
          break;
      }
    });

    socket.on("effect:failed", ({ effectType, reason }) => {
      setEffectInProgress(null);
      setCrabPileCards([]);
      setPossibleTargets([]);
      toast.error(`Effet ${effectType} impossible : ${reason}`);
    });

    return () => {
      socket.off("room:joined");
      socket.off("room:info");
      socket.off("game:state-update");
      socket.off("game:invalid-action");
      socket.off("game:cards-drawn");
      socket.off("game:ended");
      socket.off("round:ended");
      socket.off("round:continue-requested");
      socket.off("effect:crab-choose-pile");
      socket.off("effect:crab-show-cards");
      socket.off("effect:shark-swimmer-choose-target");
      socket.off("effect:executed");
      socket.off("effect:failed");
    };
  }, [socket, setGameState, setDrawnCards]);

  // Calculate derived values before conditional return
  const currentPlayer = gameState?.players?.[gameState.currentPlayerIndex];
  const myUserId = session?.user?.id;
  const myPlayer = gameState?.players.find((p) => p.userId === myUserId);
  const opponent = gameState?.players.find((p) => p.userId !== myUserId);
  const isMyTurn = currentPlayer?.userId === myUserId;
  const isHost = currentRoom?.hostId === myUserId;

  // Check which actions are available
  const canDrawDeck =
    (gameState?.deck.length ?? 0) >= 2 &&
    gameState?.roundPhase === RoundPhase.DRAW;
  const canDrawDiscard1 =
    gameState?.roundPhase === RoundPhase.DRAW &&
    (gameState?.discardPile1.length ?? 0) > 0;
  const canDrawDiscard2 =
    gameState?.roundPhase === RoundPhase.DRAW &&
    (gameState?.discardPile2.length ?? 0) > 0;

  // Check if selected cards form a valid duo
  const selectedCardsData = selectedCards
    .map((cardId) => myPlayer?.hand.find((c) => c.id === cardId))
    .filter(Boolean);

  const canPlayDuoNow =
    selectedCardsData.length === 2 &&
    gameState?.roundPhase !== RoundPhase.DRAW &&
    selectedCardsData[0] &&
    selectedCardsData[1] &&
    isDuoValid(selectedCardsData[0], selectedCardsData[1]);

  const canPassTurn = gameState?.roundPhase !== RoundPhase.DRAW;

  // Calculate current player points
  const myCurrentPoints = myPlayer ? calculateScore(myPlayer) : 0;

  const canEndRound = isMyTurn && myCurrentPoints >= 7;

  // Check if player has any valid actions available
  const hasAnyValidDuo = myPlayer?.hand
    ? myPlayer.hand.some((card1, i) =>
        myPlayer.hand.some((card2, j) => i < j && isDuoValid(card1, card2)),
      )
    : false;

  const hasValidActions =
    canDrawDeck || canDrawDiscard1 || canDrawDiscard2 || hasAnyValidDuo;

  // Auto-pass turn when no valid actions
  useEffect(() => {
    if (
      !isMyTurn ||
      !canPassTurn ||
      isActionLoading ||
      hasValidActions ||
      isSelectingDiscardPile ||
      drawnCards !== null ||
      myCurrentPoints >= 7 // Don't auto-pass if player can end the round
    )
      return;

    toast.info("Aucune action disponible, passage automatique du tour");
    const timer = setTimeout(() => {
      if (socket) {
        socket.emit("game:pass-turn");
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    isMyTurn,
    hasValidActions,
    canPassTurn,
    socket,
    isActionLoading,
    isSelectingDiscardPile,
    drawnCards,
  ]);

  if (!isConnected || !gameState) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleDrawFromDeck = () => {
    if (!socket || isActionLoading) return;
    setIsActionLoading(true);
    socket.emit("game:draw-from-deck");
  };

  const handleDrawFromDiscard = (pileIndex: 1 | 2) => {
    if (!socket || isActionLoading) return;
    setIsActionLoading(true);
    socket.emit("game:draw-from-discard", { pileIndex });
  };

  const handleCardSelection = (card: GameCard) => {
    setSelectedCardForDiscard(card);
    setIsSelectingDiscardPile(true);
  };

  const handleDiscardPileSelection = (pileIndex: 1 | 2) => {
    if (!socket || !selectedCardForDiscard) return;

    const otherCard = drawnCards?.find(
      (c) => c.id !== selectedCardForDiscard.id,
    );
    if (!otherCard) return;

    setIsActionLoading(true);

    socket.emit("game:keep-card", {
      cardId: selectedCardForDiscard.id,
      discardPileIndex: pileIndex,
    });

    setSelectedCardForDiscard(null);
    setIsSelectingDiscardPile(false);
    setDrawnCards(null);
  };

  const handlePlayDuo = () => {
    if (!socket || selectedCards.length !== 2 || isActionLoading) return;
    setIsActionLoading(true);
    socket.emit("game:play-duo", {
      cardIds: selectedCards as [string, string],
    });
    clearSelection();
  };

  const handlePassTurn = () => {
    if (!socket || isActionLoading) return;
    setIsActionLoading(true);
    socket.emit("game:pass-turn");
  };

  const handleEndRound = (choice: EndRoundChoice) => {
    if (!socket || isActionLoading) return;
    setIsActionLoading(true);
    setShowEndRoundModal(false);
    socket.emit("game:end-round", { choice });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between p-4">
      {/* Adversaire */}
      <div className="flex justify-center">
        <div className="text-center">
          <p className="font-semibold mb-2">
            {opponent?.name} - Score: {opponent?.score}
          </p>
          <div className="flex gap-1">
            {opponent?.hand.map((card) => (
              <div
                key={card.id}
                className="w-16 h-24 bg-blue-900 rounded border-2 border-blue-950"
              />
            ))}
          </div>

          {/* Cartes jouées par l'adversaire */}
          {opponent?.playedCards && opponent.playedCards.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-600 mb-1">Cartes jouées</p>
              <div className="flex flex-wrap gap-4 justify-center">
                {Array.from({
                  length: Math.ceil(opponent.playedCards.length / 2),
                }).map((_, duoIndex) => {
                  const card1 = opponent.playedCards[duoIndex * 2];
                  const card2 = opponent.playedCards[duoIndex * 2 + 1];
                  const duoKey = `${card1?.id || "empty"}-${card2?.id || "solo"}`;
                  return (
                    <div key={duoKey} className="flex relative">
                      {card1 && (
                        <div className="relative z-10">
                          <PlayingCard
                            key={card1.id}
                            card={card1}
                            isFlipped={false}
                            selectable={false}
                            size="small"
                          />
                        </div>
                      )}
                      {card2 && (
                        <div className="relative -ml-16 z-0">
                          <PlayingCard
                            key={card2.id}
                            card={card2}
                            isFlipped={false}
                            selectable={false}
                            size="small"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plateau central */}
      <div className="flex justify-center items-center gap-8">
        <div className="text-center">
          <p className="text-sm mb-2">Défausse 1</p>
          {gameState.discardPile1.length > 0 ? (
            <button
              type="button"
              onClick={() => handleDrawFromDiscard(1)}
              disabled={!isMyTurn || !canDrawDiscard1 || isActionLoading}
            >
              <PlayingCard
                card={gameState.discardPile1[gameState.discardPile1.length - 1]}
                isFlipped={false}
                selectable={isMyTurn && canDrawDiscard1 && !isActionLoading}
              />
            </button>
          ) : (
            <div className="w-32 h-48 border-2 border-dashed border-gray-400 rounded" />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm mb-2">Pioche ({gameState.deck.length})</p>
          <Button
            onClick={handleDrawFromDeck}
            disabled={!isMyTurn || !canDrawDeck || isActionLoading}
          >
            {isActionLoading ? (
              <>
                <Spinner className="mr-2" />
                Pioche...
              </>
            ) : (
              "Piocher"
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm mb-2">Défausse 2</p>
          {gameState.discardPile2.length > 0 ? (
            <button
              type="button"
              onClick={() => handleDrawFromDiscard(2)}
              disabled={!isMyTurn || !canDrawDiscard2 || isActionLoading}
            >
              <PlayingCard
                card={gameState.discardPile2[gameState.discardPile2.length - 1]}
                isFlipped={false}
                selectable={isMyTurn && canDrawDiscard2 && !isActionLoading}
              />
            </button>
          ) : (
            <div className="w-32 h-48 border-2 border-dashed border-gray-400 rounded" />
          )}
        </div>
      </div>

      {/* Cartes piochées (choix) */}
      {drawnCards && !isSelectingDiscardPile && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <h3 className="text-lg font-semibold mb-6 text-center">
              Choisissez une carte à garder
            </h3>
            <div className="flex gap-6">
              {drawnCards.map((card) => (
                <button
                  type="button"
                  key={card.id}
                  onClick={() => handleCardSelection(card)}
                  className="transition-transform hover:scale-105"
                >
                  <PlayingCard
                    card={card}
                    isFlipped={false}
                    selectable={true}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sélection de la défausse */}
      {isSelectingDiscardPile && selectedCardForDiscard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <h3 className="text-lg font-semibold mb-6 text-center">
              Choisissez une défausse pour l'autre carte
            </h3>
            <div className="flex gap-6 justify-center">
              <button
                type="button"
                onClick={() => handleDiscardPileSelection(1)}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                Défausse 1
              </button>
              <button
                type="button"
                onClick={() => handleDiscardPileSelection(2)}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Défausse 2
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résultat de manche */}
      {showRoundResultModal && roundResult && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              {roundResult.choice === "stop" ? (
                <>
                  <CircleStop className="w-6 h-6 text-red-500" />
                  <span>STOP</span>
                </>
              ) : (
                <>
                  <Dice3 className="w-6 h-6 text-blue-500" />
                  <span>DERNIÈRE CHANCE</span>
                </>
              )}
            </h3>

            {roundResult.choice === "last_chance" && (
              <div className="mb-6 text-center">
                <p className="text-lg font-semibold">
                  {roundResult.roundEnderWon ? (
                    <span className="text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      {
                        roundResult.playerScores.find(
                          (p: any) => p.wasRoundEnder,
                        )?.name
                      }{" "}
                      a gagné son pari !
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" />
                      {
                        roundResult.playerScores.find(
                          (p: any) => p.wasRoundEnder,
                        )?.name
                      }{" "}
                      a perdu son pari !
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {roundResult.playerScores.map((playerScore: any) => (
                <div
                  key={playerScore.userId}
                  className={`p-4 rounded-lg border-2 ${
                    playerScore.wasRoundEnder
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      {playerScore.name}
                      {playerScore.wasRoundEnder && (
                        <Crown className="w-5 h-5 text-yellow-500" />
                      )}
                    </h4>
                    <span className="text-2xl font-bold text-blue-600">
                      +{playerScore.totalPoints} points
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Points des cartes :</span>
                      <span className="font-semibold">
                        {playerScore.cardPoints}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus couleur :</span>
                      <span className="font-semibold">
                        {playerScore.colorBonus}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-1 mt-1 flex justify-between font-bold">
                      <span>Total gagné :</span>
                      <span className="text-blue-600">
                        {playerScore.totalPoints}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(() => {
              const hasWinner = gameState?.players.some(
                (p) => p.score >= (gameState?.targetScore || 40),
              );

              if (hasWinner) {
                return (
                  <button
                    type="button"
                    onClick={() => setShowRoundResultModal(false)}
                    className="mt-6 w-full px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Voir les résultats finaux
                  </button>
                );
              }

              if (isHost) {
                return (
                  <div className="mt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        socket?.emit("round:host-continue");
                        setShowRoundResultModal(false);
                      }}
                      className="flex-1 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Continuer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        socket?.emit("round:host-stop");
                        setShowRoundResultModal(false);
                      }}
                      className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      Arrêter la partie
                    </button>
                  </div>
                );
              }

              return (
                <div className="mt-6 text-center py-4 text-gray-600">
                  <p className="text-lg font-semibold">
                    En attente de l'hôte...
                  </p>
                  <p className="text-sm mt-2">
                    L'hôte décide de continuer ou d'arrêter la partie
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal de résumé final */}
      {showFinalSummary && finalGameData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-3xl">
            <h3 className="text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span>Partie terminée !</span>
            </h3>

            <div className="space-y-4 mb-6">
              {Object.entries(finalGameData.finalScores)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([userId, score], index) => {
                  const player = gameState?.players.find(
                    (p) => p.userId === userId,
                  );
                  const isWinner = userId === finalGameData.winnerId;

                  return (
                    <div
                      key={userId}
                      className={`p-4 rounded-lg border-2 ${
                        isWinner
                          ? "border-yellow-400 bg-yellow-50"
                          : "border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <span className="text-xl font-bold flex items-center gap-2">
                            {player?.name}{" "}
                            {isWinner && (
                              <Crown className="w-5 h-5 text-yellow-500" />
                            )}
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-blue-600">
                          {score as number} points
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = `/lobby/${gameState?.roomCode}`;
              }}
              className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Retour au lobby
            </button>
          </div>
        </div>
      )}

      {/* Modal de fin de manche */}
      {showEndRoundModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Mettre fin à la manche ?
            </h3>
            <p className="text-center mb-6 text-gray-700">
              Vous avez {myCurrentPoints} points. Choisissez votre stratégie :
            </p>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => handleEndRound(EndRoundChoice.STOP)}
                className="px-8 py-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-left"
              >
                <div className="font-bold text-xl mb-2">STOP</div>
                <div className="text-sm">
                  Vous ne prenez aucun risque. Tous les joueurs révèlent leur
                  main et marquent immédiatement leurs points.
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleEndRound(EndRoundChoice.LAST_CHANCE)}
                className="px-8 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors text-left"
              >
                <div className="font-bold text-xl mb-2">DERNIÈRE CHANCE</div>
                <div className="text-sm">
                  Pari : avoir le plus de points à la fin. Les autres joueurs
                  jouent un dernier tour. Si vous gagnez : vous marquez vos
                  points + bonus couleur. Les adversaires : uniquement bonus
                  couleur. Si vous perdez : vous marquez uniquement bonus
                  couleur. Les adversaires : points normaux.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowEndRoundModal(false)}
                className="px-8 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ma main */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-semibold">
              {myPlayer?.name} - Score: {myPlayer?.score}
            </p>
            <p className="text-sm text-gray-500">
              {isMyTurn ? (
                <span className="text-green-600 font-semibold flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  C'est votre tour !
                </span>
              ) : (
                <span className="text-orange-600 font-semibold flex items-center gap-1.5">
                  <Hourglass className="w-4 h-4" />
                  Tour de {opponent?.name}
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-blue-600">
                {myCurrentPoints} points
              </span>
              {myCurrentPoints >= 7 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                  Peut terminer la manche
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handlePlayDuo}
              disabled={!isMyTurn || !canPlayDuoNow || isActionLoading}
              variant="secondary"
            >
              {isActionLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Joue...
                </>
              ) : (
                `Jouer duo (${selectedCards.length}/2)`
              )}
            </Button>
            <Button
              onClick={() => setShowEndRoundModal(true)}
              disabled={!canEndRound || isActionLoading}
              variant="destructive"
            >
              Mettre fin à la manche
            </Button>
            <Button
              onClick={handlePassTurn}
              disabled={!isMyTurn || !canPassTurn || isActionLoading}
            >
              {isActionLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Passe...
                </>
              ) : (
                "Passer le tour"
              )}
            </Button>
          </div>
        </div>

        {myPlayer?.playedCards && myPlayer.playedCards.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">Mes cartes jouées</p>
            <div className="flex flex-wrap gap-4">
              {Array.from({
                length: Math.ceil(myPlayer.playedCards.length / 2),
              }).map((_, duoIndex) => {
                const card1 = myPlayer.playedCards[duoIndex * 2];
                const card2 = myPlayer.playedCards[duoIndex * 2 + 1];
                const duoKey = `${card1?.id || "empty"}-${card2?.id || "solo"}`;
                return (
                  <div key={duoKey} className="flex relative">
                    {card1 && (
                      <div className="relative z-10">
                        <PlayingCard
                          key={card1.id}
                          card={card1}
                          isFlipped={false}
                          selectable={false}
                          size="small"
                        />
                      </div>
                    )}
                    {card2 && (
                      <div className="relative -ml-16 z-0">
                        <PlayingCard
                          key={card2.id}
                          card={card2}
                          isFlipped={false}
                          selectable={false}
                          size="small"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {myPlayer?.hand.map((card) => {
            const playable = isCardPlayable(card);
            return (
              <button
                type="button"
                key={card.id}
                onClick={() =>
                  isMyTurn && playable && toggleCardSelection(card.id)
                }
                disabled={!playable}
              >
                <PlayingCard
                  card={card}
                  isFlipped={false}
                  selectable={isMyTurn && playable}
                  isSelected={selectedCards.includes(card.id)}
                  disabled={!playable}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal choix de pile (effet crabe) */}
      {effectInProgress?.type === "crab" &&
        effectInProgress.step === "choose_pile" && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl">
              <h3 className="text-lg font-semibold mb-6 text-center text-gray-900">
                Effet Crabe : Choisissez une défausse
              </h3>
              <div className="flex gap-6 justify-center">
                <button
                  type="button"
                  onClick={() =>
                    socket?.emit("effect:crab-select-pile", { pileIndex: 1 })
                  }
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={gameState?.discardPile1.length === 0}
                >
                  Défausse 1
                  <div className="text-sm mt-1">
                    ({gameState?.discardPile1.length || 0} cartes)
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    socket?.emit("effect:crab-select-pile", { pileIndex: 2 })
                  }
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={gameState?.discardPile2.length === 0}
                >
                  Défausse 2
                  <div className="text-sm mt-1">
                    ({gameState?.discardPile2.length || 0} cartes)
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Modal sélection de carte (effet crabe) */}
      {effectInProgress?.type === "crab" &&
        effectInProgress.step === "choose_card" && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-6xl w-full overflow-y-auto max-h-[90vh]">
              <h3 className="text-lg font-semibold mb-6 text-center text-gray-900">
                Choisissez une carte à récupérer
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {crabPileCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (effectInProgress.pileIndex) {
                        socket?.emit("effect:crab-select-card", {
                          cardId: card.id,
                          pileIndex: effectInProgress.pileIndex,
                        });
                      }
                    }}
                    className="transition-transform hover:scale-105"
                  >
                    <PlayingCard
                      card={card}
                      isFlipped={false}
                      selectable={true}
                      size="medium"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Modal sélection de cible (effet requin/nageur) */}
      {effectInProgress?.type === "shark_swimmer" &&
        effectInProgress.step === "choose_target" && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl">
              <h3 className="text-lg font-semibold mb-6 text-center text-gray-900">
                Effet Requin/Nageur : Choisissez un adversaire
              </h3>
              <div className="flex flex-col gap-4">
                {possibleTargets.map((target) => (
                  <button
                    key={target.userId}
                    type="button"
                    onClick={() => {
                      socket?.emit("effect:shark-swimmer-select-target", {
                        targetPlayerId: target.userId,
                      });
                    }}
                    className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {target.name}
                    <div className="text-sm mt-1">
                      ({target.handCount} cartes)
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      <Toaster position="top-center" richColors />
    </div>
  );
}
