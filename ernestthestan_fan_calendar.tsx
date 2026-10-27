import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// ==========================================
// FIREBASE & CONFIG CONSTANTS
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const CATEGORIES = {
  jimmy: { 
    id: 'jimmy', 
    name: 'Jimmy', 
    icon: '🥑', 
    color: 'bg-purple-100 text-purple-900 border-purple-200', 
    dotColor: 'bg-purple-500' 
  },
  sea: { 
    id: 'sea', 
    name: 'Sea', 
    icon: '🌊', 
    color: 'bg-blue-100 text-blue-900 border-blue-200', 
    dotColor: 'bg-blue-500' 
  },
  avocean: { 
    id: 'avocean', 
    name: 'Avocean', 
    icon: '💚', 
    color: 'bg-emerald-100 text-emerald-900 border-emerald-200', 
    dotColor: 'bg-emerald-500' 
  }
};

const INITIAL_EVENTS = [
  {
    date: '2026-10-01',
    time: '18:00',
    title: 'Jimmy & Sea Kickoff Live',
    categories: ['jimmy', 'sea'],
    type: ['SPECIAL'],
    location: 'GMMTV Studio 1',
    description: 'Special start of the month live stream with Jimmy and Sea discussing upcoming fan projects.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    hashtag: '#JimmySeaLive2026',
    venueAddress: 'GMMTV Place, 50 Soi Sukhumvit 23, Bangkok'
  },
  {
    date: '2026-10-03',
    time: 'All day',
    title: 'Avocean Global Fan Project Showcase',
    categories: ['avocean'],
    type: ['SPECIAL', 'EVENT'],
    location: 'CentralWorld Atrium',
    description: 'Massive LED screen exhibition celebrating Avocean milestones and fan love.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
    hashtag: '#AvoceanGlobalDay',
    venueAddress: 'Rama I Rd, Pathum Wan, Bangkok 10330'
  },
  {
    date: '2026-10-08',
    time: '14:00',
    title: 'Jimmy Solo Brand Fanmeet',
    categories: ['jimmy'],
    type: ['EVENT'],
    location: 'Parc Paragon, Bangkok',
    description: 'Meet Jimmy for the new skincare line exclusive photocard benefit and hi-touch.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    hashtag: '#JimmyBrandMeet',
    venueAddress: 'Rama I Rd, Pathum Wan, Bangkok'
  },
  {
    date: '2026-10-11',
    time: 'All day',
    title: 'SUNDAY WITH SEA — Exclusive 30 Fans',
    categories: ['sea'],
    type: ['EVENT'],
    location: 'Private Studio Space, Thonglor',
    description: 'งานปิด เฉพาะผู้มีสิทธิ์เข้าร่วมงาน (Lucky Fans 30 ท่าน) อบอุ่นใกล้ชิดกับซี',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=600&q=80',
    hashtag: '#SundayWithSea',
    venueAddress: 'Thonglor Soi 10, Bangkok'
  },
  {
    date: '2026-10-15',
    time: '19:00',
    title: 'Jimmy, Sea & Avocean Q&A Space',
    categories: ['jimmy', 'sea', 'avocean'],
    type: ['SPECIAL'],
    location: 'Online Twitter Space & YouTube Live',
    description: 'An interactive night connecting with Avocean fandom worldwide.',
    image: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=600&q=80',
    hashtag: '#JimmySeaAvoceanSpace',
    venueAddress: 'Virtual Event'
  },
  {
    date: '2026-10-19',
    time: '06:00',
    title: 'SEA & JIMMY Movie Friends Screening',
    categories: ['jimmy', 'sea'],
    type: ['EVENT'],
    location: 'SF WORLD CINEMA CENTRAL WORLD',
    description: 'Early morning private screening with Jimmy and Sea in attendance.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    hashtag: '#JimmySeaSFScreening',
    venueAddress: 'CentralWorld 7th Floor, Bangkok'
  },
  {
    date: '2026-10-23',
    time: 'All day',
    title: 'Avocean Anniversary Cafe Party',
    categories: ['avocean'],
    type: ['SPECIAL', 'EVENT'],
    location: 'Cafe de Avocean, Ari Soi 3',
    description: 'Special themed cafe drinks, limited edition cup sleeves, and lucky draw photocard sets.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    hashtag: '#AvoceanCafe2026',
    venueAddress: 'Ari Soi 3, Phahon Yothin Rd, Bangkok'
  },
  {
    date: '2026-10-28',
    time: '16:30',
    title: 'Jimmy & Sea Magazine Photoshoot Behind the Scenes',
    categories: ['jimmy', 'sea'],
    type: ['EVENT'],
    location: 'Emsphere Urban Hall',
    description: 'Live interactive broadcasting and mini showcase for the new magazine cover release.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    hashtag: '#JimmySeaMagCover',
    venueAddress: 'Sukhumvit Rd, Khlong Ton Nuea, Bangkok'
  },
  {
    date: '2026-10-31',
    time: 'All day',
    title: 'Halloween Spooktacular with Jimmy, Sea & Avocean',
    categories: ['jimmy', 'sea', 'avocean'],
    type: ['SPECIAL', 'EVENT'],
    location: 'Dream World Theme Park Bangkok',
    description: 'Costume fan party, spooky haunted house tour, and special stage performances.',
    image: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?auto=format&fit=crop&w=600&q=80',
    hashtag: '#HalloweenJimmySeaAvocean',
    venueAddress: 'Rangsit-Ongkharak Rd, Thanyaburi, Pathum Thani'
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-10-28');
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 9 }); // October
  const [activeFilters, setActiveFilters] = useState({ jimmy: true, sea: true, avocean: true });
  const [showWeekOnly, setShowWeekOnly] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [eventForm, setEventForm] = useState({
    id: '',
    date: '2026-10-28',
    time: '12:00',
    title: '',
    categories: ['jimmy'],
    type: ['EVENT'],
    location: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    hashtag: '#ErnestTheStan',
    venueAddress: ''
  });
  const [copiedHashtag, setCopiedHashtag] = useState(false);

  // Auth & Firebase Sync
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'ernest_events');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const loaded = [];
      snapshot.forEach(docSnap => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (loaded.length > 0) {
        setEvents(loaded);
      } else {
        // Seed initial events if empty
        INITIAL_EVENTS.forEach(async (ev) => {
          await addDoc(colRef, ev);
        });
      }
    }, (err) => {
      console.error("Firestore sync error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  // Toggle filter
  const toggleFilter = (catKey) => {
    setActiveFilters(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    setCurrentMonth({ year: 2026, month: 9 });
    setSelectedDate('2026-10-28');
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Calendar grid calculation
  const calendarGrid = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.month;
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNumber: '', dateStr: '', isPadding: true });
    }
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      days.push({ dayNumber: d, dateStr, isPadding: false });
    }

    if (showWeekOnly) {
      const targetIndex = days.findIndex(d => d.dateStr === selectedDate);
      if (targetIndex !== -1) {
        const startWeek = Math.max(0, Math.floor(targetIndex / 7) * 7);
        return days.slice(startWeek, startWeek + 7);
      }
      return days.slice(0, 7);
    }

    return days;
  }, [currentMonth, showWeekOnly, selectedDate]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      return ev.categories && ev.categories.some(cat => activeFilters[cat]);
    });
  }, [events, activeFilters]);

  // Events for selected date
  const eventsForSelectedDate = useMemo(() => {
    return filteredEvents.filter(ev => ev.date === selectedDate);
  }, [filteredEvents, selectedDate]);

  // Event dots map
  const eventDatesMap = useMemo(() => {
    const map = {};
    filteredEvents.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      ev.categories.forEach(cat => {
        if (!map[ev.date].includes(cat)) {
          map[ev.date].push(cat);
        }
      });
    });
    return map;
  }, [filteredEvents]);

  const formattedSelectedDateHeader = useMemo(() => {
    if (!selectedDate) return '';
    const parts = selectedDate.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  }, [selectedDate]);

  const handleCopyHashtag = (tag) => {
    navigator.clipboard?.writeText(tag);
    setCopiedHashtag(true);
    setTimeout(() => setCopiedHashtag(false), 2000);
  };

  // Save or Update Event in Firestore
  const handleSaveEventSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'ernest_events');
    
    if (eventForm.id) {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'ernest_events', eventForm.id);
      const { id, ...data } = eventForm;
      await updateDoc(docRef, data);
    } else {
      const { id, ...data } = eventForm;
      await addDoc(colRef, data);
    }
    setIsEditing(false);
    setEventForm({
      id: '',
      date: selectedDate,
      time: '12:00',
      title: '',
      categories: ['jimmy'],
      type: ['EVENT'],
      location: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      hashtag: '#ErnestTheStan',
      venueAddress: ''
    });
  };

  const handleDeleteEvent = async (id) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'ernest_events', id);
    await deleteDoc(docRef);
    setSelectedEvent(null);
  };

  const openCreateModal = () => {
    setEventForm({
      id: '',
      date: selectedDate,
      time: '12:00',
      title: '',
      categories: ['jimmy'],
      type: ['EVENT'],
      location: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      hashtag: '#ErnestTheStan',
      venueAddress: ''
    });
    setIsEditing(true);
  };

  const openEditModal = (ev) => {
    setEventForm(ev);
    setSelectedEvent(null);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#f5fbf7] text-slate-800 font-sans pb-32 selection:bg-emerald-200">
      
      {/* Top Header */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-emerald-200 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                alt="Avatar"
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Hey ErnestTheStan!</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {monthNames[currentMonth.month]} {currentMonth.year}
              </h1>
            </div>
          </div>

          {/* Month Navigation & Add Button */}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-emerald-100">
            <button 
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-50 text-slate-700 transition"
              title="Previous Month"
            >
              &lt;
            </button>
            <button 
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-emerald-50 text-slate-700 transition"
              title="Next Month"
            >
              &gt;
            </button>
            <button 
              onClick={handleToday}
              className="px-3 h-8 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Jimmy: Purple, Sea: Blue, Avocean: Green) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const isActive = activeFilters[key];
            return (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border transition-all shadow-sm ${
                  isActive 
                    ? cat.color + ' font-semibold ring-2 ring-offset-1 ring-emerald-200/50 scale-[1.02]' 
                    : 'bg-white/50 text-slate-400 border-slate-200 line-through opacity-60'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-xs">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Mode Switcher */}
      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Card */}
          <div className="max-w-md mx-auto px-4">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-emerald-100/60 transition-all">
              
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 mb-2 py-1">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
                {calendarGrid.map((item, idx) => {
                  if (item.isPadding) {
                    return <div key={`pad-${idx}`} className="h-10"></div>;
                  }

                  const isSelected = selectedDate === item.dateStr;
                  const dayEvents = eventDatesMap[item.dateStr] || [];
                  const visibleDots = dayEvents.filter(cat => activeFilters[cat]);

                  return (
                    <div 
                      key={item.dateStr} 
                      className="flex flex-col items-center justify-start h-12 cursor-pointer group"
                      onClick={() => setSelectedDate(item.dateStr)}
                    >
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-md font-bold scale-110' 
                            : 'text-slate-800 hover:bg-emerald-100/60 group-hover:scale-105'
                        }`}
                      >
                        {item.dayNumber}
                      </div>

                      {/* Indicator dots */}
                      <div className="flex items-center justify-center gap-0.5 mt-0.5 h-3">
                        {visibleDots.slice(0, 3).map((catKey, dIdx) => (
                          <span 
                            key={dIdx} 
                            className={`w-1.5 h-1.5 rounded-full ${CATEGORIES[catKey].dotColor}`}
                            title={CATEGORIES[catKey].name}
                          ></span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show week only / full month toggle */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-center flex items-center justify-between">
                <button 
                  onClick={() => setShowWeekOnly(!showWeekOnly)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto transition"
                >
                  <span>{showWeekOnly ? '∨ Show full month' : '∧ Show week only'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Selected Date Events Section */}
          <div className="max-w-md mx-auto px-4 mt-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {formattedSelectedDateHeader}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={openCreateModal}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <span>+</span> Add Event
                </button>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100/80 text-emerald-900 rounded-full">
                  {eventsForSelectedDate.length} {eventsForSelectedDate.length === 1 ? 'event' : 'events'}
                </span>
              </div>
            </div>

            {eventsForSelectedDate.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-emerald-100 shadow-sm mt-3">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-emerald-200 shadow-md mb-4 bg-emerald-50">
                  <img 
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" 
                    alt="Mascot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">No events on this day</h3>
                <p className="text-xs text-slate-500 mb-4">Click "Add Event" above to create one!</p>
                <button 
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow hover:bg-slate-800 transition"
                >
                  + Add New Event
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {eventsForSelectedDate.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-slate-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                        {event.time}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {event.type && event.type.map((t, idx) => (
                          <span 
                            key={idx} 
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider ${
                              t === 'SPECIAL' 
                                ? 'bg-slate-900 text-emerald-300 shadow-sm' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {t === 'SPECIAL' ? '✨ SPECIAL' : '📍 EVENT'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">
                      {event.title}
                    </h3>

                    <div className="flex items-start gap-2 mb-3 text-xs text-slate-600">
                      <span className="text-slate-400 mt-0.5">📍</span>
                      <span className="line-clamp-1 font-medium">{event.location}</span>
                    </div>

                    {event.description && (
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        {event.description}
                      </p>
                    )}

                    {event.image && (
                      <div className="mb-3 rounded-2xl overflow-hidden h-36 w-full shadow-inner border border-slate-100">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                      <div className="flex items-center gap-1.5">
                        {event.categories && event.categories.map(catKey => (
                          CATEGORIES[catKey] ? (
                            <div key={catKey} className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 shadow-sm">
                              <span>{CATEGORIES[catKey].icon}</span>
                              <span className="text-slate-700">{CATEGORIES[catKey].name}</span>
                            </div>
                          ) : null
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition">
                        See details &gt;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* List View Mode */
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              All Upcoming Events ({filteredEvents.length})
            </h2>
            <button 
              onClick={openCreateModal}
              className="px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <span>+</span> Add Event
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredEvents.map(event => (
              <div 
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-lg border border-slate-100 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {event.date} • {event.time}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {event.type && event.type.map((t, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider ${
                          t === 'SPECIAL' 
                            ? 'bg-slate-900 text-emerald-300 shadow-sm' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t === 'SPECIAL' ? '✨ SPECIAL' : '📍 EVENT'}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition">
                  {event.title}
                </h3>

                <div className="flex items-start gap-2 mb-3 text-xs text-slate-600">
                  <span className="text-slate-400 mt-0.5">📍</span>
                  <span className="line-clamp-1 font-medium">{event.location}</span>
                </div>

                {event.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden h-36 w-full shadow-inner border border-slate-100">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <div className="flex items-center gap-1.5">
                    {event.categories && event.categories.map(catKey => (
                      CATEGORIES[catKey] ? (
                        <div key={catKey} className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 shadow-sm">
                          <span>{CATEGORIES[catKey].icon}</span>
                          <span className="text-slate-700">{CATEGORIES[catKey].name}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition">
                    Details &gt;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#f5fbf7] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-emerald-100 flex flex-col gap-5">
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
              >
                &larr;
              </button>
              <div className="flex items-center gap-1.5">
                {selectedEvent.type && selectedEvent.type.map((t, i) => (
                  <span key={i} className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-900 text-emerald-300">
                    {t === 'SPECIAL' ? '✨ SPECIAL' : '📍 EVENT'}
                  </span>
                ))}
              </div>
              <button 
                onClick={() => handleCopyHashtag(selectedEvent.hashtag)}
                className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                title="Copy Hashtag"
              >
                📤
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">{selectedEvent.title}</h2>
              <div className="flex flex-wrap gap-2">
                {selectedEvent.categories && selectedEvent.categories.map(catKey => (
                  CATEGORIES[catKey] ? (
                    <div key={catKey} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 shadow-sm">
                      <span>{CATEGORIES[catKey].icon}</span>
                      <span>{CATEGORIES[catKey].name}</span>
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                📅
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                <p className="text-sm font-bold text-slate-800">{selectedEvent.date} • Starts {selectedEvent.time}</p>
              </div>
            </div>

            {selectedEvent.image && (
              <div className="rounded-2xl overflow-hidden h-48 shadow-inner border border-emerald-100">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About Event</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venue</h4>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                <span className="text-lg">📍</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedEvent.location}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEvent.venueAddress}</p>
                </div>
              </div>

              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedEvent.location + ' ' + (selectedEvent.venueAddress || ''))}`}
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <span>🧭</span>
                <span>Directions in Google Maps</span>
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hashtags</h4>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800">{selectedEvent.hashtag}</span>
                <button 
                  onClick={() => handleCopyHashtag(selectedEvent.hashtag)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold border border-emerald-200 transition"
                >
                  {copiedHashtag ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => openEditModal(selectedEvent)}
                className="flex-1 py-3 bg-emerald-100 text-emerald-900 rounded-2xl font-semibold text-sm hover:bg-emerald-200 transition"
              >
                ✏️ Edit Event
              </button>
              <button 
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex-1 py-3 bg-rose-100 text-rose-900 rounded-2xl font-semibold text-sm hover:bg-rose-200 transition"
              >
                🗑️ Delete
              </button>
            </div>

            <button 
              onClick={() => setSelectedEvent(null)}
              className="w-full py-3 bg-slate-200 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <form 
            onSubmit={handleSaveEventSubmit}
            className="bg-[#f5fbf7] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl border border-emerald-100 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {eventForm.id ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Event Title</label>
              <input 
                type="text" 
                required
                value={eventForm.title} 
                onChange={e => setEventForm({...eventForm, title: e.target.value})}
                placeholder="e.g., Jimmy & Sea Fan Meet" 
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Date (YYYY-MM-DD)</label>
                <input 
                  type="text" 
                  required
                  value={eventForm.date} 
                  onChange={e => setEventForm({...eventForm, date: e.target.value})}
                  className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Time</label>
                <input 
                  type="text" 
                  required
                  value={eventForm.time} 
                  onChange={e => setEventForm({...eventForm, time: e.target.value})}
                  placeholder="e.g., 18:00 or All day" 
                  className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Categories (Members)</label>
              <div className="flex gap-2">
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const isChecked = eventForm.categories.includes(key);
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => {
                        const cats = isChecked 
                          ? eventForm.categories.filter(c => c !== key)
                          : [...eventForm.categories, key];
                        setEventForm({...eventForm, categories: cats});
                      }}
                      className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        isChecked ? cat.color + ' ring-2 ring-emerald-300' : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Location / Venue Name</label>
              <input 
                type="text" 
                value={eventForm.location} 
                onChange={e => setEventForm({...eventForm, location: e.target.value})}
                placeholder="e.g., GMMTV Studio 1" 
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Venue Full Address</label>
              <input 
                type="text" 
                value={eventForm.venueAddress} 
                onChange={e => setEventForm({...eventForm, venueAddress: e.target.value})}
                placeholder="e.g., Sukhumvit 23, Bangkok" 
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea 
                rows="2"
                value={eventForm.description} 
                onChange={e => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Write details..." 
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Image URL</label>
              <input 
                type="text" 
                value={eventForm.image} 
                onChange={e => setEventForm({...eventForm, image: e.target.value})}
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Hashtag</label>
              <input 
                type="text" 
                value={eventForm.hashtag} 
                onChange={e => setEventForm({...eventForm, hashtag: e.target.value})}
                className="p-3 rounded-2xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-md hover:bg-slate-800 transition mt-2"
            >
              Save Event Live
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4">
        <div className="bg-white/90 backdrop-blur-lg border border-emerald-100 shadow-2xl rounded-full p-1.5 flex items-center gap-2">
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'calendar' 
                ? 'bg-emerald-100 text-emerald-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📅</span>
            <span>Calendar</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'list' 
                ? 'bg-emerald-100 text-emerald-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>📑</span>
            <span>List</span>
          </button>
        </div>
      </div>
    </div>
  );
}