import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously,
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    onSnapshot, 
    Timestamp
} from 'firebase/firestore';
import { setLogLevel } from 'firebase/firestore';

// --- Static User Data ---
const staticUsers = [
    { id: 'ethan', name: 'Ethan', imageUrl: 'https://i.ibb.co/yngCypnH/IMG-3658-Copy.jpg' },
    { id: 'anna', name: 'Anna', imageUrl: 'https://i.ibb.co/wFhbFDst/IMG-3645.jpg' },
    { id: 'melanie', name: 'Melanie', imageUrl: 'https://i.ibb.co/KxYq6gcB/IMG-7768.jpg' },
    { id: 'bill', name: 'Bill', imageUrl: 'https://i.ibb.co/zTsL4fd7/IMG-3599.jpg' },
    { id: 'ed', name: 'Ed', imageUrl: 'https://i.ibb.co/35ZHscLX/IMG-7702.jpg' },
    { id: 'nolan', name: 'Nolan', imageUrl: 'https://i.ibb.co/1tR7V5kK/IMG-7699.jpg' },
    { id: 'rhonda', name: 'Rhonda', imageUrl: 'https://i.ibb.co/LzGSJ2GQ/IMG-3593.jpg' },
    { id: 'madeline', name: 'Madeline', imageUrl: 'https://i.ibb.co/xKnZM350/IMG-3461.jpg' },
];


// --- Meal Data (with Image URLs) ---
const mealOptions = [
    { value: 'fish', label: 'Fish', imageUrl: 'https://em-content.zobj.net/source/apple/419/fish_1f41f.png' },
    { value: 'lamb', label: 'Lamb', imageUrl: 'https://em-content.zobj.net/source/apple/419/ewe_1f411.png' },
    { value: 'hamburger', label: 'Hamburger', imageUrl: 'https://em-content.zobj.net/source/apple/419/hamburger_1f354.png' },
    { value: 'other', label: 'Other', imageUrl: 'https://em-content.zobj.net/source/apple/419/face-with-spiral-eyes_1f635-200d-1f4ab.png' }
];

const mealImageMap = mealOptions.reduce((acc, option) => { acc[option.value] = option.imageUrl; return acc; }, {});
const mealLabelMap = mealOptions.reduce((acc, option) => { acc[option.value] = option.label; return acc; }, {});

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-iceland-blog';

// --- Components ---

const UserSelectionPage = ({ onUserSelect }) => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-serif">Join the Expedition</h1>
        <p className="text-lg text-gray-300 mb-12">Select your traveler profile to begin.</p>
        <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
            {staticUsers.map(user => (
                <div 
                    key={user.id} 
                    className="flex flex-col items-center cursor-pointer group"
                    onClick={() => onUserSelect(user)}
                >
                    <img 
                        src={user.imageUrl} 
                        alt={user.name} 
                        className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl object-cover border-4 border-transparent group-hover:border-sky-400 transition-all duration-300 shadow-lg"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/224x224/334155/e2e8f0?text=Profile'; }}
                    />
                    <h2 className="text-white text-2xl font-semibold mt-5 group-hover:text-sky-300 transition-colors">{user.name}</h2>
                </div>
            ))}
        </div>
    </div>
);


const Header = ({ user, handleSignOut }) => (
    <header className="bg-black bg-opacity-50 backdrop-blur-sm text-white p-4 sm:p-6 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-wider font-serif">Thrusty's Trusty Travelers</h1>
                <p className="text-sm text-gray-300">Your guide to rustic Icelandic adventures</p>
            </div>
            {user && (
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                         <p className="text-xs text-gray-400">Welcome,</p>
                        <div className="flex items-center space-x-2">
                             <span className="text-lg font-semibold">{user.name}</span>
                             <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border-2 border-sky-400"/>
                        </div>
                    </div>
                    <button 
                        onClick={handleSignOut}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 shadow-md">
                        Switch User
                    </button>
                </div>
            )}
        </div>
    </header>
);

