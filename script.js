// ==================== APP STATE ==================== 
const app = {
    currentUser: null,
    isPremium: false,
    currentSong: null,
    isPlaying: false,
    songs: [],
    favorites: [],
    downloads: [],
    SECRET_KEY: 'MAA',
    UPI_ID: '945488411@fam',
    PREMIUM_PRICE: 99,
    PREMIUM_DURATION: '3 months',
    spotifyToken: null,
    spotifyTokenExpiry: null
};

// ==================== INITIALIZATION ==================== 
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    attachEventListeners();
    loadFromLocalStorage();
    initializeSpotifyAPI();
});

function initializeApp() {
    // Load sample songs
    loadSampleSongs();
    // Initialize audio player
    initializeAudioPlayer();
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        app.currentUser = JSON.parse(savedUser);
        app.isPremium = localStorage.getItem(`premium_${app.currentUser.email}`) === 'true';
        showPage('homePage');
        displayUserGreeting();
    }
}

// ==================== SPOTIFY API INTEGRATION ====================
function initializeSpotifyAPI() {
    const clientId = '4d6a3b7c8e9f0a1b2c3d4e5f6a7b8c9d';
    const clientSecret = '5e7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u';
    
    getSpotifyToken(clientId, clientSecret);
}

function getSpotifyToken(clientId, clientSecret) {
    const auth = btoa(`${clientId}:${clientSecret}`);
    
    fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    })
    .then(response => response.json())
    .then(data => {
        app.spotifyToken = data.access_token;
        app.spotifyTokenExpiry = Date.now() + (data.expires_in * 1000);
        localStorage.setItem('spotifyToken', app.spotifyToken);
        console.log('✓ Spotify API connected');
    })
    .catch(error => {
        console.log('Spotify API connection info: Using local songs + search enhancement');
    });
}

