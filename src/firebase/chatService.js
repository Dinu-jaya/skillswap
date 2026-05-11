import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  getDoc,
  increment,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Conversations ──────────────────────────────────────────────────────────

/**
 * Subscribe to all conversations for a user, sorted by most recent.
 */
export const subscribeToConversations = (userId, callback) => {
  if (!userId) return () => {};

  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Sort locally so we don't need a composite Firestore index
    conversations.sort((a, b) => {
      const tA = a.lastMessageTime?.toMillis() || a.updatedAt?.toMillis() || 0;
      const tB = b.lastMessageTime?.toMillis() || b.updatedAt?.toMillis() || 0;
      return tB - tA;
    });
    callback(conversations);
  }, (error) => {
    console.error("Error subscribing to conversations:", error);
    callback([]);
  });
};

// ─── Messages ───────────────────────────────────────────────────────────────

/**
 * Subscribe to messages inside a chat, ordered oldest → newest.
 */
export const subscribeToMessages = (chatId, callback) => {
  if (!chatId) return () => {};

  const q = query(
    collection(db, `messages/${chatId}/chatMessages`),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  }, (error) => {
    console.error("Error subscribing to messages:", error);
    callback([]);
  });
};

// ─── Message type constants ───────────────────────────────────────────────────
export const MSG_TYPE = {
  TEXT:     'text',
  IMAGE:    'image',
  PDF:      'pdf',
  DOCUMENT: 'document',
};

/**
 * Derive a MSG_TYPE value from a MIME type string.
 * Falls back to 'document' for unknown/binary types.
 */
export const mimeToMsgType = (mimeType = '') => {
  if (mimeType.startsWith('image/'))                             return MSG_TYPE.IMAGE;
  if (mimeType === 'application/pdf')                           return MSG_TYPE.PDF;
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )                                                             return MSG_TYPE.DOCUMENT;
  return MSG_TYPE.DOCUMENT;
};

/**
 * Send a message inside a chat.
 *
 * Firestore schema v3 (current)
 * ─────────────────────────────
 * {
 *   type         : 'text' | 'attachment'
 *   text         : string           // caption / body (may be empty for file-only)
 *   attachment   : AttachmentMeta | null   // full Cloudinary metadata
 *   senderId     : string
 *   createdAt    : serverTimestamp
 *   timestamp    : serverTimestamp  // retained for orderBy("timestamp") query
 *   read         : boolean
 * }
 *
 * AttachmentMeta shape:
 * {
 *   type, fileCategory, mimeType, resourceType,
 *   url (secure_url), publicId, format, bytes, originalName, createdAt
 * }
 *
 * MessageBubble.normalizeMessage() handles v3, v2, and legacy shapes.
 */
export const sendMessage = async (chatId, senderId, text, participants = [], attachment = null) => {
  const trimmed = text?.trim() ?? '';
  if (!chatId || !senderId || (!trimmed && !attachment)) return;

  const messageData = {
    type:       attachment ? 'attachment' : 'text',
    text:       trimmed,
    attachment: attachment ?? null,  // full AttachmentMeta object from uploadService
    senderId,
    createdAt:  serverTimestamp(),
    timestamp:  serverTimestamp(),   // retained for orderBy compatibility
    read:       false,
  };

  console.log('[chatService] Storing message to Firestore:', messageData);

  await addDoc(collection(db, `messages/${chatId}/chatMessages`), messageData);

  // Update conversation preview metadata
  const chatRef = doc(db, 'chats', chatId);
  const lastMessagePreview = attachment
    ? (trimmed || `📎 ${attachment.originalName || 'File'}`)
    : trimmed;

  const updates = {
    lastMessage:     lastMessagePreview,
    lastMessageTime: serverTimestamp(),
    updatedAt:       serverTimestamp(),
  };

  participants.forEach((pId) => {
    if (pId !== senderId) {
      updates[`unreadCounts.${pId}`] = increment(1);
    }
  });

  await updateDoc(chatRef, updates);
};

// ─── Delete Message ──────────────────────────────────────────────────────────

/**
 * Delete a message from a chat.
 */
export const deleteMessage = async (chatId, messageId) => {
  if (!chatId || !messageId) return;
  try {
    await deleteDoc(doc(db, `messages/${chatId}/chatMessages`, messageId));
  } catch (err) {
    console.error("Error deleting message:", err);
    throw err;
  }
};

// ─── Mark as read ────────────────────────────────────────────────────────────

/**
 * Reset unread count for the current user in a chat.
 */
export const markConversationAsRead = async (chatId, userId) => {
  if (!chatId || !userId) return;
  try {
    await updateDoc(doc(db, "chats", chatId), {
      [`unreadCounts.${userId}`]: 0,
    });
  } catch (err) {
    console.error("Error marking conversation as read:", err);
  }
};

// ─── Start / Find conversation ───────────────────────────────────────────────

/**
 * Find an existing chat between two users, or create a new one.
 * Fetches real profile data from Firestore for both participants.
 * Returns the chatId.
 */
export const startConversationWithUser = async (currentUser, targetUserId, targetUserDetailsFallback = {}) => {
  if (!currentUser || !targetUserId) return null;

  // 1. Check for an existing chat between the two users
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", currentUser.uid)
  );
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find((d) =>
    d.data().participants.includes(targetUserId)
  );

  if (existing) {
    return existing.id;
  }

  // 2. Fetch real profiles to populate participantDetails
  const [currentUserDoc, targetUserDoc] = await Promise.all([
    getDoc(doc(db, "users", currentUser.uid)),
    getDoc(doc(db, "users", targetUserId)),
  ]);

  const currentUserProfile = currentUserDoc.exists() ? currentUserDoc.data() : {};
  const targetUserProfile = targetUserDoc.exists() ? targetUserDoc.data() : {};

  const currentUserDetails = {
    name: currentUserProfile.displayName || currentUserProfile.name || currentUser.displayName || currentUser.email?.split("@")[0] || "User",
    avatar: currentUserProfile.avatar || null,
    email: currentUser.email || "",
  };

  const targetUserDetails = {
    name: targetUserProfile.displayName || targetUserProfile.name || targetUserDetailsFallback.name || "Unknown User",
    avatar: targetUserProfile.avatar || targetUserDetailsFallback.avatar || null,
    email: targetUserProfile.email || "",
  };

  // 3. Create the chat document
  const newChatRef = doc(collection(db, "chats"));
  await setDoc(newChatRef, {
    chatId: newChatRef.id,
    participants: [currentUser.uid, targetUserId],
    participantDetails: {
      [currentUser.uid]: currentUserDetails,
      [targetUserId]: targetUserDetails,
    },
    lastMessage: "Say hi 👋",
    lastMessageTime: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadCounts: {
      [currentUser.uid]: 0,
      [targetUserId]: 0,
    },
  });

  return newChatRef.id;
};
