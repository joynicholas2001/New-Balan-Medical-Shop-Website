// Mock API Service

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Data
// Load from local storage if available, otherwise use defaults
const DEFAULT_USERS = [
    {
        id: '1',
        name: 'John Doe',
        email: 'itzjoynicholas@gmail.com',
        password: 'joy@123',
        phone: '+91 98765 43210',
        city: 'Bangalore',
        age: 28,
        membership: 'Gold Member'
    }
];

let MOCK_USERS = JSON.parse(localStorage.getItem('nb_mock_users')) || DEFAULT_USERS;

const saveMockUsers = () => {
    localStorage.setItem('nb_mock_users', JSON.stringify(MOCK_USERS));
};

const MOCK_SESSIONS = [
    {
        id: 's1',
        title: 'Morning Yoga Flow',
        instructor: 'Dr. Sarah Smith',
        date: '2026-01-15',
        time: '07:00 AM',
        location: 'Main Studio',
        status: 'Upcoming'
    },
    {
        id: 's2',
        title: 'Full Body HIIT',
        instructor: 'Mike Ross',
        date: '2026-01-18',
        time: '06:00 PM',
        location: 'Zone A',
        status: 'Upcoming'
    },
    {
        id: 's3',
        title: 'Meditation & Breath',
        instructor: 'Priya Kapoor',
        date: '2026-01-10',
        time: '08:00 AM',
        location: 'Garden Area',
        status: 'Completed'
    }
];

export const api = {
    // Auth
    login: async (email, password) => {
        await delay(800);
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        if (user) {
            return {
                token: 'mock-jwt-token-' + Date.now(),
                user: { ...user, role: 'customer' }
            };
        }
        throw new Error('Invalid email or password');
    },

    register: async (userData) => {
        await delay(1000);
        const exists = MOCK_USERS.find(u => u.email === userData.email);
        if (exists) throw new Error('Email already registered');

        const newUser = {
            id: Date.now().toString(),
            ...userData,
            membership: 'Bronze Member' // Default
        };
        MOCK_USERS.push(newUser);
        saveMockUsers();

        return {
            token: 'mock-jwt-token-' + Date.now(),
            user: { ...newUser, role: 'customer' }
        };
    },

    // Data
    getProfile: async () => {
        await delay(500);
        // In real app, verify token. Here assume success for last user
        return MOCK_USERS[MOCK_USERS.length - 1];
    },

    updateProfile: async (id, updates) => {
        await delay(600);
        MOCK_USERS = MOCK_USERS.map(u => u.id === id ? { ...u, ...updates } : u);
        saveMockUsers();
        return MOCK_USERS.find(u => u.id === id);
    },

    getSessions: async () => {
        await delay(700);
        return MOCK_SESSIONS;
    },

    getTicket: async (sessionId) => {
        await delay(500);
        return MOCK_SESSIONS.find(s => s.id === sessionId);
    }
};