function searchSpotifySongs(query) {
    if (!app.spotifyToken) {
        return Promise.resolve([]);
    }

    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50`;

    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${app.spotifyToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            // Token expired, refresh
            initializeSpotifyAPI();
            return [];
        }
        return response.json();
    })
    .then(data => {
        if (data.tracks && data.tracks.items) {
            return data.tracks.items.map(track => ({
                id: `spotify_${track.id}`,
                title: track.name,
                artist: track.artists.map(a => a.name).join(', '),
                album: track.album.name,
                image: track.album.images[0]?.url || 'https://via.placeholder.com/200/1DB954/FFFFFF?text=Song',
                audio: null,
                duration: Math.floor(track.duration_ms / 1000),
                spotifyId: track.id,
                isSpotify: true,
                previewUrl: track.preview_url
            }));
        }
        return [];
    })
    .catch(error => {
        console.log('Search enhancement available');
        return [];
    });
}

function loadSampleSongs() {
    const artists = [
        'The Weeknd', 'Ed Sheeran', 'Dua Lipa', 'Taylor Swift', 'Harry Styles',
        'Drake', 'Post Malone', 'Ariana Grande', 'Billie Eilish', 'The Chainsmokers',
        'Calvin Harris', 'David Guetta', 'Marshmello', 'Avicii', 'Skrillex',
        'Zedd', 'Diplo', 'Porter Robinson', 'Kygo', 'Justin Bieber',
        'Selena Gomez', 'Beyoncé', 'Rihanna', 'Lady Gaga', 'Britney Spears',
        'Madonna', 'Michael Jackson', 'Prince', 'David Bowie', 'Queen',
        'The Beatles', 'Rolling Stones', 'Led Zeppelin', 'Pink Floyd', 'AC/DC',
        'Metallica', 'Iron Maiden', 'Black Sabbath', 'Guns N\' Roses', 'Nirvana',
        'Radiohead', 'The Cure', 'Depeche Mode', 'New Order', 'Joy Division',
        'Daft Punk', 'The Chemical Brothers', 'The Prodigy', 'Fatboy Slim', 'Moby',
        'Massive Attack', 'Portishead', 'Björk', 'Thom Yorke', 'Grimes',
        'FKA twigs', 'Arca', 'SOPHIE', 'Jai Paul', 'James Blake',
        'Disclosure', 'Benji B', 'Bonobo', 'Four Tet', 'Jon Hopkins',
        'Rustie', 'Hudson Mohawke', 'Arca', 'CFCF', 'Burial',
        'Aphex Twin', 'Autechre', 'Warp Records', 'Tresor', 'Merzbow',
        'Ryoji Ikeda', 'Alva Noto', 'Fennesz', 'Wolfgang Voigt', 'Basic Channel',
        'Mark Ernestus', 'Moritz von Oswald', 'Lawrence', 'Frank Bryce', 'Vilod',
        'Tobias Freund', 'Sven Väth', 'Sasha', 'John Digweed', 'Richie Hawtin',
        'Christian Smith', 'Adam Beyer', 'Richie Hawtin', 'Carl Cox', 'Loco Dice',
        'Laurent Garnier', 'Jeff Mills', 'Robert Hood', 'Juan Atkins', 'Derrick May',
        'Kevin Saunderson', 'Underground Resistance', 'Transmat Records', 'Metroplex', 'Plus 8',
        'Warp', 'Rephlex', 'Mille Plateaux', 'Force Inc', 'Schnitzel',
        'Kompakt', 'Ostgut', 'Dial', 'Background', 'Perlon',
        'Ninja Tune', 'Hyperdub', 'CCAI', 'Hemlock', 'Night Slugs'
    ];

    const songTitles = [
        'Blinding Lights', 'Shape of You', 'Levitating', 'Anti-Hero', 'Heat Waves', 'As It Was',
        'Yesterday', 'Imagine', 'Bohemian Rhapsody', 'Stairway to Heaven', 'Comfortably Numb',
        'Hotel California', 'Smells Like Teen Spirit', 'Back in Black', 'Sweet Child o\' Mine',
        'Hey Jude', 'Like a Rolling Stone', 'All You Need Is Love', 'Purple Haze', 'Whole Lotta Love',
        'Black', 'Something', 'Helter Skelter', 'Revolution', 'Come Together',
        'While My Guitar Gently Weeps', 'Strawberry Fields Forever', 'Penny Lane', 'Eleanor Rigby', 'Norwegian Wood',
        'Michelle', 'Dear Prudence', 'Glass Onion', 'Happiness Is a Warm Gun', 'Sexy Sadie',
        'Cry Baby Cry', 'Revolution 1', 'Don\'t Pass Me By', 'Why Don\'t We Do It in the Road', 'I Will',
        'Julia', 'Yer Blues', 'Everybody\'s Got Something to Hide', 'Savoy Truffle', 'Piggies',
        'Long Long Long', 'Birthday', 'Yer Blues', 'Honey Pie', 'The Continuing Story of Bungalow Bill',
        'Wild Honey Pie', 'The Inner Light', 'Back in the USSR', 'Dear Prudence', 'Glass Onion',
        'Ob-La-Di Ob-La-Da', 'The Continuing Story', 'While My Guitar Gently Weeps', 'Happiness Is a Warm Gun',
        'I\'m So Tired', 'Blackbird', 'Piggies', 'Rocky Raccoon', 'Don\'t Pass Me By',
        'Why Don\'t We Do It in the Road', 'I Will', 'Julia', 'Yer Blues', 'Everybody\'s Got Something to Hide'
    ];

    const albums = [
        'After Hours', 'Divide', 'Future Nostalgia', 'Midnights', 'Dreamland', 'Harry\'s House',
        'Abbey Road', 'Let It Be', 'The White Album', 'Sgt. Pepper\'s', 'Rubber Soul',
        'Revolver', 'A Hard Day\'s Night', 'Beatles For Sale', 'Please Please Me', 'With the Beatles',
        'Magical Mystery Tour', 'Help!', 'Beatle', 'Past Masters', 'Anthology 1',
        'Dark Side of the Moon', 'The Wall', 'Animals', 'Meddle', 'Atom Heart Mother',
        'The Division Bell', 'Endless River', 'More', 'Soundtrack from the Film', 'Piper at the Gates of Dawn',
        'A Saucerful of Secrets', 'Ummagumma', 'Obscured by Clouds', 'Wish You Were Here',
        'Led Zeppelin IV', 'Led Zeppelin III', 'Led Zeppelin II', 'Led Zeppelin', 'Houses of the Holy',
        'Physical Graffiti', 'Presence', 'In Through the Out Door', 'Coda',
        'Never Mind', 'In Utero', 'Bleach', 'MTV Unplugged',
        'OK Computer', 'Kid A', 'Amnestic', 'Hail to the Thief', 'The King of Limbs',
        'A Moon Shaped Pool', 'Pablo Honey', 'The Bends', 'In Rainbows',
        'I\'m With You', 'Stadium Arcadium', 'By the Way', 'Blood Sugar Sex Magik', 'Californication'
    ];

    app.songs = [];
    const sampleAudio = [
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    ];

    let songId = 1;
    const totalSongs = 10000;
    const colors = ['1DB954', 'FF6B6B', '4ECDC4', 'FFE66D', 'A8E6CF', 'FF8B94', 'C7CEEA', 'FFD89B'];

    for (let i = 0; i < totalSongs; i++) {
        const artist = artists[i % artists.length];
        const title = songTitles[i % songTitles.length];
        const album = albums[i % albums.length];
        const color = colors[i % colors.length];
        const audioUrl = sampleAudio[i % sampleAudio.length];
        const duration = Math.floor(Math.random() * 180) + 120; // 2-5 minutes

        app.songs.push({
            id: songId++,
            title: `${title} ${i > 0 ? '(' + (Math.floor(i / 100) + 1) + ')' : ''}`,
            artist: artist,
            album: `${album} ${i > 0 ? 'Vol.' + (Math.floor(i / 500) + 1) : ''}`,
            image: `https://via.placeholder.com/200/${color}/FFFFFF?text=Song+${i + 1}`,
            audio: audioUrl,
            duration: duration
        });
    }
}

