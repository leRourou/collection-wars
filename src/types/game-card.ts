export type GameCard = {
  id: string;
  type:
    | "boat"
    | "fish"
    | "swimmer"
    | "shark"
    | "crab"
    | "shell"
    | "octopus"
    | "sirene"
    | "pinguin";
  color: "blue" | "yellow" | "black" | "light_blue";
  improve?: boolean;
};
