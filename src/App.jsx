import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, setDoc } from 'firebase/firestore';
import {
Dices,
MapPin,
Calendar,
Users,
CheckCircle2,
Loader2,
PartyPopper,
Gamepad2,
Sandwich,
ArrowRight
} from 'lucide-react';

// For the preview, we'll use a placeholder image.
// To use your specific file locally, move 'Last-Minute-Games.jpg' to your src folder and uncomment the import below:
// import posterImage from './Last-Minute-Games.jpg';
const posterImage = './Last-Minute-Games.jpg';

// --- Firebase Configuration & Init ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'board-game-ny-rsvp';

export default function App() {
const [user, setUser] = useState(null);
const [rsvps, setRsvps] = useState([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

// Form State
const [formData, setFormData] = useState({
name: '',
email: '',
guests: 1,
favoriteGames: '',
dietary: ''
});

// (1) Authentication
useEffect(() => {
const initAuth = async () => {
try {
if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
await signInWithCustomToken(auth, __initial_auth_token);
} else {
await signInAnonymously(auth);
}
} catch (error) {
console.error("Auth error:", error);
}
};
initAuth();
const unsubscribe = onAuthStateChanged(auth, setUser);
return () => unsubscribe();
}, []);

// (2) Data Fetching
useEffect(() => {
if (!user) return;

const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
const unsubscribe = onSnapshot(rsvpsRef, (snapshot) => {
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
setRsvps(data);
setLoading(false);
}, (error) => {
console.error("Firestore error:", error);
setLoading(false);
});

return () => unsubscribe();
}, [user]);

// (3) Countdown Timer
useEffect(() => {
const target = new Date('January 1, 2026 00:00:00').getTime();
const interval = setInterval(() => {
const now = new Date().getTime();
const distance = target - now;

setTimeLeft({
days: Math.floor(distance / (1000 * 60 * 60 * 24)),
hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
seconds: Math.floor((distance % (1000 * 60)) / 1000)
});
}, 1000);

return () => clearInterval(interval);
}, []);

// (4) Meta Tag Injection for Previews (Best Effort)
useEffect(() => {
// This attempts to set the meta tags dynamically for link previews
// Note: Most social crawlers read the static HTML, so this is primarily for
// browser-based extensions or dynamic previewers.
const metaImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
metaImage.setAttribute('property', 'og:image');
metaImage.content = posterImage;
document.getElementsByTagName('head')[0].appendChild(metaImage);

const metaTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
metaTitle.setAttribute('property', 'og:title');
metaTitle.content = "Last Minute Board Games NYE";
document.getElementsByTagName('head')[0].appendChild(metaTitle);
}, []);

const handleSubmit = async (e) => {
e.preventDefault();
if (!user || submitting) return;
setSubmitting(true);

try {
const rsvpsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rsvps');
await addDoc(rsvpsRef, {
...formData,
timestamp: new Date().toISOString(),
userId: user.uid
});
setSubmitted(true);
} catch (error) {
console.error("Submission error:", error);
} finally {
setSubmitting(false);
}
};

const totalAttendees = rsvps.reduce((acc, curr) => acc + Number(curr.guests || 1), 0);

return (
<div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30">

    {/* --- POSTER IMAGE HERO --- */}
    {/* This ensures the image is the very first visual element */}
    <div
        className="w-full flex justify-center bg-[#2d3a54] pt-8 pb-12 px-4 shadow-2xl border-b border-white/10 relative overflow-hidden">
        {/* Background blur effect for the poster area */}
        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl" style={{ backgroundImage:
            `url(${posterImage})` }}></div>

        <div className="relative z-10 max-w-2xl w-full">
            <img src={posterImage} alt="Last Minute Board Games New Year's Eve Party"
                className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-white/10" />
        </div>
    </div>

    {/* Interactive Hero Section */}
    <div className="relative py-16 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 animate-bounce transition-all">
                <Dices size={80} className="text-amber-500" />
            </div>
            <div className="absolute bottom-20 right-20 animate-pulse">
                <Gamepad2 size={100} className="text-blue-500" />
            </div>
            <div className="absolute top-1/2 left-1/4 -rotate-12">
                <Users size={60} className="text-emerald-500" />
            </div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
            <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-6">
                <PartyPopper size={16} />
                <span>The Clock is Ticking</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                Countdown to <span className="text-amber-500">2026</span>
            </h2>

            {/* Countdown Clock */}
            <div className="flex gap-4 md:gap-8 justify-center mb-12">
                {[
                { label: 'Days', val: timeLeft.days },
                { label: 'Hours', val: timeLeft.hours },
                { label: 'Mins', val: timeLeft.minutes },
                { label: 'Secs', val: timeLeft.seconds },
                ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                    <span className="text-3xl md:text-5xl font-mono font-bold">{String(unit.val).padStart(2,
                        '0')}</span>
                    <span
                        className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mt-1">{unit.label}</span>
                </div>
                ))}
            </div>

            <button onClick={()=> document.getElementById('rsvp-section').scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold text-lg
                hover:bg-neutral-200 transition-all transform hover:scale-105"
                >
                Count Me In
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    </div>

    {/* Details Grid */}
    <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Calendar size={24} />
            </div>
            <h3 className="text-xl font-bold">When</h3>
            <p className="text-neutral-400">Dec 31, 2025<br />Starting @ 7:00 PM</p>
        </div>
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold">Where</h3>
            <p className="text-neutral-400">Manning's House<br />Charlotte, NC</p>
        </div>
        <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Sandwich size={24} />
            </div>
            <h3 className="text-xl font-bold">Food</h3>
            <p className="text-neutral-400">Food / snacks provided.<br />BYOB & your favorite board games!</p>
        </div>
    </section>

    {/* RSVP Section */}
    <section id="rsvp-section" className="bg-neutral-900/50 border-y border-neutral-800 py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">

            {/* Form Side */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-4xl font-black mb-4">Are you coming?</h2>
                    <p className="text-neutral-400 italic">"Life is a game, board games are life."</p>
                </div>

                {submitted ? (
                <div className="p-10 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-500">You're on the list!</h3>
                    <p className="text-neutral-400">We've saved your spot. See you at the table!</p>
                </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Name</label>
                            <input required
                                className="w-full bg-neutral-800 border-none rounded-2xl px-6 py-4 focus:ring-2 ring-amber-500 outline-none transition-all"
                                placeholder="Alex Player" value={formData.name} onChange={(e)=> setFormData({
                            ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Email</label>
                            <input type="email" required
                                className="w-full bg-neutral-800 border-none rounded-2xl px-6 py-4 focus:ring-2 ring-amber-500 outline-none transition-all"
                                placeholder="alex@games.com" value={formData.email} onChange={(e)=> setFormData({
                            ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Number of
                            Guests</label>
                        <select
                            className="w-full bg-neutral-800 border-none rounded-2xl px-6 py-4 focus:ring-2 ring-amber-500 outline-none transition-all appearance-none"
                            value={formData.guests} onChange={(e)=> setFormData({ ...formData, guests: e.target.value
                            })}
                            >
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}
                            </option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">What games should
                            we play?</label>
                        <textarea
                            className="w-full bg-neutral-800 border-none rounded-2xl px-6 py-4 focus:ring-2 ring-amber-500 outline-none transition-all min-h-[100px]"
                            placeholder="Catan, Terraforming Mars, Uno..." value={formData.favoriteGames}
                            onChange={(e)=> setFormData({ ...formData, favoriteGames: e.target.value })}
                                    />
                                </div>
                                <button
                                    disabled={submitting}
                                    className="w-full bg-amber-500 text-black font-black py-5 rounded-2xl hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'CONFIRM RSVP'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Guest List Side */}
                    <div className="bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-800 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                Already Coming
                                <span className="text-amber-500 text-sm bg-amber-500/10 px-2 py-0.5 rounded-full">{totalAttendees}</span>
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-neutral-600" /></div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {rsvps.length === 0 ? (
                                    <p className="text-neutral-500 text-center py-12">Be the first to RSVP!</p>
                                ) : (
                                    rsvps.map((rsvp) => (
                                        <div key={rsvp.id} className="flex items-center gap-4 bg-neutral-800/50 p-4 rounded-2xl">
                                            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-neutral-300">
                                                {rsvp.name[0]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{rsvp.name}</div>
                                                <div className="text-xs text-neutral-500 italic">Bringing {rsvp.guests} guest{rsvp.guests > 1 ? 's' : ''}</div>
                                            </div>
                                            <div className="text-amber-500/50"><Gamepad2 size={16} /></div>
                                        </div>
                                    )).reverse()
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 text-center text-neutral-600 text-sm">
                <p>&copy; 2025 Last Minute Games. Built with love for board game addicts.</p>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}} />
        </div>
    );
}