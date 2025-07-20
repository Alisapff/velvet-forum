const toggle = document.getElementById('darkModeToggle');
toggle.addEventListener('change', () => {
    if (toggle.checked) {
        document.documentElement.style.setProperty('--bg-color', '#1f1b16');
        document.documentElement.style.setProperty('--text-color', '#3e3a36');
        document.documentElement.style.setProperty('--accent-color', '#d4af89');
        document.body.style.background = 'linear-gradient(160deg, #0f0d0bff, #0e0b09ff)';
    } else {
        document.documentElement.style.setProperty('--bg-color', '#f5efe6');
        document.documentElement.style.setProperty('--text-color', '#3e3a36');
        document.documentElement.style.setProperty('--accent-color', '#a67c52');
        document.body.style.background = 'linear-gradient(160deg, #f5efe6, #e7dfd6)';
    }
});

let selectedMood = '';
document.querySelectorAll('.mood').forEach(btn => {
    btn.addEventListener('click', () => {
        selectedMood = btn.dataset.mood;
        alert(`Mood set to: ${selectedMood}`);
    });
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, updateDoc, increment, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpJ54BmHX8TXV8UiFNv51RDUyIHGTLvBA",
  authDomain: "velvet-forum.firebaseapp.com",
  projectId: "velvet-forum",
  storageBucket: "velvet-forum.firebasestorage.app",
  messagingSenderId: "237707090533",
  appId: "1:237707090533:web:1e97b80cd3501fc1f6c48c",
  measurementId: "G-MC11X67R53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);

const form = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');


form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if(!selectedMood) {
        alert('Pick a mood first!');
        return;
    }

    const title = titleInput.value;
    const content = contentInput.value;

    try {
        await addDoc(collection(db, "posts"), {
            title,
            content,
            mood: selectedMood,
            createdAt: serverTimestamp(),
            reactions: {
                love: 0,
                dislike: 0,
                hug: 0
            }
        });
        alert('Posted!');
        titleInput.value = '';
        contentInput.value = '';
    } catch (err) {
        console.error("Error posting:", err);
        alert('Something went wrong.');
    }
});

const postContainer = document.getElementById('postContainer');
let currentFilter = 'all';
let allPosts = [];

const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    allPosts = [];
    snapshot.forEach(doc => {
        allPosts.push({ id: doc.id, ...doc.data() });
    });
    renderPosts();
});

document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        renderPosts();
    });
});

function renderPosts() {
    postContainer.innerHTML = '';
    const filtered = currentFilter === 'all'
    ? allPosts
    : allPosts.filter(post => post.mood === currentFilter);

    filtered.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="post-meta">
        Mood: ${post.mood} | ${post.createdAt?.toDate().toLocaleString() ?? ''}
         </div>
         <div class="reactions">
           <button class="react-btn" data-id="${post.id}" data-type="love">❣️${post.reactions?.love ?? 0}</button>
           <button class="react-btn" data-id="${post.id}" data-type="dislike">👎🏻${post.reactions?.dislike ?? 0}</button>
           <button class="react-btn" data-id="${post.id}" data-type="hug">👻${post.reactions?.hug ?? 0}</button>
           </div>

           <div class="reply-section" data-postid="${post.id}">
           <textarea placeholder="reply here..." class="reply-input"></textarea>
           <button class="reply-submit">Reply</button>
           <div class="reply-list"></div>
           </div>
         `;
         
        postContainer.appendChild(card);
      
        const replyList = card.querySelector('.reply-list');
        loadReplies(post.id, replyList);
    });

      document.querySelectorAll('.react-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const postId = btn.dataset.id;
            const type = btn.dataset.type;
            const postRef = doc(db, "posts", postId);
            try {
                await updateDoc(postRef, {
                    [`reactions.${type}`]: increment(1)
                });
            } catch (err) {
                console.error("Reaction error:", err);
            }
        });
    });

    document.querySelectorAll('.reply-submit').forEach(btn => {
        btn.addEventListener('click', async () => {
            const section = btn.closest('.reply-section');
            const postId = section.dataset.postid;
            const input = section.querySelector('.reply-input');
            const content = input.value.trim();
            if (!content) return;

            try {
                const replyRef = collection(db, "posts", postId, "replies");
                await addDoc(replyRef, {
                    content,
                    createdAt: serverTimestamp()
                });
                input.value = '';
                loadReplies(postId, section.querySelector('.reply-list'));
            } catch (err) {
                console.error("Reply error:", err);
            }
        });
    });

    function loadReplies(postId, container) {
        container.innerHTML = '';
        const repliesRef = collection(db, "posts", postId, "replies");
        getDocs(repliesRef).then(snapshot => {
            snapshot.forEach(docSnap => {
                const reply = docSnap.data();
                const replyDiv = document.createElement('div');
                replyDiv.className = 'reply-item';
                replyDiv.innerHTML = `
                <p>${reply.content}</p>
                <small>${reply.createdAt?.toDate().toLocaleString() ?? ''}</small>
                <button class="delete-reply" data-postid="${postId}" data-id="${docSnap.id}">🗑</button>
                `;
                container.appendChild(replyDiv);
            });

            container.querySelectorAll('.delete-reply').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const postId = btn.dataset.postid;
                    const replyId = btn.dataset.id;
                    await deleteDoc(doc(db, "posts", postId, "replies", replyId));
                    loadReplies(postId, container);
                });
            });
        });
    }
}