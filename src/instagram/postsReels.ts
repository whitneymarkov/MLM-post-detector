import { instagramApi } from "../api/instagramApi"; // adjust path as needed
import { extractShortcodeFromUrl } from "../utils/shortCode";

let lastProcessedShortcode: string | null = null;

/**
 * Display the detection result below the first <article>
 */
function displayResultBelowArticle(prediction: string) {
  const firstArticle = document.querySelector("article");
  if (firstArticle) {
    const resultDiv = document.createElement("div");
    resultDiv.textContent = `MLM Detection Result: ${prediction}`;
    resultDiv.style.marginTop = "10px";
    resultDiv.style.fontWeight = "bold";
    resultDiv.style.background = "#fff";
    resultDiv.style.padding = "5px";
    resultDiv.style.border = "1px solid #ddd";

    firstArticle.insertAdjacentElement("afterend", resultDiv);
  } else {
    console.warn("No article found to display results below.");
  }
}

/**
 * Handle logic for a single post or reel page.
 * This function fetches the post content and sends it for analysis.
 */
export async function handleSinglePostOrReel(pathname: string) {
  const shortCode = extractShortcodeFromUrl(pathname);

  if (!shortCode) {
    console.warn("No shortcode found in URL:", pathname);
    return;
  }

  if (shortCode === lastProcessedShortcode) {
    console.log("Same shortcode as last time, skipping new fetch.");
    return;
  }

  try {
    const caption = await instagramApi.fetchPost(shortCode);
    console.log(caption);

    // Update the last processed shortcode
    lastProcessedShortcode = shortCode;

    chrome.runtime.sendMessage(
      { type: "analyse", payload: { post_content: caption } },
      (response) => {
        if (response && response.prediction) {
          console.log("Prediction:", response.prediction);
          displayResultBelowArticle(response.prediction);
        } else {
          console.warn("Analysis failed or no prediction received.");
        }
      }
    );
  } catch (error) {
    console.error("Failed to fetch post data:", error);
  }
}
