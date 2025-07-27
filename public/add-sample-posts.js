/**
 * Add Sample Posts Script
 * Adds sample posts to the database for testing
 */

// Firebase Configuration (same as firebaseConfig.js)
const firebaseConfig = {
    apiKey: "AIzaSyANHtCLmNLvp9k_px0lsUHuWK5PasK_gJY",
    authDomain: "amplifi-a54d9.firebaseapp.com",
    projectId: "amplifi-a54d9",
    storageBucket: "amplifi-a54d9.firebasestorage.app",
    messagingSenderId: "542171119183",
    appId: "1:542171119183:web:cd96402d1fe4d3ef6ef43a",
    measurementId: "G-X845LM0VSM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const samplePosts = [
    {
        title: 'Welcome to Amplifi! 🎉',
        description: 'This is a sample post to test the comment functionality. Try clicking the comment button below!',
        authorName: 'Amplifi Team',
        authorId: 'sample-user-1',
        authorPic: 'default-avatar.svg',
        mediaUrl: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        likes: 42,
        comments: 5,
        views: 1234,
        userReaction: null
    },
    {
        title: 'Test Comment System 💬',
        description: 'This post is specifically for testing comments. Leave a comment below to see how it works!',
        authorName: 'Test User',
        authorId: 'sample-user-2',
        authorPic: 'default-avatar.svg',
        mediaUrl: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        likes: 18,
        comments: 2,
        views: 567,
        userReaction: null
    },
    {
        title: 'Amplifi Features Demo 🚀',
        description: 'Explore all the amazing features of Amplifi including live streaming, music library, and more!',
        authorName: 'Demo Creator',
        authorId: 'sample-user-3',
        authorPic: 'default-avatar.svg',
        mediaUrl: 'https://images.pexels.com/photos/3183156/pexels-photo-3183156.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 10800000), // 3 hours ago
        likes: 89,
        comments: 12,
        views: 2345,
        userReaction: null
    },
    {
        title: 'Live Streaming Tips 📺',
        description: 'Learn how to create engaging live streams with our AI-powered features!',
        authorName: 'Stream Master',
        authorId: 'sample-user-4',
        authorPic: 'default-avatar.svg',
        mediaUrl: 'https://images.pexels.com/photos/3183159/pexels-photo-3183159.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 14400000), // 4 hours ago
        likes: 156,
        comments: 8,
        views: 3456,
        userReaction: null
    },
    {
        title: 'Music Library Tour 🎵',
        description: 'Discover thousands of copyright-free tracks in our music library!',
        authorName: 'Music Curator',
        authorId: 'sample-user-5',
        authorPic: 'default-avatar.svg',
        mediaUrl: 'https://images.pexels.com/photos/3183162/pexels-photo-3183162.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 18000000), // 5 hours ago
        likes: 234,
        comments: 15,
        views: 4567,
        userReaction: null
    }
];

async function addSamplePosts() {
    console.log('Adding sample posts to database...');
    
    try {
        for (const post of samplePosts) {
            await db.collection('posts').add(post);
            console.log(`Added post: ${post.title}`);
        }
        
        console.log('✅ All sample posts added successfully!');
    } catch (error) {
        console.error('❌ Error adding sample posts:', error);
    }
}

// Run the script
addSamplePosts(); 