// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFzlWNPkZN9dwtOGelQpLXKALphvCIJ1k",
    authDomain: "pplperson.firebaseapp.com",
    projectId: "pplperson",
    storageBucket: "pplperson.firebasestorage.app",
    messagingSenderId: "335238836909",
    appId: "1:335238836909:web:a9e840746d152b5b3f0c24",
    measurementId: "G-DN1XKD2SK2"
};

// Initialize Firebase
// Note: Firebase SDK will be loaded from CDN in HTML
let db = null;

// Initialize Firestore
function initFirebase() {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log('Firebase initialized');
    } else if (typeof firebase !== 'undefined') {
        db = firebase.firestore();
    }
}

// Event Participants Management
const EventParticipants = {
    // Get participants for an event
    async getParticipants(eventId) {
        if (!db) {
            initFirebase();
            if (!db) {
                console.warn('Firebase not initialized, using localStorage fallback');
                return this.getParticipantsFromLocalStorage(eventId);
            }
        }

        try {
            const doc = await db.collection('events').doc(`event_${eventId}`).get();
            if (doc.exists) {
                return doc.data().participants || [];
            }
            return [];
        } catch (error) {
            console.error('Error getting participants:', error);
            return this.getParticipantsFromLocalStorage(eventId);
        }
    },

    // Add participant to an event
    async addParticipant(eventId, user) {
        if (!db) {
            initFirebase();
            if (!db) {
                console.warn('Firebase not initialized, using localStorage fallback');
                return this.addParticipantToLocalStorage(eventId, user);
            }
        }

        try {
            const eventRef = db.collection('events').doc(`event_${eventId}`);
            const eventDoc = await eventRef.get();
            
            let participants = [];
            if (eventDoc.exists) {
                participants = eventDoc.data().participants || [];
            }

            // Check if user already exists
            const existingIndex = participants.findIndex(p => p.id === user.id);
            if (existingIndex !== -1) {
                throw new Error('이미 참여한 이벤트입니다.');
            }

            // Add participant
            participants.push({
                id: user.id,
                nickname: user.nickname,
                profile_image: user.profile_image || '',
                timestamp: new Date().toISOString() // Use ISO string instead of serverTimestamp in array
            });

            await eventRef.set({
                participants: participants,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Also update localStorage as fallback
            this.addParticipantToLocalStorage(eventId, user);

            return participants;
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    },

    // Remove participant from an event
    async removeParticipant(eventId, userId) {
        if (!db) {
            initFirebase();
            if (!db) {
                console.warn('Firebase not initialized, using localStorage fallback');
                return this.removeParticipantFromLocalStorage(eventId, userId);
            }
        }

        try {
            const eventRef = db.collection('events').doc(`event_${eventId}`);
            const eventDoc = await eventRef.get();
            
            if (!eventDoc.exists) {
                return [];
            }

            let participants = eventDoc.data().participants || [];
            participants = participants.filter(p => p.id !== userId);

            await eventRef.set({
                participants: participants,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Also update localStorage as fallback
            this.removeParticipantFromLocalStorage(eventId, userId);

            return participants;
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    },

    // Subscribe to real-time updates
    subscribeToParticipants(eventId, callback) {
        if (!db) {
            initFirebase();
            if (!db) {
                console.warn('Firebase not initialized, cannot subscribe to updates');
                return () => {}; // Return empty unsubscribe function
            }
        }

        try {
            const unsubscribe = db.collection('events').doc(`event_${eventId}`)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const participants = doc.data().participants || [];
                        callback(participants);
                    } else {
                        callback([]);
                    }
                }, (error) => {
                    console.error('Error in subscription:', error);
                });

            return unsubscribe;
        } catch (error) {
            console.error('Error subscribing to participants:', error);
            return () => {};
        }
    },

    // LocalStorage fallback methods
    getParticipantsFromLocalStorage(eventId) {
        const key = `event_participants_${eventId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    addParticipantToLocalStorage(eventId, user) {
        const key = `event_participants_${eventId}`;
        let participants = this.getParticipantsFromLocalStorage(eventId);
        
        if (!participants.some(p => p.id === user.id)) {
            participants.push({
                id: user.id,
                nickname: user.nickname,
                profile_image: user.profile_image || '',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem(key, JSON.stringify(participants));
        }
        
        return participants;
    },

    removeParticipantFromLocalStorage(eventId, userId) {
        const key = `event_participants_${eventId}`;
        let participants = this.getParticipantsFromLocalStorage(eventId);
        participants = participants.filter(p => p.id !== userId);
        localStorage.setItem(key, JSON.stringify(participants));
        return participants;
    }
};

// Initialize Firebase when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

