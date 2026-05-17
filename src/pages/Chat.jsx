/**
 * Chat.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main chat page. Manages conversations, messages, and the send flow.
 *
 * Upload concerns are fully delegated to useFileUpload().
 * Rendering concerns are fully delegated to MessageBubble / AttachmentRenderer.
 * This component only coordinates state, not upload logic.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, MessageCircle, UserPlus,
  Paperclip, X, Loader2, FileText, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFileUpload } from '../hooks/useFileUpload';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { formatFileSize, FILE_INPUT_ACCEPT } from '../utils/fileValidation';
import { deleteAttachment } from '../firebase/storageService';
import MessageBubble from '../components/MessageBubble';
import Avatar from '../components/Avatar';
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
} from '../firebase/chatService';

// ─── Live avatar sub-components ──────────────────────────────────────────────

/**
 * Formats a timestamp into a readable time string.
 */
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/**
 * Renders one conversation row in the sidebar.
 * Subscribes live to the peer's users/{uid} document so avatar
 * updates immediately when the peer changes their photo.
 */
const ConversationItem = ({ conv, currentUser, isActive, onClick }) => {
  const otherId = conv.participants?.find(id => id !== currentUser?.uid);
  const details = conv.participantDetails?.[otherId] || {};
  const unread  = conv.unreadCounts?.[currentUser?.uid] || 0;

  // Live avatar + level — ignores stale participantDetails.avatar
  const { avatarId, avatarUrl, level } = useUserAvatar(otherId);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
        isActive
          ? 'bg-cyan-400/[0.08] border border-cyan-400/20'
          : 'hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <Avatar avatarId={avatarId} avatarUrl={avatarUrl} size={40} className="rounded-full bg-zinc-800 border border-white/10" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
              {details.name || 'User'}
            </p>
            <span className="text-[9px] text-zinc-600 font-mono shrink-0">Lv.{level}</span>
          </div>
          <span className={`text-[10px] shrink-0 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`}>
            {formatTime(conv.lastMessageTime || conv.updatedAt)}
          </span>
        </div>
        <p className={`text-xs truncate ${unread > 0 ? 'text-white font-medium' : 'text-zinc-500'}`}>
          {conv.lastMessage || 'Start a conversation'}
        </p>
      </div>
    </button>
  );
};

/**
 * Renders the peer avatar + name in the active chat header.
 * Subscribes live to users/{uid} so avatar is always current.
 */