// ==================== EVENT LISTENERS ==================== 
function attachEventListeners() {
    // Auth Events
    document.getElementById('signinForm').addEventListener('submit', handleSignIn);
    document.getElementById('signupForm').addEventListener('submit', handleSignUp);
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    document.querySelectorAll('.switch-tab').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab.call(this, { target: { dataset: { tab: e.target.dataset.tab } } });
        });
    });

    // Sidebar Navigation
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', handleMenuClick);
    });

    // Player Controls
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('prevBtn').addEventListener('click', playPrevious);
    document.getElementById('nextBtn').addEventListener('click', playNext);
    document.getElementById('progressSlider').addEventListener('input', seekAudio);
    document.getElementById('volumeSlider').addEventListener('input', changeVolume);

    // Navigation
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtn2').addEventListener('click', logout);
    document.getElementById('logoutBtn3').addEventListener('click', logout);
    document.getElementById('premiumBtn').addEventListener('click', () => showPage('premiumPage'));
    document.getElementById('buyPremiumBtn').addEventListener('click', () => showPage('paymentPage'));
    document.getElementById('backToPremium').addEventListener('click', () => showPage('homePage'));
    document.getElementById('backToHome').addEventListener('click', () => showPage('homePage'));
    document.getElementById('backToAdmin').addEventListener('click', () => showPage('homePage'));
    document.getElementById('adminBtn').addEventListener('click', openAdminPanel);

    // Admin Panel
    document.getElementById('uploadForm').addEventListener('submit', handleSongUpload);

    // Payment
    document.getElementById('copyUPI').addEventListener('click', copyUPI);
    document.getElementById('confirmPaymentBtn').addEventListener('click', confirmPayment);

    // Secret Key Modal
    document.getElementById('submitSecretKey').addEventListener('click', verifySecretKey);
    document.getElementById('secretKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifySecretKey();
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// ==================== AUTHENTICATION ==================== 
function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value;
    const password = document.getElementById('signinPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        app.currentUser = user;
        app.isPremium = localStorage.getItem(`premium_${email}`) === 'true';
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Sign in successful!');
        setTimeout(() => {
            showPage('homePage');
            displayUserGreeting();
        }, 500);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;

    if (password !== confirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        showNotification('Email already exists', 'error');
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('Account created! Please sign in.');
    document.getElementById('signupForm').reset();
    switchTab({ target: { dataset: { tab: 'signin' } } });
}

function switchTab(e) {
    const tabName = e.target.dataset?.tab;
    if (!tabName) return;

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"].tab-btn`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        app.currentUser = null;
        app.isPremium = false;
        localStorage.removeItem('currentUser');
        document.getElementById('signinForm').reset();
        document.getElementById('signupForm').reset();
        showPage('loginPage');
        showNotification('Logged out successfully');
    }
}

function displayUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    if (app.currentUser) {
        const status = app.isPremium ? '⭐ Premium' : '📋 Free';
        greeting.textContent = `${app.currentUser.username} • ${status}`;
    }
}

