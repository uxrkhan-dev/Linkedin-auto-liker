(async function automateLinkedInLikesAndComments() {
    let likedPosts = new Set();
    let totalLiked = 0;
    const maxLikes = 1000000;
    const likeButtonSelector = '.artdeco-button.artdeco-button--muted.artdeco-button--3.artdeco-button--tertiary.ember-view.social-actions-button.react-button__trigger';
    const commentBoxSelector = '.ql-editor[contenteditable="true"]';
    const commentPlaceholderSelector = '.comments-comment-box-comment__text-editor';
    const postButtonSelector = '.comments-comment-box__submit-button--cr.artdeco-button.artdeco-button--1.artdeco-button--primary.ember-view';

    const comments = [
        "Great insights, thanks for sharing!", "Really valuable content, appreciate you sharing this.", "Such a thoughtful post, well done.",
        "Love the perspective shared here.", "Insightful and well-articulated, thank you!", "Fantastic work, keep it up.",
        "This is so well put together, thanks for sharing.", "Great read! Appreciate the effort behind this.", "Impressive work, really inspiring.",
        "Such an interesting take, thanks for sharing!", "Valuable information, very well presented.", "Thanks for bringing this to light!", 
        "Really enjoyed reading this, great job.", "Brilliant work, thanks for sharing.", "Love this approach, well done!",
        "Thought-provoking content, thanks for sharing.", "Great effort, this was really helpful.", "Insightful and inspiring, keep it up!",
        "This adds so much value, thanks for sharing.", "Really well explained, thank you.", "Such an impactful post, appreciate it.",
        "Informative and clear, thanks for sharing!", "Appreciate the hard work behind this, well done.", "This is a great contribution, thanks!",
        "Very well presented, appreciate it!", "Love the creativity here, great work!", "Such an important topic, thanks for sharing.",
        "Great perspective, well written!", "This was enlightening, thank you.", "Appreciate this fresh perspective!", 
        "Really well thought out, thanks for sharing.", "Impressive insights, keep up the good work.", "Such a relevant topic, thanks for sharing.",
        "Fantastic breakdown, very helpful!", "Really appreciate this thoughtful post.", "Well done! Thanks for sharing.",
        "This is so informative, appreciate it!", "Love the clarity in this, great job.", "Such a well-crafted post, thanks!",
        "Great take on this topic, appreciate it.", "Really insightful, thanks for sharing.", "Helpful and clear, well done!",
        "Appreciate the effort behind this, thanks!", "This was a great read, thanks for sharing!", "Such a creative approach, well done.",
        "Very useful information, appreciate it!", "Really engaging content, thanks for sharing.", "Such a thoughtful contribution, well done!",
        "Excellent work, thanks for sharing.", "Great insights, very much appreciated.", "Appreciate the thoughtfulness behind this post."
    ];

    async function waitFor(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

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
        if (isAlreadyLiked) return false;

        likedPosts.add(likeButton);
        await clickElement(likeButton, 'Like button', 4000);
        totalLiked++;

        let randomDelay = Math.floor(Math.random() * 3000) + 2000;
        await waitFor(randomDelay);

        let commentPlaceholder = postContainer.querySelector(commentPlaceholderSelector);
        if (commentPlaceholder) await clickElement(commentPlaceholder, 'Comment Placeholder', 1000);

        let commentBox = postContainer.querySelector(commentBoxSelector);
        if (commentBox) {
            commentBox.click();
            await waitFor(1000);
            let randomComment = comments[Math.floor(Math.random() * comments.length)];
            commentBox.focus();
            document.execCommand("insertText", false, randomComment);
            let inputEvent = new Event("input", { bubbles: true });
            commentBox.dispatchEvent(inputEvent);
            await waitFor(1000); // Wait for the post button to appear
            let postButton = postContainer.querySelector(postButtonSelector);
            if (postButton) {
                console.log("✅ Post Comment Button found");
                await clickElement(postButton, 'Post Comment Button', 5000);
            } else {
                console.log("❌ Post Comment Button not found");
            }
        }
        let cooldown = Math.floor(Math.random() * 5000) + 3000;
        await waitFor(cooldown);
        return true;
    }

    async function processVisiblePosts() {
        const likeButtons = Array.from(document.querySelectorAll(likeButtonSelector)).filter(btn => !likedPosts.has(btn));
        for (const btn of likeButtons) {
            if (totalLiked >= maxLikes) return;
            await reactToPost(btn);
            await waitFor(5000);
        }
    }

    async function scrollAndObserve() {
        const observer = new MutationObserver(async () => { await processVisiblePosts(); });
        observer.observe(document.body, { childList: true, subtree: true });

        while (true) {
            window.scrollBy(0, 1000);
            await waitFor(5000);
            await processVisiblePosts();
        }
    }

    console.log("🚀 LinkedIn Auto Liker & Commenter Started...");
    await scrollAndObserve();
})();
