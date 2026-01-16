# Visual Hypotheses for Article 12 (Board FAQ)

We can leverage `app.js` to parse the `H2 > Blockquote > Text` structure and transform it into a premium interactive experience. Here are 3 approaches:

## 1. The "Red Team vs. Blue Team" Cards (Split View)
*   **Concept:** Visually separate the "Objection" (Fear) from the "Response" (Strategy).
*   **Metaphor:** A battle card.
*   **Visuals:**
    - **The Container:** A glass-morphic card for each question.
    - **The Challenge (Blockquote):** Dark background/Grey, serif font, "voice of the skeptic". Icon: ⚔️
    - **The Defense (Text):** Light background/Teal accent, sans-serif, "voice of reason". Icon: 🛡️
*   **Pros:** Very clear distinction between the "problem" and the "solution". High impact.

## 2. The "Interactive Briefing" (Accordion/Focus)
*   **Concept:** Don't overwhelm the board with text. Show only the fatal questions first.
*   **Metaphor:** A classified dossier where you unseal sections.
*   **Interaction:**
    - Page loads showing only a grid of **7 Big Questions** (H2s).
    - Clicking a question expands it (smooth animation), revealing the text.
    - The "Objection" is highlighted in a warning color box inside the expanded view.
*   **Pros:** Cleanest initial view. Good for presentation control (you click as you speak).

## 3. The "Dialogue Stream" (Chat/Editorial)
*   **Concept:** Treat it as a high-stakes conversation.
*   **Metaphor:** A transcript of a board meeting.
*   **Visuals:**
    - Objections align slightly left, styled like a distinct "statement" bubble.
    - Responses align full width or slightly right, flowing naturally.
    - Use "Connectors" (lines) to show the flow from objection to answer.
*   **Pros:** Very readable, feels like a narrative.

### Recommended Path: Option 1 (Red Team Cards)
It fits best with the "War Room" aesthetic of the rest of the report and makes the "Conflict vs. Resolution" dynamic visceral.
