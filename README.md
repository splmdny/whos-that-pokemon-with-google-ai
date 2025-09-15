# Who's That Pokémon? - The Twist!

A fun and challenging Pokémon quiz game built with React, TypeScript, and the Gemini API. Can you guess the Pokémon from its silhouette? Be careful—the silhouette might not be the Pokémon you're looking for!

## 🎮 How to Play

1.  **Start the Game**: Press the "Start Game!" button to begin.
2.  **See the Silhouette**: A silhouette of a random Pokémon will appear.
3.  **Make Your Guess**: Type the name of the Pokémon you think it is and press "Guess!".
4.  **The Twist**: The silhouette's shape might be one Pokémon, but the actual identity (and coloring) is a completely different one!
5.  **Get Clues**: You have three chances to guess. After each wrong guess, you'll receive a progressively easier clue to help you out.
6.  **The Reveal**: After a correct guess or three wrong attempts, the true Pokémon will be revealed, morphed into the shape of the silhouette.
7.  **Score Points**: Earn more points for guessing correctly on your first try!
8.  **Download & Share**: Download the unique AI-generated image of the morphed Pokémon and share your high score!

## ✨ Features

-   **The Twist Mechanic**: A source Pokémon is morphed into the shape of a target Pokémon silhouette, creating a unique visual challenge.
-   **AI-Powered Image Generation**: Uses the Google Gemini API to generate the unique "morphed" Pokémon images in real-time.
-   **Progressive AI Clue System**: If you guess incorrectly, the AI provides increasingly helpful hints:
    -   **First Clue (Hard)**: A hint about the Pokémon's color.
    -   **Second Clue (Easy)**: A simple, Pokedex-style clue about the Pokémon's most famous characteristic.
-   **Tiered Scoring System**:
    -   1st Try: **100 points**
    -   2nd Try: **50 points**
    -   3rd Try: **10 points**
-   **Expanded Roster**: Features a wide variety of Pokémon from Generations 1 through 5.
-   **Downloadable Artwork**: Save the one-of-a-kind AI-generated Pokémon art from each round.
-   **Authentic Sound Effects**: Classic "Who's That Pokémon?" audio and sound effects for correct/incorrect answers.
-   **Thematic UI**: A responsive and stylish interface inspired by the classic Pokémon anime.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI/Image Generation**: Google Gemini API (`gemini-2.5-flash-image-preview` and `gemini-2.5-flash`)
-   **Deployment**: Hosted as a static web app.

---

This project was created to demonstrate the creative capabilities of generative AI in a fun, interactive web application.
