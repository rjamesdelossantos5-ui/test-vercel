// 1. Supabase Configuration
const SUPABASE_URL = 'https://umcjjaxrmtdebgnaakqu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_iOF-AnW9_tLenj6Jn2k9fw_NDy9bct5'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. DOM Elements
const feedContainer = document.getElementById('feedContainer');
const postBtn = document.getElementById('postBtn');
const usernameInput = document.getElementById('username');
const contentInput = document.getElementById('postContent');

// 3. Fetch Posts and Apply Tailwind Styling@
async function fetchPosts() {
    const { data, error } = await _supabase
        .from('posts') 
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching:', error);
        feedContainer.innerHTML = `<div class="text-red-500 text-center py-4">Error loading posts.</div>`;
        return;
    }

    if (data.length === 0) {
        feedContainer.innerHTML = `<div class="text-gray-500 text-center py-4">No posts yet. Be the first!</div>`;
        return;
    }

    // Map through data and wrap in Facebook-style Tailwind HTML
    feedContainer.innerHTML = data.map(post => {
        // Format the date nicely
        const dateObj = new Date(post.created_at);
        const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = dateObj.toLocaleDateString();

        return `
            <div class="bg-white p-4 rounded-xl shadow-sm">
                <!-- Post Header -->
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            ${post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800">${post.author}</h4>
                            <p class="text-xs text-gray-500">${dateString} at ${timeString}</p>
                        </div>
                    </div>
                    <!-- Three dots menu icon -->
                    <button class="text-gray-400 hover:text-gray-600 font-bold">•••</button>
                </div>
                
                <!-- Post Content -->
                <p class="text-gray-800 mb-4">${post.content}</p>
                
                <hr class="mb-2">
                
                <!-- Post Actions (Fake interactive buttons) -->
                <div class="flex justify-between text-gray-500 font-medium text-sm">
                    <button class="flex-1 py-2 hover:bg-gray-100 rounded-md transition flex items-center justify-center space-x-2">
                        <span>👍</span> <span>Like</span>
                    </button>
                    <button class="flex-1 py-2 hover:bg-gray-100 rounded-md transition flex items-center justify-center space-x-2">
                        <span>💬</span> <span>Comment</span>
                    </button>
                    <button class="flex-1 py-2 hover:bg-gray-100 rounded-md transition flex items-center justify-center space-x-2">
                        <span>↗️</span> <span>Share</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Create Post Function
async function createPost() {
    const author = usernameInput.value.trim();
    const content = contentInput.value.trim();

    if (!author || !content) {
        alert("Please enter a display name and a message!");
        return;
    }

    // Change button text to show it is working
    const originalBtnText = postBtn.innerText;
    postBtn.innerText = "Posting...";
    postBtn.disabled = true;

    const { error } = await _supabase
        .from('posts')
        .insert([{ author, content }]);

    if (error) {
        alert("Database Error: " + error.message);
    } else {
        contentInput.value = ''; // Clear only the message box, keep the username
        await fetchPosts(); // Wait for the new list to load
    }

    // Reset button
    postBtn.innerText = originalBtnText;
    postBtn.disabled = false;
}

// 5. Event Listeners
postBtn.addEventListener('click', createPost);

// Allow posting by pressing "Enter" on the content box
contentInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        createPost();
    }
});

// 6. Initial Load
fetchPosts();