// ==================== ADMIN PANEL ==================== 
function openAdminPanel() {
    const modal = document.getElementById('secretKeyModal');
    modal.classList.add('active');
    document.getElementById('secretKeyInput').focus();
}

function verifySecretKey() {
    const input = document.getElementById('secretKeyInput').value.toUpperCase();
    const errorMsg = document.getElementById('secretKeyError');

    if (input === app.SECRET_KEY) {
        document.getElementById('secretKeyModal').classList.remove('active');
        document.getElementById('secretKeyInput').value = '';
        errorMsg.textContent = '';
        showPage('adminPage');
        displayUploadedSongs();
    } else {
        errorMsg.textContent = 'Invalid secret key!';
        document.getElementById('secretKeyInput').value = '';
    }
}

function handleSongUpload(e) {
    e.preventDefault();
    const title = document.getElementById('songTitle').value;
    const artist = document.getElementById('songArtist').value;
    const album = document.getElementById('songAlbum').value;
    const imageUrl = document.getElementById('songImage').value;
    const fileInput = document.getElementById('songFile');

    if (!fileInput.files.length) {
        showNotification('Please select an audio file', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        const newSong = {
            id: Date.now(),
            title,
            artist,
            album,
            image: imageUrl || 'https://via.placeholder.com/200/1DB954/FFFFFF?text=Song',
            audio: event.target.result,
            duration: 0,
            uploadedAt: new Date().toISOString()
        };

        app.songs.push(newSong);
        localStorage.setItem('uploadedSongs', JSON.stringify(app.songs.filter(s => s.uploadedAt)));

        showNotification('Song uploaded successfully!');
        document.getElementById('uploadForm').reset();
        displayUploadedSongs();
        displaySongs();
    };

    reader.readAsDataURL(file);
}

function displayUploadedSongs() {
    const container = document.getElementById('uploadedSongs');
    const uploadedSongs = app.songs.filter(s => s.uploadedAt);

    if (uploadedSongs.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">No songs uploaded yet</p>';
        return;
    }

    container.innerHTML = uploadedSongs.map(song => `
        <div class="uploaded-song-card">
            <img src="${song.image}" alt="${song.title}" class="uploaded-song-image">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
            <button class="delete-btn" onclick="deleteSong(${song.id})">Delete</button>
        </div>
    `).join('');
}

function deleteSong(id) {
    if (confirm('Are you sure you want to delete this song?')) {
        app.songs = app.songs.filter(s => s.id !== id);
        localStorage.setItem('uploadedSongs', JSON.stringify(app.songs.filter(s => s.uploadedAt)));
        displayUploadedSongs();
        displaySongs();
        showNotification('Song deleted successfully!');
    }
}

// ==================== NAVIGATION ==================== 
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    if (pageId === 'homePage') {
        displaySongs();
        displayUserGreeting();
        updateAdminButtonVisibility();
    }
}

function handleMenuClick(e) {
    e.preventDefault();
    const page = e.target.closest('.menu-link').dataset.page;

    document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active'));
    e.target.closest('.menu-link').classList.add('active');

    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

    const sectionId = {
        'home': 'homeSection',
        'library': 'librarySection',
        'favorites': 'favoritesSection',
        'downloads': 'downloadsSection',
        'trending': 'trendingSection'
    }[page];

    if (sectionId) {
        document.getElementById(sectionId).classList.add('active');
        
        if (page === 'library') displayLibrary();
        else if (page === 'favorites') displayFavorites();
        else if (page === 'downloads') displayDownloads();
        else if (page === 'trending') displayTrending();
        else displaySongs();
    }
}

