function createParticles(element, count = 8) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 30;
        const finalX = centerX + Math.cos(angle) * distance;
        const finalY = centerY + Math.sin(angle) * distance;
        
        particle.style.setProperty('--final-x', finalX + 'px');
        particle.style.setProperty('--final-y', finalY + 'px');
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
        
        requestAnimationFrame(() => {
            particle.style.left = finalX + 'px';
            particle.style.top = finalY + 'px';
        });
    }
}

function createTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'button-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
    }, 1000);
}

function handleButtonClick(button, callback) {

    button.classList.add('clicked');
    
    createParticles(button, 12);
    
    const originalText = button.textContent;
    button.classList.add('button-loading');
    
    setTimeout(() => {
        if (callback) callback();
        
        setTimeout(() => {
            button.classList.remove('button-loading', 'clicked');
        }, 1000);
    }, 300);
}

function handleReactionClick(button, type) {
    button.classList.remove('loved', 'disliked', 'hugged');
    
    switch(type) {
        case 'love':
            button.classList.add('loved');
            createParticles(button, 6);
            break;
        case 'dislike':
            button.classList.add('disliked');
    
            setTimeout(() => button.classList.remove('disliked'), 300);
            break;
        case 'hug':
            button.classList.add('hugged');
            createParticles(button, 10);
            break;
    }
    
  
    setTimeout(() => {
        button.classList.remove('loved', 'disliked', 'hugged');
    }, 2000);
}

let isTrailActive = false;
function activateButtonTrails() {
    if (isTrailActive) return;
    isTrailActive = true;
    
    document.addEventListener('mousemove', (e) => {
        const hoveredButton = e.target.closest('button');
        if (hoveredButton && Math.random() > 0.7) {
            createTrail(e.clientX, e.clientY);
        }
    });
}


function initializeButtonEffects() {
  
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleButtonClick(submitButton, () => {
                
                const form = submitButton.closest('form');
                if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                }
            });
        });
    }
    

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('react-btn')) {
            const button = e.target;
            const type = button.dataset.type;
            
            handleReactionClick(button, type);
            
            setTimeout(() => {
            }, 100);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('reply-submit') || e.target.classList.contains('subreply-submit')) {
            const button = e.target;
            handleButtonClick(button, () => {
            });
        }
    });
    
    activateButtonTrails();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtonEffects);
} else {
    initializeButtonEffects();
}

const toggle = document.getElementById('darkModeToggle');
toggle.addEventListener('change', () => {
    if (toggle.checked) {
        document.documentElement.style.setProperty('--bg-color', '#1f1b16');
        document.documentElement.style.setProperty('--text-color', '#e4dcd3');
        document.documentElement.style.setProperty('--accent-color', '#d4af89');
        document.documentElement.style.setProperty('--card-bg', '#2a1e17');
        document.body.style.background = 'linear-gradient(160deg, #0f0d0bff, #0e0b09ff)';       
    } else {
        document.documentElement.style.setProperty('--bg-color', '#f5efe6');
        document.documentElement.style.setProperty('--text-color', '#3e3a36');
        document.documentElement.style.setProperty('--accent-color', '#a67c52');
        document.documentElement.style.setProperty('--card-bg', '#ffffff');
        document.body.style.background = 'linear-gradient(160deg, #f5efe6, #e7dfd6)';
    }
});

let selectedCategory = '';
const categorySelect = document.getElementById('categorySelect');
categorySelect.addEventListener('change', () => {
    selectedCategory = categorySelect.value;
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, updateDoc, increment, query, orderBy, onSnapshot, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
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
let isAdmin = false;
signInAnonymously(auth).catch(console.error);
auth.onAuthStateChanged(user => {
    if (user && user.uid === "nl7EGGt1vvf7RolaPIAMdvxgbRn2") {
        isAdmin = true;
    }
});

const form = document.getElementById('postForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if(!selectedCategory) {
        alert('Pick a category first!');
        return;
    }
    const title = titleInput.value;
    const content = contentInput.value;

    try {
        await addDoc(collection(db, "posts"), {
            title,
            content,
            category: selectedCategory,
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
        renderPosts();
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

categorySelect.addEventListener('change', () => {
    currentFilter = categorySelect.value || 'all';
    renderPosts();
});

function renderPosts() {
    postContainer.innerHTML = '';
    const filtered = currentFilter === 'all' ? allPosts : allPosts.filter(post => post.category === currentFilter);

    filtered.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="post-meta">
           Category: ${post.category} | ${post.createdAt?.toDate().toLocaleString() ?? ''}
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
            const user = auth.currentUser;

            const postRef = doc(db, "posts", postId);
            const userReactionRef = doc(db, "posts", postId, "reactions", user.uid);

            try {
                const userReactionSnap = await getDoc(userReactionRef);
                const alreadyReacted = userReactionSnap.exists() && userReactionSnap.data()[type];
                if (!alreadyReacted) {
                await updateDoc(postRef, {
                    [`reactions.${type}`]: increment(1)
                });
                await setDoc(userReactionRef, {
                    [type]: true }, {merge: true});
                }else {alert("You already reacted");}
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
                    createdAt: serverTimestamp(),
                    userId: auth.currentUser.uid
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
                const replyId = docSnap.id;
                const isOwner = reply.userId === auth.currentUser.uid || isAdmin;

                const replyDiv = document.createElement('div');
                replyDiv.className = 'reply-item';
                replyDiv.innerHTML = `
                <p>${reply.content}</p>
                <small>${reply.createdAt?.toDate().toLocaleString() ?? ''}</small>
                ${isOwner ? `<button class="delete-reply" data-postid="${postId}" data-id="${replyId}"></button>` : ''}
                <div class="subreply-section">
                    <textarea placeholder="reply to this..." class="subreply-input"></textarea>
                    <button class="subreply-submit" data-postid="${postId}" data-replyid="${replyId}">↪ Reply</button>
                    <div class="subreply-list" id="subreply-list-${replyId}"></div>
                    </div>
                `;

                container.appendChild(replyDiv);
                loadSubReplies(postId, replyId);
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

            function loadSubReplies(postId, replyId) {
                const container = document.getElementById(`subreply-list-${replyId}`);
                if (!container) return;
                container.innerHTML = '';

                const subrepliesRef = collection(db, "posts", postId, "replies", replyId, "subreplies");
                getDocs(subrepliesRef).then(snapshot => {
                    snapshot.forEach(docSnap => {
                        const sub = docSnap.data();
                        const subDiv = document.createElement('div');
                        subDiv.className = `subreply-item`;
                        subDiv.innerHTML = `
                        <p>↪${sub.content}</p>
                        <small>${sub.createdAt?.toDate().toLocaleString() ?? ''}</small>
                        `;
                        container.appendChild(subDiv);
                    });
                });
            }

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('subreply-submit')) {
                const postId = e.target.dataset.postid;
                const replyId = e.target.dataset.replyid;
                const input = e.target.previousElementSibling;
                const content = input.value.trim();

            if (!content) return;

            try {
                const subreplyRef = collection(db, "posts", postId, "replies", replyId, "subreplies");
                await addDoc(subreplyRef, {
                    content, 
                    createdAt: serverTimestamp()
                });
                input.value = '';
                loadSubReplies(postId, replyId);
            } catch (err) {
               console.error("Subreply error:", err);            
            }
        }
});
}
