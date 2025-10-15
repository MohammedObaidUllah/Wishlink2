export interface User {
  username: string;
  password: string;
  friends: string[];
  pendingRequests: string[];
  sentRequests: string[];
  wishlists: Wishlist[];
  cart: CartItem[];
}

export interface Wishlist {
  id: string;
  title: string;
  description: string;
  category: 'public' | 'private' | 'selected';
  selectedFriends: string[];
  items: WishlistItem[];
  comments: Comment[];
  owner: string;
}

export interface WishlistItem {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends WishlistItem {
  addedFrom: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

const STORAGE_KEY = 'wishlink_data';

const defaultUsers: User[] = [
  {
    username: 'user1',
    password: 'user1pass',
    friends: ['user2'],
    pendingRequests: [],
    sentRequests: [],
    wishlists: [
      {
        id: '1',
        title: 'Dream Tech Setup',
        description: 'My ultimate tech wishlist',
        category: 'public',
        selectedFriends: [],
        items: [],
        comments: [],
        owner: 'user1'
      }
    ],
    cart: []
  },
  {
    username: 'user2',
    password: 'user2pass',
    friends: ['user1'],
    pendingRequests: [],
    sentRequests: [],
    wishlists: [
      {
        id: '2',
        title: 'Fashion Goals',
        description: 'Trendy outfits I love',
        category: 'public',
        selectedFriends: [],
        items: [],
        comments: [],
        owner: 'user2'
      }
    ],
    cart: []
  },
  {
    username: 'user3',
    password: 'user3pass',
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    wishlists: [
      {
        id: '3',
        title: 'Home Essentials',
        description: 'Things I need for my new place',
        category: 'private',
        selectedFriends: [],
        items: [],
        comments: [],
        owner: 'user3'
      }
    ],
    cart: []
  }
];

export const initializeStorage = (): void => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: defaultUsers }));
  }
};

export const resetStorage = (): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users: defaultUsers }));
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return defaultUsers;
  return JSON.parse(data).users;
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users }));
};

export const getUser = (username: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

export const updateUser = (username: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
};
