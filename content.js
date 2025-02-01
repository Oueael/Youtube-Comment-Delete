// Function to highlight elements (visual cue when deletion occurs)
function highlightElement(el) {
    el.style.backgroundColor = '#ffcccb'; // Light red
    setTimeout(() => {
      el.style.backgroundColor = ''; // Reset background color after 1s
    }, 1000);
}

// Function to determine the best selector for the "Delete" button
function determineBestSelector() {
    const SELECTORS = [
      '.VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.mN1ivc',
      '[aria-label^="Delete activity item"]',
      '[jscontroller="soHxf"]'
    ];

    // Get the selector that matches the least amount of elements (more specific)
    SELECTORS.sort((a, b) => document.querySelectorAll(a).length - document.querySelectorAll(b).length);
    return SELECTORS[0];
}

// Function to bypass the confirmation popup
function bypassDeleteConfirmation() {
    const deleteButton = document.querySelector('[aria-label="Delete activity item"]');
    
    if (deleteButton) {
      deleteButton.click();
      console.log("Confirmation bypassed and comment deleted.");
    } else {
      console.log("Delete button not found.");
    }
}

// Function to delete comments in batches
async function deleteComments(deleteBatchSize) {
    const bestSelector = determineBestSelector();
    let deleteButtons = [...document.querySelectorAll(bestSelector)];

    let count = 0;

    while (deleteButtons.length && (count < deleteBatchSize || deleteBatchSize === Infinity)) {
        const btn = deleteButtons.pop();

        btn.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        highlightElement(btn);
        await new Promise(resolve => setTimeout(resolve, 2000));
        btn.click();
        count++;
        await new Promise(resolve => setTimeout(resolve, 1500));

        bypassDeleteConfirmation();

        if (cancelDeletion) {
            console.log("Deletion process canceled.");
            return;
        }
    }

    return deleteButtons.length;
}

let cancelDeletion = false;

function listenForCancel() {
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cancelDeletion = true;
        }
    });
}

async function scrollToBottom() {
    while (!document.evaluate("//div[contains(text(), 'Looks like you\'ve reached the end')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function ensureOnCorrectActivityPage() {
    const elementsData = [
        {
            url: "https://myactivity.google.com/page?hl=en&utm_medium=web&utm_source=youtube&page=youtube_comments",
            content: "Your YouTube comments"
        }
    ];

    const currentUrl = window.location.href;
    const elementsWithClass = Array.from(document.querySelectorAll('.jPCT6'));

    for (let elementData of elementsData) {
        if (currentUrl.startsWith(elementData.url)) {
            if (elementsWithClass.some(el => el.textContent.toLowerCase().includes(elementData.content.toLowerCase()))) {
                console.log(`Matched URL: ${elementData.url} with content: "${elementData.content}"`);
                return true;
            }
        }
    }

    console.log(`You are not on a recognized page. Please navigate to: ${elementsData[0].url}`);
    return false;
}

async function initiateCommentDeletion() {
    if (!ensureOnCorrectActivityPage()) {
        return;
    }

    await scrollToBottom();

    const bestSelector = determineBestSelector();
    const totalComments = document.querySelectorAll(bestSelector).length;

    if (!totalComments) {
        console.log("No comments found for deletion.");
        return;
    }

    listenForCancel();

    let userInput = prompt(`Found ${totalComments} comments. Type 'all' to delete all comments, or input a number to delete that many. Press the ESC key at any time to stop the script:`);

    while (userInput !== null) {
        if (userInput.toLowerCase() === 'all') {
            await deleteComments(Infinity);
            console.log("All comments deleted.");
            return;
        } else if (!isNaN(parseInt(userInput))) {
            const deleteBatchSize = parseInt(userInput);
            const remainingComments = await deleteComments(deleteBatchSize);

            if (!remainingComments) {
                console.log("All comments deleted.");
                return;
            }

            userInput = prompt(`${remainingComments} comments remaining. Enter 'all' to delete all remaining comments, or input a number to delete that many comments. Press ESC key at any time to stop the script:`);
        } else {
            userInput = prompt("Invalid input. Please enter 'all' or a number:");
        }
    }

    console.log("Operation canceled. No further comments will be deleted.");
}

initiateCommentDeletion();
