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
    | "pinguin"
    | "marine";
  color:
    | "black"
    | "dark_blue"
    | "light_blue"
    | "light_gray"
    | "light_green"
    | "light_orange"
    | "light_pink"
    | "orange"
    | "purple"
    | "white"
    | "yellow";
  improve?: boolean;
};
