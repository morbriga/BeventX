// app/page.jsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Image, Video, Mic, Play, Pause, RefreshCw, Zap, Share2, Heart, MessageSquare } from 'lucide-react';

// דף כניסה (בלי שינוי)
function LandingPage({ onJoin }) {
  const [eventCode, setEventCode] = useState('');
  const [lang, setLang] = useState('he');
  const isHebrew = lang === 'he';

  const handleJoin = () => {
    if (eventCode.trim()) onJoin(eventCode);
  };

  return (
    <div
      dir={isHebrew ? 'rtl' : 'ltr'}
      className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-tr from-rose-100 via-pink-200 to-yellow-100 text-gray-900 px-6 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 bg-[url('/confetti.svg')] bg-cover bg-center opacity-10 animate-fadeIn" />
      <motion.button
        onClick={() => setLang(isHebrew ? 'en' : 'he')}
        className="absolute top-4 left-4 z-10 text-sm underline text-pink-600"
        whileHover={{ scale: 1.05 }}
      >
        {isHebrew ? 'English' : 'עברית'}
      </motion.button>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 text-center"
      >
        <h1 className="text-6xl font-black tracking-tight mb-4 text-pink-600 drop-shadow-lg animate-pulse">
          BeventX
        </h1>
        <p className="text-xl font-medium mb-8 text-yellow-700">
          {isHebrew ? 'צלם את הרגע. תן לו לחיות.' : 'Capture the moment. Let it live.'}
        </p>
        <div className="max-w-sm mx-auto space-y-4">
          <Input
            placeholder={isHebrew ? 'הכנס קוד אירוע...' : 'Enter event code...'}
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
            className="text-black focus:ring-2 focus:ring-pink-400"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-pink-500 via-pink-400 to-yellow-400 hover:brightness-110 text-white font-bold py-3 px-6 rounded-full shadow-xl"
            >
              {isHebrew ? 'קדימה, ניכנס!' : 'Let’s Go!'}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// קומפוננטת מסך מלא חדשה
function FullScreenPost({ post, onClose, onLike, onComment, onShare }) {
  const [commentText, setCommentText] = useState('');
  const mediaRef = useRef(null);

  const toggleMedia = () => {
    if (mediaRef.current) {
      if (mediaRef.current.paused) {
        mediaRef.current.play();
        onLike(post.id, true); // עדכון מצב ה-playing
      } else {
        mediaRef.current.pause();
        onLike(post.id, false);
      }
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'BeventX Post',
        url: post.src,
      }).catch((err) => console.error('Share failed:', err));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4"
    >
      {post.type === 'photo' && (
        <img src={post.src} alt="Full post" className="max-h-[70vh] w-auto" />
      )}
      {post.type === 'video' && (
        <video
          ref={mediaRef}
          src={post.src}
          controls
          className="max-h-[70vh] w-auto"
          onPlay={() => onLike(post.id, true)}
          onPause={() => onLike(post.id, false)}
        />
      )}
      {post.type === 'audio' && (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-yellow-100 to-pink-100 p-4 rounded-lg">
          <audio ref={mediaRef} src={post.src} controls />
        </div>
      )}
      <div className="absolute bottom-16 w-full max-w-md flex flex-col gap-4 px-4">
        <div className="flex gap-4 text-white">
          <button onClick={() => onLike(post.id)} className="flex items-center gap-1">
            <Heart className={`w-6 h-6 ${post.liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
            <span>{post.likes || 0}</span>
          </button>
          <button className="flex items-center gap-1">
            <MessageSquare className="w-6 h-6 text-white" />
            <span>{post.comments?.length || 0}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto text-white">
          {post.comments?.map((comment, i) => (
            <p key={i} className="text-sm">{comment}</p>
          ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="כתוב תגובה..."
            className="flex-1 p-2 rounded bg-white/20 text-white placeholder-white/70"
          />
          <button type="submit" className="p-2 bg-pink-500 text-white rounded">שלח</button>
        </form>
      </div>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-2xl">&times;</button>
    </motion.div>
  );
}

// פיד משופר
function EventFeed({ eventName, posts, onOpenCamera, onBack }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const mediaRefs = useRef({});

  const toggleMedia = (id) => {
    const ref = mediaRefs.current[id];
    if (!ref) return;
    const post = posts.find((p) => p.id === id);
    if (post.playing) {
      ref.pause();
    } else {
      ref.play();
    }
  };

  const handleLike = (id, playing = null) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: (p.likes || 0) + (p.liked ? -1 : 1), playing: playing !== null ? playing : p.playing }
          : p
      )
    );
  };

  const handleComment = (id, comment) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, comments: [...(p.comments || []), comment] } : p
      )
    );
  };

  const renderPost = (post, i) => {
    const { id, type, src, playing = false } = post;
    let icon =
      type === 'photo' ? <Image className="w-4 h-4 text-pink-500" /> :
      type === 'video' ? <Video className="w-4 h-4 text-red-500" /> :
      <Mic className="w-4 h-4 text-yellow-600" />;

    return (
      <motion.div
        key={id}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden aspect-square cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
        onClick={() => setSelectedPost(post)}
      >
        <div className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow z-10">
          {icon}
        </div>
        {type === 'photo' && (
          <img src={src} alt="event" className="w-full h-full object-cover" />
        )}
        {type === 'video' && (
          <div className="relative w-full h-full">
            <video
              ref={(el) => (mediaRefs.current[id] = el)}
              className="w-full h-full object-cover"
              muted
              playsInline
            >
              <source src={src} type="video/webm" />
            </video>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMedia(id); }}
              className="absolute bottom-2 left-2 bg-white/90 p-2 rounded-full shadow hover:bg-pink-100 transition"
            >
              {playing ? <Pause className="w-5 h-5 text-pink-600" /> : <Play className="w-5 h-5 text-pink-600" />}
            </button>
          </div>
        )}
        {type === 'audio' && (
          <div className="flex items-center justify-center h-full p-4 bg-gradient-to-br from-yellow-100 to-pink-100">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMedia(id); }}
              className="bg-white/90 p-3 rounded-full shadow hover:bg-yellow-200 transition"
            >
              {playing ? <Pause className="w-6 h-6 text-yellow-600" /> : <Play className="w-6 h-6 text-yellow-600" />}
            </button>
            <audio ref={(el) => (mediaRefs.current[id] = el)} className="hidden">
              <source src={src} type="audio/mpeg" />
            </audio>
          </div>
        )}
      </motion.div>
    );
  };

  const [postsState, setPosts] = useState(posts);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-yellow-50 px-4 pt-6">
      <motion.div
        className="text-center pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-pink-600 drop-shadow-md">
          {eventName}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          פיד האירוע - כל הרגעים באותו מקום 🎉
        </p>
        <button onClick={onBack} className="mt-2 text-sm text-pink-600 underline">
          חזור לדף הכניסה
        </button>
      </motion.div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20 max-w-5xl mx-auto">
        {postsState.map((post, i) => renderPost(post, i))}
      </div>
      <div className="fixed bottom-8 right-8 z-10">
        <motion.button
          onClick={onOpenCamera}
          className="bg-gradient-to-r from-pink-500 to-yellow-400 text-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
        >
          <Image className="w-6 h-6" />
        </motion.button>
      </div>
      {selectedPost && (
        <FullScreenPost
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          onComment={handleComment}
          onShare={() => {}}
        />
      )}
    </div>
  );
}

// מצלמה (בלי שינוי)
function BeventXCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const longPressTimeout = useRef(null);
  const [mode, setMode] = useState('photo');
  const [flash, setFlash] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  const funMessages = [
    'אמאלה ואבאלה איזה תמונה!',
    'חשבת להיות צלם? יש לך עתיד!',
    'וואו! זה רגע של מגזין 🤩',
    'זה פשוט אמנות 🤯',
    'תנו בתיוג שמישהו אחר יהנה גם 📸',
  ];

  const startStream = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setError(null);
    } catch (err) {
      setError('לא ניתן לגשת למצלמה. בדוק הרשאות.');
      console.error('Error accessing camera:', err);
    }
  }, [facingMode]);

  useEffect(() => {
    startStream();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [startStream]);

  const takePhoto = useCallback(() => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    setPreview(imageData);
    const randomMsg = funMessages[Math.floor(Math.random() * funMessages.length)];
    setMessage(randomMsg);
    onCapture({ type: 'photo', src: imageData });
  }, [onCapture]);

  const startVideo = useCallback(() => {
    if (!stream) return;
    chunks.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      const randomMsg = funMessages[Math.floor(Math.random() * funMessages.length)];
      setMessage(randomMsg);
      onCapture({ type: 'video', src: url });
    };
    recorder.start();
    setRecording(true);
  }, [stream, onCapture]);

  const stopVideo = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }, []);

  const handlePressStart = () => {
    if (mode === 'video') {
      startVideo();
    } else {
      longPressTimeout.current = setTimeout(startVideo, 250);
    }
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimeout.current);
    if (recording) {
      stopVideo();
    } else if (mode === 'photo') {
      takePhoto();
    }
  };

  const switchCamera = () => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  const toggleFlash = () => setFlash((prev) => !prev);

  const handleShare = () => {
    if (!preview || !navigator.share) return;
    navigator.share({
      title: 'BeventX',
      text: message,
      url: preview,
    }).catch((err) => console.error('Share failed:', err));
  };

  const modes = ['photo', 'video'];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {error && (
        <div className="absolute inset-0 bg-red-100 text-red-900 text-center p-4 z-50">
          {error}
        </div>
      )}
      {!preview && stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      {preview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black z-10 flex flex-col items-center justify-center p-4 space-y-6"
        >
          {preview.includes('video') ? (
            <video src={preview} controls className="max-h-[60vh] rounded-lg shadow-lg" />
          ) : (
            <img src={preview} alt="preview" className="max-h-[60vh] rounded-lg shadow-lg" />
          )}
          <p className="text-white text-lg text-center font-medium">{message}</p>
          <motion.button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Share2 className="w-5 h-5" /> שתף
          </motion.button>
          <button
            onClick={() => { setPreview(null); onClose(); }}
            className="text-sm text-white underline hover:text-pink-300"
          >
            סגור מצלמה
          </button>
        </motion.div>
      )}
      {!preview && !error && (
        <>
          <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10">
            <motion.button
              onClick={toggleFlash}
              className="bg-white/80 p-2 rounded-full shadow hover:bg-yellow-100"
              whileHover={{ scale: 1.1 }}
            >
              <Zap className={`w-5 h-5 ${flash ? 'text-yellow-400' : 'text-gray-400'}`} />
            </motion.button>
            <motion.button
              onClick={switchCamera}
              className="bg-white/80 p-2 rounded-full shadow hover:bg-blue-100"
              whileHover={{ scale: 1.1 }}
            >
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </motion.button>
          </div>
          <div className="absolute bottom-28 w-full flex justify-center gap-8 z-10 text-white text-sm font-medium">
            {modes.map((m) => (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                className={`uppercase ${mode === m ? 'text-pink-500 font-bold' : 'text-white/70'}`}
                whileHover={{ scale: 1.1 }}
              >
                {m}
              </motion.button>
            ))}
          </div>
          <div className="absolute bottom-8 w-full p-6 flex justify-center items-center z-10">
            <motion.div
              className={`w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl transition-all ${recording ? 'ring-4 ring-red-500 scale-105' : ''}`}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-yellow-400" />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}

// אפליקציה ראשית
export default function BeventXApp() {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showCamera, setShowCamera] = useState(false);

  const handleJoin = (code) => {
    setCurrentEvent(code);
  };

  const handleCapture = (media) => {
    setPosts((prev) => [...prev, { id: Date.now(), ...media, playing: false, liked: false, likes: 0, comments: [] }]);
    setShowCamera(false);
  };

  return (
    <>
      {!currentEvent ? (
        <LandingPage onJoin={handleJoin} />
      ) : showCamera ? (
        <BeventXCamera onCapture={handleCapture} onClose={() => setShowCamera(false)} />
      ) : (
        <EventFeed
          eventName={`אירוע: ${currentEvent}`}
          posts={posts}
          onOpenCamera={() => setShowCamera(true)}
          onBack={() => setCurrentEvent(null)}
        />
      )}
    </>
  );
}