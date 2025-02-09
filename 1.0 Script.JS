(async function automateLinkedInLikes() {
    let likedPosts = new Set(); // Track already liked posts
    let totalLiked = 0;
    const maxLikes = 1000000; // Large number to ensure continuous operation
    const likeButtonSelector = '.artdeco-button.artdeco-button--muted.artdeco-button--3.artdeco-button--tertiary.ember-view.social-actions-button.react-button__trigger';
    const reactionSelectors = {
        'Like': '.reactions-option[aria-label="Like"]',
        'Love': '.reactions-option[aria-label="Celebrate"]',
        'Insightful': '.reactions-option[aria-label="Insightful"]'
    };

    // Create floating popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.padding = '10px';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = 'white';
    popup.style.borderRadius = '5px';
    popup.style.fontSize = '14px';
    popup.style.zIndex = '10000';
    popup.innerHTML = `
        <h4>LinkedIn Auto Liker</h4>
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

    async function clickElement(element, description, delay = 2000) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to button
            await waitFor(500); // Allow smooth scrolling
            element.click();
            console.log(`✅ Clicked: ${description}`);
            await waitFor(delay);
            return true;
        }
        return false;
    }

    async function reactToPost(likeButton) {
        if (!likeButton || likedPosts.has(likeButton)) return false; // Skip if already liked

        let postContainer = likeButton.closest('.feed-shared-update-v2'); // Find post container
        if (!postContainer) return false; // Skip if post not found

        let isAlreadyLiked = likeButton.classList.contains('react-button--active');
        if (isAlreadyLiked) {
            console.log("✅ Already liked, skipping...");
            return false;
        }

        likedPosts.add(likeButton); // Mark as processed
        await clickElement(likeButton, 'Like button', 2000);

        // Randomly choose a reaction
        let reactionType = ['Like', 'Love', 'Insightful'][Math.floor(Math.random() * 3)];
        let reactionSelector = reactionSelectors[reactionType];

        let reactionButton = document.querySelector(reactionSelector);
        if (reactionButton) {
            await clickElement(reactionButton, `${reactionType} reaction`, 1000);
        }

        totalLiked++;
        updatePopup();
        return true;
    }

    async function scrollAndLike() {
        let lastScrollHeight = 0;
        let scrollAttempts = 0;

        while (true) {
            updateStatus("Scrolling & Looking for Likes...");
            let likeButtons = Array.from(document.querySelectorAll(likeButtonSelector)).filter(btn => !likedPosts.has(btn));
            
            if (likeButtons.length === 0) {
                scrollAttempts++;
                console.log(`🔄 No new like buttons found. Scrolling attempt: ${scrollAttempts}`);

                if (scrollAttempts >= 5) {  
                    updateStatus("Reloading page...");
                    console.log("🔄 Reloading page due to lack of new posts...");
                    window.location.reload();
                    return;
                }

                window.scrollBy(0, 1000);
                await waitFor(3000);
                continue;
            }

            scrollAttempts = 0; // Reset scroll attempts if we find new posts

            for (let btn of likeButtons) {
                await reactToPost(btn);
                await waitFor(2000);
            }

            window.scrollBy(0, 1000);
            await waitFor(3000);

            if (document.documentElement.scrollHeight === lastScrollHeight) {
                console.log("📌 Reached end of feed. Reloading...");
                updateStatus("Reloading page...");
                window.location.reload();
                return;
            }
            lastScrollHeight = document.documentElement.scrollHeight;
        }
    }

    console.log("🚀 LinkedIn Auto Liker Started...");
    await scrollAndLike();
    console.log("✅ Script Running Continuously!");
})();
