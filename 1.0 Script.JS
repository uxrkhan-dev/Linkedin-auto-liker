(async function automateLinkedInLikesAndComments() {
    let likedPosts = new Set();
    let totalLiked = 0;
    const maxLikes = 1000000;
    const likeButtonSelector = '.artdeco-button.artdeco-button--muted.artdeco-button--3.artdeco-button--tertiary.ember-view.social-actions-button.react-button__trigger';
    const commentBoxSelector = '.ql-editor[contenteditable="true"]';
    const commentPlaceholderSelector = '.comments-comment-box-comment__text-editor';
    const postButtonSelector = '.comments-comment-box__submit-button--cr.artdeco-button.artdeco-button--1.artdeco-button--primary.ember-view';

    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.padding = '10px';
    popup.style.backgroundColor = 'white';
    popup.style.color = 'black';
    popup.style.border = '2px solid #0073b1';
    popup.style.borderRadius = '5px';
    popup.style.fontSize = '14px';
    popup.style.zIndex = '10000';
    popup.innerHTML = `
        <h4>LinkedIn Auto Liker & Commenter</h4>
        <p id="likeCount">Liked: 0</p>
        <p id="status">Status: Running...</p>
    `;
    document.body.appendChild(popup);

    function updatePopup() {
        document.getElementById('likeCount').innerText = `Liked: ${totalLiked}`;
    }

    function updateStatus(text) {
        document.getElementById('status').innerText = `Status: ${text}`;
    }

    async function waitFor(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function clickElement(element, description, delay = 3000) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await waitFor(1000);
            element.click();
            console.log(`✅ Clicked: ${description}`);
            await waitFor(delay);
            return true;
        }
        return false;
    }

    async function reactToPost(likeButton) {
        if (!likeButton || likedPosts.has(likeButton)) return false;

        let postContainer = likeButton.closest('.feed-shared-update-v2');
        if (!postContainer) return false;

        let isAlreadyLiked = likeButton.classList.contains('react-button--active');
        if (isAlreadyLiked) {
            console.log("✅ Already liked, skipping...");
            return false;
        }

        likedPosts.add(likeButton);

        // Like the post
        await clickElement(likeButton, 'Like button', 4000);
        totalLiked++;
        updatePopup();

        // Add human-like delay after liking
        let randomDelay = Math.floor(Math.random() * 3000) + 2000;
        console.log(`⏳ Waiting ${randomDelay / 1000}s before commenting...`);
        await waitFor(randomDelay);

        // Comment on the Post
        let commentPlaceholder = postContainer.querySelector(commentPlaceholderSelector);
        if (commentPlaceholder) {
            await clickElement(commentPlaceholder, 'Comment Placeholder', 1000);
        } else {
            console.log("⚠️ Comment placeholder not found.");
            return false;
        }

        let commentBox = postContainer.querySelector(commentBoxSelector);
        if (commentBox) {
            commentBox.click();
            await waitFor(1000);

            let randomEmojis = getRandomEmojis(3);
            for (let char of randomEmojis) {
                commentBox.focus();
                document.execCommand("insertText", false, char);
                await waitFor(Math.floor(Math.random() * 300) + 200);
            }

            let inputEvent = new Event("input", { bubbles: true });
            commentBox.dispatchEvent(inputEvent);
            console.log(`💬 Commented: ${randomEmojis}`);

            await waitFor(2000);

            let postButton = postContainer.querySelector(postButtonSelector);
            if (postButton) {
                await clickElement(postButton, 'Post Comment Button', 5000);
            } else {
                console.log("⚠️ Comment button not found.");
            }
        }

        // Cool-down period after each interaction
        let cooldown = Math.floor(Math.random() * 5000) + 3000;
        console.log(`⏳ Cooling down for ${cooldown / 1000}s before next post...`);
        updateStatus("Cooling down...");
        await waitFor(cooldown);
        updateStatus("Running...");

        return true;
    }

    async function processVisiblePosts() {
        const likeButtons = Array.from(document.querySelectorAll(likeButtonSelector)).filter(btn => !likedPosts.has(btn));
        for (const btn of likeButtons) {
            if (totalLiked >= maxLikes) {
                updateStatus("Max likes reached. Stopping...");
                console.log("🚫 Max likes reached. Stopping...");
                return;
            }
            await reactToPost(btn);
            await waitFor(5000);
        }
    }

    async function scrollAndObserve() {
        updateStatus("Initializing observer...");

        const observer = new MutationObserver(async () => {
            await processVisiblePosts();
        });

        observer.observe(document.body, { childList: true, subtree: true });

        while (true) {
            window.scrollBy(0, 1000);
            await waitFor(5000);
            await processVisiblePosts();
        }
    }

    console.log("🚀 LinkedIn Auto Liker & Commenter Started...");
    await scrollAndObserve();
    console.log("✅ Script Running Continuously!");
})();

function getRandomEmojis(count) {
    const emojiList = ["❤️", "🔥", "👏", "😊", "💪", "🚀", "🙌", "🎉", "👍", "💯", "🌟", "✨", "💥", "🙏", "🤩"];
    let selectedEmojis = [];
    for (let i = 0; i < count; i++) {
        let randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        selectedEmojis.push(randomEmoji);
    }
    return selectedEmojis.join(" ");
}