const Post = ({ post }) => {
    const { accommodationName, description, meal, author, createdAt } = post;
    const imageUrl = mealImageMap[meal];
    const mealText = mealLabelMap[meal];

    return (
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg border border-white border-opacity-20 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-white font-serif">{accommodationName}</h3>
                    <div className="flex flex-col items-center justify-center bg-black bg-opacity-20 rounded-lg p-2 group w-20 text-center">
                        {imageUrl && 
                            <img src={imageUrl} alt={mealText} className="w-12 h-12 object-contain mb-2" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/334155/e2e8f0?text=Meal'; }} />
                        }
                        <span className="text-xs text-gray-300 uppercase tracking-wider">{mealText}</span>
                    </div>
                </div>
                <p className="text-gray-200 mb-6 leading-relaxed">{description}</p>
                <div className="border-t border-gray-600 pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src={author?.imageUrl} alt={author?.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/40x40/334155/e2e8f0?text=:)'; }}/>
                        <span className="font-semibold text-gray-300">{author?.name}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {createdAt?.toDate().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PostFeed = ({ posts }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 md:p-8">
        {posts.length > 0 ? (
            posts.map(post => <Post key={post.id} post={post} />)
        ) : (
            <div className="col-span-full text-center text-gray-300 bg-black bg-opacity-30 p-8 rounded-lg">
                <p className="text-xl">No posts yet. Be the first to share your Icelandic adventure!</p>
            </div>
        )}
    </div>
);


const CreatePost = ({ user }) => {
    const [accommodationName, setAccommodationName] = useState('');
    const [description, setDescription] = useState('');
    const [meal, setMeal] = useState('fish');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accommodationName.trim() || !description.trim()) {
            setError("Please fill in all fields."); return;
        }
        if (!user) {
            setError("You must be signed in to post."); return;
        }
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const postsCollectionPath = `artifacts/${appId}/public/data/posts`;
            await addDoc(collection(db, postsCollectionPath), {
                accommodationName,
                description,
                meal,
                author: user, // Save the whole user object
                firebaseUid: auth.currentUser.uid, // Save firebase UID for potential future use
                createdAt: Timestamp.now(),
            });

            setAccommodationName('');
            setDescription('');
            setMeal('fish');
            setSuccess('Your post has been successfully published!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            console.error("Error adding document: ", err);
            setError("Failed to submit post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const MealOption = ({ value, label, imageUrl, selectedMeal, setMeal }) => (
        <button type="button" onClick={() => setMeal(value)} className={`flex-1 p-4 rounded-lg text-center font-semibold transition-all duration-300 flex flex-col items-center justify-center space-y-3 border-2 ${selectedMeal === value ? 'bg-sky-500 border-sky-400 text-white shadow-lg' : 'bg-gray-700 bg-opacity-50 border-gray-600 hover:bg-gray-600 hover:border-gray-500'}`}>
            <img src={imageUrl} alt={label} className="w-20 h-20 object-contain" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/334155/e2e8f0?text=Meal'; }} />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-black bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white border-opacity-20">
                <h2 className="text-3xl font-bold text-white mb-6 text-center font-serif">Share Your Story</h2>
                <form onSubmit={handleSubmit}>
                    {/* Form fields remain the same */}
                    <div className="mb-6">
                        <label htmlFor="accommodationName" className="block text-gray-300 text-sm font-bold mb-2">Accommodation Name</label>
                        <input type="text" id="accommodationName" value={accommodationName} onChange={(e) => setAccommodationName(e.target.value)} className="w-full bg-gray-900 bg-opacity-50 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-600" placeholder="e.g., Kex Hostel, The Black Pearl" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">Your Experience</label>
                        <textarea id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-900 bg-opacity-50 text-white rounded-lg py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-sky-500 border border-gray-600" placeholder="Describe the place, the views, the vibe..." required></textarea>
                    </div>
                    <div className="mb-8">
                        <label className="block text-gray-300 text-sm font-bold mb-3">What did you eat?</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-white">
                           {mealOptions.map(option => <MealOption key={option.value} {...option} selectedMeal={meal} setMeal={setMeal}/>)}
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                    {success && <p className="text-green-400 text-center mb-4">{success}</p>}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 text-lg shadow-xl">
                        {isSubmitting ? 'Publishing...' : 'Publish Post'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Main App Component ---
export default function App() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [firebaseUser, setFirebaseUser] = useState(null);

    // --- Authentication Effect ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
            } else {
                try {
                   const { user: anonUser } = await signInAnonymously(auth);
                   setFirebaseUser(anonUser);
                } catch(error) {
                   console.error("Anonymous sign-in failed: ", error);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // --- Firestore Data Fetching Effect ---
    useEffect(() => {
        if (!firebaseUser) return; // Wait for firebase auth

        const postsCollectionPath = `artifacts/${appId}/public/data/posts`;
        const q = query(collection(db, postsCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            postsData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
            setPosts(postsData);
        }, (error) => console.error("Error fetching posts: ", error));

        return () => unsubscribe();
    }, [firebaseUser]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleSignOut = () => {
        setSelectedUser(null);
        // We don't sign out from firebase, just return to the selection screen
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1502669793527-3c5719398da0?q=80&w=2670&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
             <div className="min-h-screen bg-black bg-opacity-60">
                {!selectedUser ? (
                    <UserSelectionPage onUserSelect={handleUserSelect} />
                ) : (
                    <>
                        <Header user={selectedUser} handleSignOut={handleSignOut}/>
                        <main className="container mx-auto">
                            <CreatePost user={selectedUser} />
                            <div className="border-t-2 border-white border-opacity-20 mx-8 my-8"></div>
                            <PostFeed posts={posts} />
                        </main>
                    </>
                )}
             </div>
        </div>
    );
}
