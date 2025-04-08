import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiBookOpen, FiChevronRight, FiCheck, FiLock, FiPlay, 
  FiBookmark, FiShare2, FiDownload, FiMessageSquare, FiSettings, 
  FiMaximize, FiMinimize, FiPause, FiSkipBack, FiSkipForward, 
  FiVolume2, FiVolumeX, FiX, FiMenu, FiList, FiFileText, FiCode, 
  FiExternalLink } from "react-icons/fi";
import { Select } from "../ui/select";

// Types
interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  isLocked?: boolean;
  videoUrl?: string;
  resources?: Resource[];
  transcript?: string;
}

interface Resource {
  title: string;
  type: "pdf" | "code" | "link";
  url: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  progress: number;
  instructor: string;
  instructorAvatar: string;
  modules: Module[];
}

// Helper components
const VideoPlayer = ({ url, onProgress, onComplete }: { 
  url: string; 
  onProgress: (progress: number) => void;
  onComplete: () => void;
}) => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    onProgress(state.played * 100);
    setCurrentTime(state.playedSeconds);
    
    // Auto-mark as complete when reaching 90%
    if (state.played > 0.9) {
      onComplete();
    }
  };
  
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    
    // For hours:minutes:seconds format (like YouTube)
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    // Format like YouTube - only show hours if needed
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    } else {
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };
  
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-black w-full ${fullscreen ? 'fixed inset-0 z-50' : 'aspect-video rounded-lg overflow-hidden'}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={1}
          onProgress={handleProgress}
          onDuration={setDuration}
          progressInterval={1000}
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            youtube: {
              playerVars: {
                disablekb: 1,
                controls: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3
              }
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
                style: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }
              }
            }
          }}
        />
      </div>
      
      {/* Video controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        {/* Progress bar */}
        <div className="mb-4 flex items-center">
          <div className="relative w-full h-1.5 bg-zinc-700 rounded-full cursor-pointer">
            <div 
              className="absolute h-full bg-[#f0bb1c] rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTime(newTime);
                playerRef.current?.seekTo(newTime, 'seconds');
              }}
              className="absolute w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="ml-2 text-xs text-white min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                const newTime = Math.max(0, currentTime - 10);
                setCurrentTime(newTime);
                playerRef.current?.seekTo(newTime, 'seconds');
              }}
              className="text-white hover:text-[#f0bb1c] transition-colors"
              aria-label="Rewind 10 seconds"
            >
              <FiSkipBack className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setPlaying(!playing)}
              className="text-white hover:text-[#f0bb1c] transition-colors"
            >
              {playing ? <FiPause className="w-6 h-6" /> : <FiPlay className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={() => {
                const newTime = Math.min(duration, currentTime + 10);
                setCurrentTime(newTime);
                playerRef.current?.seekTo(newTime, 'seconds');
              }}
              className="text-white hover:text-[#f0bb1c] transition-colors"
              aria-label="Forward 10 seconds"
            >
              <FiSkipForward className="w-4 h-4" />
            </button>
            
            <div className="flex items-center ml-2">
              <button 
                onClick={() => setMuted(!muted)}
                className="text-white hover:text-[#f0bb1c] transition-colors mr-2"
              >
                {muted || volume === 0 ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
              </button>
              
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 accent-[#f0bb1c]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-[#f0bb1c] transition-colors"
            >
              {fullscreen ? <FiMinimize className="w-4 h-4" /> : <FiMaximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseLearningPage = ({ course, initialLessonId }: { course: Course; initialLessonId?: string }) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'resources' | 'notes' | 'transcript'>('curriculum');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(initialLessonId || null);
  const [lessonProgress, setLessonProgress] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  // Find current module and lesson
  const currentLesson = currentLessonId 
    ? course.modules.flatMap(m => m.lessons).find(l => l.id === currentLessonId)
    : null;
  
  const currentModule = currentLesson 
    ? course.modules.find(m => m.lessons.some(l => l.id === currentLessonId))
    : null;
  
  // Auto-set active module when lesson changes
  useEffect(() => {
    if (currentModule) {
      setActiveModuleId(currentModule.id);
    } else if (course.modules.length > 0) {
      setActiveModuleId(course.modules[0].id);
    }
  }, [currentLessonId, currentModule, course.modules]);
  
  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };
  
  // Find next lesson
  const findNextLesson = (currentLessonId: string): string | null => {
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex < 0 || currentIndex === allLessons.length - 1) return null;
    
    return allLessons[currentIndex + 1].id;
  };
  
  // When lesson completes
  const handleLessonComplete = () => {
    if (currentLessonId) {
      markLessonComplete(currentLessonId);
    }
  };
  
  // Calculate course progress
  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const courseProgress = Math.round((completedLessons.size / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top navigation */}
      <div className="border-b border-zinc-800 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-zinc-400 hover:text-white transition-colors"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-semibold text-white line-clamp-1">
                {course.title}
              </h1>
              <div className="flex items-center text-xs text-zinc-400">
                <span>{courseProgress}% complete</span>
                <span className="mx-2">•</span>
                <span>Instructor: {course.instructor}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-zinc-400 hover:text-white transition-colors">
              <FiBookmark className="w-5 h-5" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <FiShare2 className="w-5 h-5" />
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
              <FiSettings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-zinc-800">
          <div 
            className="h-1 bg-[#f0bb1c]" 
            style={{ width: `${courseProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side panel - Course curriculum */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-r border-zinc-800 bg-zinc-900/50 h-full overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-sm border-b border-zinc-800 p-3">
                <h2 className="text-white font-medium">Course Content</h2>
              </div>
              
              <div className="p-3">
                {course.modules.map(module => (
                  <div key={module.id} className="mb-2 border border-zinc-800 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                      className="w-full flex justify-between items-center p-3 bg-zinc-900/50 text-left"
                    >
                      <div>
                        <h3 className="text-white font-medium text-sm">{module.title}</h3>
                        <p className="text-xs text-zinc-400">
                          {module.lessons.length} lessons • {
                            module.lessons.filter(l => completedLessons.has(l.id)).length
                          } completed
                        </p>
                      </div>
                      <FiChevronRight 
                        className={`h-4 w-4 text-zinc-400 transition-transform ${
                          activeModuleId === module.id ? 'transform rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeModuleId === module.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-2 divide-y divide-zinc-800/50">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className={`p-2 flex justify-between items-center 
                                  ${currentLessonId === lesson.id ? 'bg-[#f0bb1c]/10' : ''} 
                                  ${completedLessons.has(lesson.id) ? 'bg-zinc-900/20' : 'hover:bg-zinc-900/30 cursor-pointer'} 
                                  ${lesson.isLocked ? 'opacity-60' : ''} 
                                  transition-colors rounded-md`}
                                onClick={() => {
                                  if (!lesson.isLocked) {
                                    setCurrentLessonId(lesson.id);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  <div className={`mr-2 h-7 w-7 rounded-full flex items-center justify-center
                                    ${completedLessons.has(lesson.id) ? 'bg-[#f0bb1c]/20 text-[#f0bb1c]' : lesson.isLocked ? 'bg-zinc-800/50 text-zinc-500' : 'bg-zinc-800 text-zinc-300'}`}
                                  >
                                    {completedLessons.has(lesson.id) ? (
                                      <FiCheck className="h-3 w-3" />
                                    ) : lesson.isLocked ? (
                                      <FiLock className="h-3 w-3" />
                                    ) : (
                                      <FiPlay className="h-3 w-3" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className={`text-xs font-medium ${lesson.isLocked ? 'text-zinc-500' : currentLessonId === lesson.id ? 'text-[#f0bb1c]' : 'text-white'}`}>
                                      {lesson.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500">{lesson.duration}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto bg-zinc-950">
          {currentLesson ? (
            <div className="p-4 space-y-6">
              {/* Video area */}
              <div className="w-full bg-black rounded-lg overflow-hidden">
                <VideoPlayer 
                  url={currentLesson.videoUrl || "https://www.youtube.com/watch?v=ysz5S6PUM-U"} 
                  onProgress={setLessonProgress}
                  onComplete={() => handleLessonComplete()}
                />
              </div>
              
              {/* Lesson info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">{currentLesson.title}</h1>
                  {currentModule && (
                    <p className="text-sm text-zinc-400">{currentModule.title}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mt-3 md:mt-0">
                  <button className="flex items-center text-xs text-white bg-zinc-800 hover:bg-zinc-700 rounded-full px-3 py-1.5">
                    <FiDownload className="mr-1 h-3 w-3" />
                    Resources
                  </button>
                  
                  {currentLessonId && !completedLessons.has(currentLessonId) && (
                    <button 
                      onClick={() => markLessonComplete(currentLessonId)}
                      className="flex items-center text-xs text-black bg-[#f0bb1c] hover:bg-[#e0ab1c] rounded-full px-3 py-1.5"
                    >
                      <FiCheck className="mr-1 h-3 w-3" />
                      Mark complete
                    </button>
                  )}
                  
                  {currentLessonId && completedLessons.has(currentLessonId) && (
                    <button className="flex items-center text-xs text-white bg-green-600/30 rounded-full px-3 py-1.5">
                      <FiCheck className="mr-1 h-3 w-3" />
                      Completed
                    </button>
                  )}
                  
                  {currentLessonId && findNextLesson(currentLessonId) && (
                    <button 
                      onClick={() => {
                        const nextId = findNextLesson(currentLessonId);
                        if (nextId) setCurrentLessonId(nextId);
                      }}
                      className="flex items-center text-xs text-white bg-zinc-800 hover:bg-zinc-700 rounded-full px-3 py-1.5"
                    >
                      Next lesson
                      <FiChevronRight className="ml-1 h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-zinc-800">
                <div className="flex space-x-4">
                  {[
                    { id: 'transcript', label: 'Transcript' },
                    { id: 'resources', label: 'Resources' },
                    { id: 'notes', label: 'Notes' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-2 text-sm font-medium transition-colors ${
                        activeTab === tab.id 
                          ? 'text-[#f0bb1c] border-b-2 border-[#f0bb1c]' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tab content */}
              <div className="min-h-[200px]">
                {activeTab === 'transcript' && (
                  <div className="text-sm text-zinc-300 space-y-4 max-w-3xl">
                    {currentLesson.transcript || (
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center text-zinc-400">
                        Transcript not available for this lesson
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'resources' && (
                  <div>
                    {currentLesson.resources && currentLesson.resources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {currentLesson.resources.map((resource, idx) => (
                          <div 
                            key={idx}
                            className="p-4 border border-zinc-800 rounded-lg bg-zinc-900/50 flex items-center"
                          >
                            <div className="h-10 w-10 rounded bg-[#f0bb1c]/20 text-[#f0bb1c] flex items-center justify-center mr-3">
                              {resource.type === 'pdf' && <FiFileText className="h-5 w-5" />}
                              {resource.type === 'code' && <FiCode className="h-5 w-5" />}
                              {resource.type === 'link' && <FiExternalLink className="h-5 w-5" />}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-white">{resource.title}</h3>
                              <p className="text-xs text-zinc-400 capitalize">{resource.type}</p>
                            </div>
                            <button className="ml-auto text-[#f0bb1c] hover:text-[#e0ab1c]">
                              <FiDownload className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center text-zinc-400">
                        No resources available for this lesson
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'notes' && (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full h-40 bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white text-sm resize-none focus:border-[#f0bb1c] focus:ring-1 focus:ring-[#f0bb1c] focus:outline-none"
                      placeholder="Take notes for this lesson..."
                    />
                    <div className="flex justify-end">
                      <button className="bg-[#f0bb1c] text-black px-4 py-2 rounded text-sm font-medium hover:bg-[#e0ab1c] transition-colors">
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400">
              <div className="text-center p-6">
                <FiList className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <h3 className="text-xl font-medium text-white mb-2">No Lesson Selected</h3>
                <p className="text-sm">Select a lesson from the curriculum to begin learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage; 