import { User, SignUpData } from '../types';
import { users as initialUsers } from '../constants';

const USERS_KEY = 'connectsphere_users';
const SESSION_KEY = 'connectsphere_session';

const initializeUsers = () => {
    if (!localStorage.getItem(USERS_KEY)) {
        const usersWithPasswords = Object.values(initialUsers).reduce((acc, user) => {
            acc[user.email] = { ...user, password: 'password123' };
            return acc;
        }, {} as Record<string, User & { password?: string }>);
        localStorage.setItem(USERS_KEY, JSON.stringify(usersWithPasswords));
    }
};

initializeUsers();

const getUsers = (): Record<string, User & { password?: string }> => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
};

const saveUsers = (users: Record<string, User & { password?: string }>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
    login: (email: string, password: string): Promise<User | null> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                const user = users[email];
                if (user && user.password === password) {
                    localStorage.setItem(SESSION_KEY, JSON.stringify(user.id));
                    const { password, ...userWithoutPassword } = user;
                    resolve(userWithoutPassword as User);
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    },

    signUp: (userData: SignUpData): Promise<User> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = getUsers();
                if (users[userData.email]) {
                    return reject(new Error('Email already exists'));
                }

                const newUser: User & { password?: string } = {
                    ...userData,
                    id: `u${Date.now()}`,
                    handle: userData.name.toLowerCase().replace(/\s/g, '_'),
                    jobTitle: '',
                    location: '',
                    tags: [],
                    coverImage: `https://picsum.photos/seed/cover${Date.now()}/1200/400`,
                    followingCount: 0,
                    followerCount: 0,
                    postCount: 0,
                };
                
                users[newUser.email] = { ...newUser, password: userData.password };
                saveUsers(users);

                const { password, ...userWithoutPassword } = newUser;
                resolve(userWithoutPassword as User);
            }, 1500);
        });
    },

    logout: () => {
        localStorage.removeItem(SESSION_KEY);
    },

    checkSession: (): Promise<User | null> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
                if (userId) {
                    const users = getUsers();
                    const user = Object.values(users).find(u => u.id === userId);
                    if (user) {
                        const { password, ...userWithoutPassword } = user;
                        resolve(userWithoutPassword as User);
                    } else {
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            }, 500);
        });
    },

    updateUser: (updatedUser: User) => {
        const users = getUsers();
        if (users[updatedUser.email]) {
            const password = users[updatedUser.email].password;
            users[updatedUser.email] = { ...updatedUser, password };
            saveUsers(users);
        }
    },

    sendPasswordResetLink: (email: string): Promise<void> => {
        return new Promise(resolve => {
            // Simulate sending an email, always resolves successfully for security
            setTimeout(() => {
                console.log(`Password reset link sent to ${email} (if it exists).`);
                resolve();
            }, 1000);
        });
    }
};