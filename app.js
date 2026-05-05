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

// 9. NASA API Integration
// Add 'isRandom' parameter to the function
async function fetchNasaAPOD(isRandom = false) {
    const nasaContainer = document.getElementById('nasaSection');
    
    // If isRandom is true, we add &count=1 to the URL
    const baseUrl = 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY';
    const url = isRandom ? `${baseUrl}&count=1` : baseUrl;

    try {
        const response = await fetch(url);
        let data = await response.json();

        // When using 'count=1', NASA returns an Array [ ], so we take the first item
        if (isRandom) data = data[0];

        if (data.media_type === 'image') {
            nasaContainer.classList.remove('hidden');
            nasaContainer.innerHTML = `
                <div class="relative h-64 overflow-hidden bg-slate-200" id="nasaImageWrapper">
                    <img src="${data.url}" class="w-full h-full object-cover">
                    
                    <!-- Randomize Button -->
                    <button onclick="fetchNasaAPOD(true)" class="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition" title="Randomize">
                        🔄
                    </button>

                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                        <div>
                            <span class="text-indigo-300 font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">NASA Discovery</span>
                            <h3 class="text-white font-extrabold text-xl leading-tight">${data.title}</h3>
                        </div>
                    </div>
                </div>
                <div class="p-6 bg-white/30">
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3">${data.explanation}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("NASA API Error:", error);
    }
}

// Call the function at the very bottom of your script
fetchNasaAPOD();