const LivePeerAvatar = ({ uid, fallbackName }) => {
  const { avatarId, avatarUrl, level } = useUserAvatar(uid);
  return (
    <>
      <Avatar avatarId={avatarId} avatarUrl={avatarUrl} size={36} className="rounded-full bg-zinc-800 border border-white/10" />
      <div>
        <div className="flex items-center gap-2 leading-none mb-1">
          <h3 className="text-sm font-semibold text-white">
            {fallbackName || 'Chat'}
          </h3>
          <span className="text-[9px] text-zinc-600 font-mono">Lv.{level}</span>
        </div>
        <p className="text-[11px] text-zinc-500">SkillSwap Member</p>
      </div>
    </>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Chat = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // ── Conversation / message state ────────────────────────────────────────
  const [conversations,       setConversations]       = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages,             setMessages]             = useState([]);
  const [newMessage,           setNewMessage]           = useState('');
  const [loading,              setLoading]              = useState(true);
  const [searchQuery,          setSearchQuery]          = useState('');
  const [showMobileChat,       setShowMobileChat]       = useState(false);
  const [sending,              setSending]              = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);

  // ── Upload state — fully managed by the hook ────────────────────────────
  const {
    file,
    previewUrl,
    isUploading,
    progress,
    error:        uploadError,
    selectFile,
    removeFile,
    cancelUpload,
    clearError,
    startUpload,
  } = useFileUpload();

  // ── Subscribe to conversations ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToConversations(currentUser.uid, (data) => {
      setConversations(data);
      setLoading(false);
      if (data.length > 0 && !activeConversationId) {
        setActiveConversationId(data[0].id);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // ── Subscribe to messages ───────────────────────────────────────────────
  useEffect(() => {
    if (!activeConversationId) { setMessages([]); return; }
    const unsub = subscribeToMessages(activeConversationId, (data) => {
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });
    if (currentUser) markConversationAsRead(activeConversationId, currentUser.uid);
    return () => unsub();
  }, [activeConversationId, currentUser]);

  // ── File input handler ──────────────────────────────────────────────────
  const handleFileInputChange = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    selectFile(picked);           // validates + stages; sets error if invalid
    e.target.value = '';          // reset so same file can be re-selected
  };

  // ── Send message ────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !activeConversationId || !currentUser || sending || isUploading) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    let attachment = null;

    try {
      if (file) {
        attachment = await startUpload(activeConversationId); // pass conversationId for storage path
        removeFile();                     // clear staged file on success
      }

      const activeConv = conversations.find(c => c.id === activeConversationId);

      console.log('[Chat] Sending message:', { text, attachment });

      await sendMessage(
        activeConversationId,
        currentUser.uid,
        text,
        activeConv?.participants || [],
        attachment
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Chat] Upload cancelled by user.');
      } else {
        console.error('[Chat] Send failed:', err);
        if (text) setNewMessage(text); // restore text on failure
      }
    } finally {
      setSending(false);
    }
  }, [newMessage, file, activeConversationId, currentUser, sending, isUploading, startUpload, removeFile, conversations]);

  // ── Delete message ────────────────────────────────────────────────────────
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!activeConversationId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;
    
    try {
      // Capture storagePath before the Firestore doc disappears
      const targetMsg = messages.find(m => m.id === messageId);
      const storagePath = targetMsg?.attachment?.storagePath ?? null;

      await deleteMessage(activeConversationId, messageId);

      // Clean up the Storage file if one exists (safe — ignores already-deleted)
      if (storagePath) {
        await deleteAttachment(storagePath);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
      alert('Failed to delete message. Please try again.');
    }
  }, [activeConversationId, messages]);

  // ── Derived values ──────────────────────────────────────────────────────
  const activeConversation      = conversations.find(c => c.id === activeConversationId);
  const otherParticipantId      = activeConversation?.participants?.find(id => id !== currentUser?.uid);
  const otherParticipantDetails = activeConversation?.participantDetails?.[otherParticipantId] || {};

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const otherId  = c.participants?.find(id => id !== currentUser?.uid);
    const details  = c.participantDetails?.[otherId];
    return details?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate?.() || new Date(timestamp);
    const diff  = Date.now() - date;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-[calc(100dvh-64px)] lg:h-[100dvh] flex items-center justify-center bg-[#0d0d0f]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100dvh-64px)] lg:h-[100dvh] w-full bg-[#0d0d0f] flex overflow-hidden">

      {/* ── Conversations Sidebar ─────────────────────────────────────── */}
      <div className={`w-full md:w-72 lg:w-80 border-r border-white/[0.06] flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg focus:outline-none focus:border-cyan-400/30 text-sm text-white placeholder:text-zinc-600 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageCircle className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-sm font-medium text-zinc-400 mb-1">No conversations yet</p>
              <p className="text-xs text-zinc-600 mb-5 leading-relaxed">
                Accept a request or browse skills to start chatting with peers.
              </p>
              <button
                onClick={() => navigate('/browse')}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 text-xs font-medium rounded-lg transition-colors"
              >
                <UserPlus size={14} />
                Browse Skills
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  currentUser={currentUser}
                  isActive={activeConversationId === conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setShowMobileChat(true);
                    markConversationAsRead(conv.id, currentUser.uid);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Area ─────────────────────────────────────────────────── */}
      <div className={`flex-1 flex-col relative ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/[0.04] blur-[100px] rounded-full pointer-events-none" />

        {activeConversationId ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 -ml-1 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Back to conversations"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <LivePeerAvatar
                  uid={otherParticipantId}
                  fallbackName={otherParticipantDetails.name}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 z-10 scrollbar-thin scrollbar-thumb-white/[0.07] scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isMe={msg.senderId === currentUser?.uid} onDelete={() => handleDeleteMessage(msg.id)} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/[0.06] bg-[#0d0d0f]/80 backdrop-blur-md z-10 shrink-0">

              {/* File attachment / progress / error strip */}
              <AnimatePresence>
                {(file || isUploading || uploadError) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">

                      {/* Error */}
                      {uploadError && !isUploading && (
                        <>
                          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
                            <AlertCircle size={18} className="text-red-400" />
                          </div>
                          <p className="flex-1 text-xs text-red-400 truncate">{uploadError}</p>
                          <button
                            type="button"
                            onClick={clearError}
                            className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}

                      {/* Uploading */}
                      {isUploading && (
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                              Uploading {file?.name}...
                            </span>
                            <div className="flex items-center gap-2">
                              <span>{progress}%</span>
                              <button
                                type="button"
                                onClick={cancelUpload}
                                className="text-[10px] text-red-400 hover:text-red-300 font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-cyan-400"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* File staged, not yet uploading */}
                      {file && !isUploading && !uploadError && (
                        <>
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10">
                            {previewUrl ? (
                              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText size={22} className="text-zinc-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-1.5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept={FILE_INPUT_ACCEPT}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="shrink-0 w-11 h-11 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all disabled:opacity-50"
                  aria-label="Attach file"
                >
                  <Paperclip size={18} />
                </button>

                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={isUploading ? 'Uploading…' : 'Message…'}
                    rows={1}
                    disabled={isUploading}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400/40 resize-none scrollbar-none placeholder:text-zinc-600 transition-all disabled:opacity-50"
                    style={{ minHeight: '46px', maxHeight: '120px' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !file) || sending || isUploading}
                  className="shrink-0 w-11 h-11 flex items-center justify-center bg-cyan-400 text-zinc-950 rounded-xl hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  aria-label="Send message"
                >
                  {isUploading || sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={16} className="ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-white/[0.06] flex items-center justify-center mb-5">
              <MessageCircle className="w-7 h-7 text-zinc-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Your Messages
            </h3>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed mb-6">
              Select a conversation from the left, or accept an exchange request to start chatting.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/20 text-sm font-medium rounded-lg transition-colors"
            >
              <UserPlus size={16} />
              Find People to Chat With
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