function displayTrending() {
    const container = document.getElementById('trendingList');
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">🔄 Loading trending songs...</p>';
    
    loadTrendingSongs().then(trendingSongs => {
        if (trendingSongs.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">No trending songs available</p>';
            return;
        }

        container.innerHTML = trendingSongs.map(song => `
            <div class="song-card">
                <img src="${song.image}" alt="${song.title}" class="song-image" onerror="this.src='https://via.placeholder.com/200/1DB954/FFFFFF?text=Song'">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-actions">
                    <button onclick="playSongFromSearch('${song.id}', true)" title="Play">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="secondary" onclick="toggleFavorite('${song.id}')" title="Add to Favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="secondary" onclick="downloadSong('${song.id}')" title="Download" ${app.isPremium ? '' : 'disabled'}>
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    });
}

function updateAdminButtonVisibility() {
    const adminBtn = document.getElementById('adminBtn');
    adminBtn.style.display = app.currentUser ? 'flex' : 'none';
}

// ==================== SONGS DISPLAY ==================== 
function displaySongs() {
    const container = document.getElementById('songsList');
    
    // Load trending/featured if Spotify is available
    if (app.spotifyToken) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">🎵 Loading latest songs from Spotify...</p>';
        
        loadTrendingSongs().then(trendingSongs => {
            if (trendingSongs.length > 0) {
                container.innerHTML = trendingSongs.map(song => `
                    <div class="song-card">
                        <img src="${song.image}" alt="${song.title}" class="song-image" onerror="this.src='https://via.placeholder.com/200/1DB954/FFFFFF?text=Song'">
                        <div class="song-info">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                            <div style="font-size: 11px; color: #1DB954; margin-top: 4px;">🎵 Trending on Spotify</div>
                        </div>
                        <div class="song-actions">
                            <button onclick="playSongFromSearch('${song.id}', true)" title="Play">
                                <i class="fas fa-play"></i> Play
                            </button>
                            <button class="secondary" onclick="toggleFavorite(${song.id})" title="Add to Favorites">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="secondary" onclick="downloadSong(${song.id})" title="Download" ${app.isPremium ? '' : 'disabled'}>
                                <i class="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                displayLocalSongs();
            }
        });
    } else {
        displayLocalSongs();
    }
}

function displayLocalSongs() {
    const container = document.getElementById('songsList');
    container.innerHTML = app.songs.map(song => `
        <div class="song-card">
            <img src="${song.image}" alt="${song.title}" class="song-image">
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button onclick="playSong(${song.id})" title="Play">
                    <i class="fas fa-play"></i> Play
                </button>
                <button class="secondary" onclick="toggleFavorite(${song.id})" title="Add to Favorites">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="secondary" onclick="downloadSong(${song.id})" title="Download" ${app.isPremium ? '' : 'disabled'}>
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function loadTrendingSongs() {
    if (!app.spotifyToken) {
        return Promise.resolve([]);
    }

    const url = 'https://api.spotify.com/v1/browse/new-releases?limit=50&country=US';

    return fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${app.spotifyToken}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            initializeSpotifyAPI();
            return [];
        }
        return response.json();
    })
    .then(data => {
        if (data.albums && data.albums.items) {
            return data.albums.items.slice(0, 50).map(album => ({
                id: `spotify_${album.id}`,
                title: album.name,
                artist: album.artists.map(a => a.name).join(', '),
                album: album.name,
                image: album.images[0]?.url || 'https://via.placeholder.com/200/1DB954/FFFFFF?text=Song',
                audio: null,
                duration: 240,
                spotifyId: album.id,
                isSpotify: true
            }));
        }
        return [];
    })
    .catch(error => {
        console.log('Trending songs load info: Using local catalog');
        return [];
    });
}

function displayLibrary() {
    const container = document.getElementById('libraryList');
    if (app.songs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #B3B3B3;">No songs in library</p>';
        return;
    }

    container.innerHTML = app.songs.map(song => `
        <div class="song-item" onclick="playSong(${song.id})">
            <img src="${song.image}" alt="${song.title}" class="song-item-image">
            <div class="song-item-info">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
            <div class="song-item-actions">
                <button class="icon-btn" onclick="toggleFavorite(${song.id}); event.stopPropagation();">
                    <i class="fas fa-heart ${app.favorites.includes(song.id) ? 'liked' : ''}"></i>
                </button>
                <button class="icon-btn" onclick="downloadSong(${song.id}); event.stopPropagation();" ${app.isPremium ? '' : 'disabled'}>
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function displayFavorites() {
    const container = document.getElementById('favoritesList');
    const favoriteSongs = app.songs.filter(s => app.favorites.includes(s.id));

    if (favoriteSongs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #B3B3B3;">No favorite songs yet</p>';
        return;
    }

    container.innerHTML = favoriteSongs.map(song => `
        <div class="song-item" onclick="playSong(${song.id})">
            <img src="${song.image}" alt="${song.title}" class="song-item-image">
            <div class="song-item-info">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
            <div class="song-item-actions">
                <button class="icon-btn liked" onclick="toggleFavorite(${song.id}); event.stopPropagation();">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="icon-btn" onclick="downloadSong(${song.id}); event.stopPropagation();" ${app.isPremium ? '' : 'disabled'}>
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function displayDownloads() {
    const container = document.getElementById('downloadsList');
    const downloadedSongs = app.songs.filter(s => app.downloads.includes(s.id));

    if (downloadedSongs.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #B3B3B3;">No downloaded songs yet</p>';
        return;
    }

    container.innerHTML = downloadedSongs.map(song => `
        <div class="song-item" onclick="playSong(${song.id})">
            <img src="${song.image}" alt="${song.title}" class="song-item-image">
            <div class="song-item-info">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
            <div class="song-item-actions">
                <button class="icon-btn" onclick="toggleFavorite(${song.id}); event.stopPropagation();">
                    <i class="fas fa-heart ${app.favorites.includes(song.id) ? 'liked' : ''}"></i>
                </button>
                <button class="icon-btn" onclick="removeSongFromDownloads(${song.id}); event.stopPropagation();">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function toggleFavorite(id) {
    const index = app.favorites.indexOf(id);
    if (index > -1) {
        app.favorites.splice(index, 1);
        showNotification('Removed from favorites');
    } else {
        app.favorites.push(id);
        showNotification('Added to favorites');
    }
    saveToLocalStorage();
    displayFavorites();
    displayLibrary();
    displayDownloads();
}

function downloadSong(id) {
    if (!app.isPremium) {
        showNotification('Premium required to download', 'error');
        return;
    }

    if (!app.downloads.includes(id)) {
        app.downloads.push(id);
        showNotification('Song downloaded successfully!');
        saveToLocalStorage();
    } else {
        showNotification('Song already downloaded');
    }
}

function removeSongFromDownloads(id) {
    app.downloads = app.downloads.filter(songId => songId !== id);
    saveToLocalStorage();
    displayDownloads();
    showNotification('Song removed from downloads');
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const container = document.getElementById('songsList');

    if (!query) {
        displaySongs();
        return;
    }

    // Show loading state
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">🔍 Searching songs...</p>';

    // Search local songs first
    let localResults = app.songs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );

    // Also search Spotify for latest songs
    searchSpotifySongs(query).then(spotifyResults => {
        // Combine results - Spotify first, then local
        let combinedResults = [...spotifyResults];
        
        // Add local results that aren't duplicates
        localResults.forEach(localSong => {
            const isDuplicate = spotifyResults.some(spotifySong =>
                spotifySong.title.toLowerCase() === localSong.title.toLowerCase() &&
                spotifySong.artist.toLowerCase() === localSong.artist.toLowerCase()
            );
            if (!isDuplicate) {
                combinedResults.push(localSong);
            }
        });

        if (combinedResults.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #B3B3B3;">No songs found</p>';
            return;
        }

        container.innerHTML = combinedResults.map(song => `
            <div class="song-card">
                <img src="${song.image}" alt="${song.title}" class="song-image" onerror="this.src='https://via.placeholder.com/200/1DB954/FFFFFF?text=Song'">
                <div class="song-info">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                    ${song.isSpotify ? '<div style="font-size: 11px; color: #1DB954; margin-top: 4px;">🎵 Latest from Spotify</div>' : ''}
                </div>
                <div class="song-actions">
                    <button onclick="playSongFromSearch('${song.id}', ${song.isSpotify ? 'true' : 'false'})" title="Play">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="secondary" onclick="toggleFavorite(${song.id})" title="Add to Favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="secondary" onclick="downloadSong(${song.id})" title="Download" ${app.isPremium ? '' : 'disabled'}>
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    });
}

function playSongFromSearch(songId, isSpotify) {
    if (isSpotify) {
        const spotifyId = songId.replace('spotify_', '');
        searchSpotifySongs('').then(() => {
            // Find in local array or create entry
            const song = app.songs.find(s => s.id === songId);
            if (song) {
                playSong(song.id);
            }
        });
    } else {
        playSong(parseInt(songId));
    }
}

// ==================== MUSIC PLAYER ==================== 
function initializeAudioPlayer() {
    const audio = document.getElementById('audioPlayer');
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', playNext);
    audio.addEventListener('loadedmetadata', updateDuration);
}

function playSong(id) {
    const song = app.songs.find(s => s.id === id);
    if (!song) return;

    app.currentSong = song;
    const audio = document.getElementById('audioPlayer');

    document.getElementById('playerImage').src = song.image;
    document.getElementById('playerTitle').textContent = song.title;
    document.getElementById('playerArtist').textContent = song.artist;

    audio.src = song.audio;
    audio.play();
    app.isPlaying = true;
    document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
}

function togglePlay() {
    const audio = document.getElementById('audioPlayer');

    if (!app.currentSong) {
        if (app.songs.length > 0) {
            playSong(app.songs[0].id);
        }
        return;
    }

    if (app.isPlaying) {
        audio.pause();
        app.isPlaying = false;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play();
        app.isPlaying = true;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function playPrevious() {
    const currentIndex = app.songs.findIndex(s => s.id === app.currentSong?.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : app.songs.length - 1;
    playSong(app.songs[previousIndex].id);
}

function playNext() {
    const currentIndex = app.songs.findIndex(s => s.id === app.currentSong?.id);
    const nextIndex = currentIndex < app.songs.length - 1 ? currentIndex + 1 : 0;
    playSong(app.songs[nextIndex].id);
}

function seekAudio(e) {
    const audio = document.getElementById('audioPlayer');
    const percentage = e.target.value;
    audio.currentTime = (percentage / 100) * audio.duration;
}

function updateProgress() {
    const audio = document.getElementById('audioPlayer');
    const percentage = (audio.currentTime / audio.duration) * 100;
    document.getElementById('progress').style.width = percentage + '%';
    document.getElementById('progressSlider').value = percentage;
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
}

function updateDuration() {
    const audio = document.getElementById('audioPlayer');
    document.getElementById('duration').textContent = formatTime(audio.duration);
}

function changeVolume(e) {
    const audio = document.getElementById('audioPlayer');
    audio.volume = e.target.value / 100;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==================== PAYMENT ==================== 
function copyUPI() {
    navigator.clipboard.writeText(app.UPI_ID);
    showNotification('UPI ID copied to clipboard!');
}

function confirmPayment() {
    const transactionId = document.getElementById('transactionId').value;

    if (!transactionId) {
        showNotification('Please enter transaction ID', 'error');
        return;
    }

    if (confirm('Confirm payment with transaction ID: ' + transactionId + '?\n\nThis payment grants 3 months of Premium access.')) {
        app.isPremium = true;
        const premiumExpiry = new Date();
        premiumExpiry.setMonth(premiumExpiry.getMonth() + 3);

        localStorage.setItem(`premium_${app.currentUser.email}`, 'true');
        localStorage.setItem(`premium_expiry_${app.currentUser.email}`, premiumExpiry.toISOString());

        showNotification('✨ Welcome to Premium! 3 months access granted!');
        document.getElementById('transactionId').value = '';
        setTimeout(() => {
            showPage('homePage');
            displayUserGreeting();
        }, 1500);
    }
}

// ==================== NOTIFICATIONS ==================== 
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== LOCAL STORAGE ==================== 
function saveToLocalStorage() {
    localStorage.setItem('favorites', JSON.stringify(app.favorites));
    localStorage.setItem('downloads', JSON.stringify(app.downloads));
}

function loadFromLocalStorage() {
    app.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    app.downloads = JSON.parse(localStorage.getItem('downloads')) || [];

    const uploadedSongs = JSON.parse(localStorage.getItem('uploadedSongs')) || [];
    app.songs = [...app.songs, ...uploadedSongs];
}